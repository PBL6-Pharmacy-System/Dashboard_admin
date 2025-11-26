import { useState } from 'react';
import type { TransferRequest, ProductBatch } from '../types/inventory.types';

// --- MOCK DATA ---
// Giả lập Kho B (Kho xuất) có các lô hàng sau
const mockBatchesDB: Record<string, ProductBatch[]> = {
  'P1': [ // Panadol
    { id: 'B1', batchCode: 'L001', expiryDate: '2025-12-01', location: 'Kệ A1', quantity: 50 },
    { id: 'B2', batchCode: 'L002', expiryDate: '2026-06-01', location: 'Kệ A2', quantity: 100 }
  ],
  'P2': [ // Berberin
    { id: 'B3', batchCode: 'L003', expiryDate: '2025-10-01', location: 'Kệ B1', quantity: 20 } 
    // Tổng có 20, giả sử MinStock là 10 -> Chỉ lấy được 10
  ],
  'P3': [] // Siro Ho: Không có hàng
};

const initialRequests: TransferRequest[] = [
  {
    id: 'REQ-001', code: 'PN-760605', sourceBranch: 'Kho Quận 1', targetBranch: 'Kho Tổng',
    status: 'Pending', createdDate: '2025-11-22 16:12', createdBy: 'Admin',
    items: [
      { id: 'P1', name: 'Panadol Extra', category: 'Thuốc', price: 150000, totalStock: 0, minStock: 0, maxStock: 0, requestedQty: 120, allocatedQty: 0, missingQty: 0, batches: [], allocationDetails: [] },
      { id: 'P2', name: 'Berberin 100mg', category: 'Thuốc', price: 25000, totalStock: 0, minStock: 0, maxStock: 0, requestedQty: 50, allocatedQty: 0, missingQty: 0, batches: [], allocationDetails: [] },
      { id: 'P3', name: 'Siro Ho Prospan', category: 'Thuốc', price: 110000, totalStock: 0, minStock: 0, maxStock: 0, requestedQty: 30, allocatedQty: 0, missingQty: 0, batches: [], allocationDetails: [] },
    ]
  }
];

export const useStockTransfer = () => {
  const [requests, setRequests] = useState<TransferRequest[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // --- LOGIC 1: TÍNH TOÁN PHÂN BỔ (ALLOCATION) ---
  // Khi Kho B mở phiếu xem, hệ thống tự tính toán xem lấy được bao nhiêu từ lô nào
  const calculateAllocation = (req: TransferRequest) => {
    const processedItems = req.items.map(item => {
      const availableBatches = mockBatchesDB[item.id] || [];
      let remainingNeed = item.requestedQty;
      let totalAllocated = 0;
      const allocationDetails: { batchId: string, takeQty: number }[] = [];

      // Duyệt qua từng lô để lấy hàng
      const processedBatches = availableBatches.map(batch => {
        // Logic: Transferable = Quantity - MinStock (Giả sử MinStock Kho B cho mỗi lô là 5 để an toàn)
        // Trong thực tế MinStock tính trên tổng sp, ở đây giả lập đơn giản
        const safeMinStockPerBatch = 5; 
        const transferable = Math.max(0, batch.quantity - safeMinStockPerBatch);

        let take = 0;
        if (remainingNeed > 0 && transferable > 0) {
          take = Math.min(remainingNeed, transferable);
          remainingNeed -= take;
          totalAllocated += take;
          allocationDetails.push({ batchId: batch.id, takeQty: take });
        }

        // Cast to type with transferable
        return { ...batch, transferable } as ProductBatch & { transferable: number };
      });

      return {
        ...item,
        batches: processedBatches, // Danh sách lô kèm thông tin transferable
        allocationDetails,
        allocatedQty: totalAllocated,
        missingQty: item.requestedQty - totalAllocated
      };
    });

    return { ...req, items: processedItems };
  };

  const openRequestDetail = (req: TransferRequest) => {
    const calculatedReq = calculateAllocation(req);
    setSelectedRequest(calculatedReq);
    setIsDetailOpen(true);
  };

  // --- LOGIC 2: TÁCH PHIẾU (SPLIT) ---
  const splitAndApprove = () => {
    if (!selectedRequest) return;

    if (!window.confirm('Hệ thống sẽ tách các sản phẩm còn thiếu sang phiếu mới. Xác nhận?')) return;

    // 1. Phiếu Gốc (Được duyệt): Chỉ chứa số lượng ĐÃ CÓ (Allocated)
    const approvedItems = selectedRequest.items.map(item => ({
      ...item,
      requestedQty: item.allocatedQty, // Sửa yêu cầu thành số thực tế có
      missingQty: 0
    })).filter(item => item.requestedQty > 0); // Bỏ dòng nào = 0

    // 2. Phiếu Mới (Chờ duyệt): Chứa phần thiếu (Missing)
    const pendingItems = selectedRequest.items.filter(item => item.missingQty > 0).map(item => ({
      ...item,
      requestedQty: item.missingQty,
      allocatedQty: 0,
      missingQty: 0,
      batches: [],
      allocationDetails: []
    }));

    // Cập nhật State
    const updatedRequests = requests.filter(r => r.id !== selectedRequest.id);
    
    // Thêm phiếu đã duyệt
    updatedRequests.push({
      ...selectedRequest,
      status: 'Approved',
      items: approvedItems,
      code: `${selectedRequest.code}-A (Đã duyệt)`
    });

    // Thêm phiếu phần thiếu (nếu có)
    if (pendingItems.length > 0) {
      updatedRequests.push({
        ...selectedRequest,
        id: `REQ-${Date.now()}`,
        code: `${selectedRequest.code}-B (Bổ sung)`,
        status: 'Pending',
        items: pendingItems
      });
    }

    setRequests(updatedRequests);
    setIsDetailOpen(false);
  };

  // --- LOGIC 3: DUYỆT THẲNG (Nếu đủ hàng) ---
  const approveFull = () => {
    if (!selectedRequest) return;
    if (window.confirm('Xác nhận xuất kho theo yêu cầu?')) {
        setRequests(prev => prev.map(r => 
            r.id === selectedRequest.id ? { ...selectedRequest, status: 'Approved' } : r
        ));
        setIsDetailOpen(false);
    }
  };

  // --- LOGIC 4: HỦY YÊU CẦU ---
  const rejectRequest = () => {
      if(!window.confirm('Từ chối yêu cầu nhập hàng này?')) return;
      setRequests(prev => prev.map(r => 
        r.id === selectedRequest?.id ? { ...r, status: 'Cancelled' } : r
    ));
    setIsDetailOpen(false);
  }

  return {
    requests, selectedRequest, isDetailOpen,
    actions: { openRequestDetail, closeDetail: () => setIsDetailOpen(false), splitAndApprove, approveFull, rejectRequest }
  };
};