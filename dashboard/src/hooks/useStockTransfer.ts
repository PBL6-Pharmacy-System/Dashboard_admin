import { useState, useEffect, useCallback } from 'react';
import { inventoryTransferService } from '../services/inventoryTransferService';
import { batchService } from '../services/batchService';
import type { TransferRequest, ProductBatch, TransferItem } from '../types/inventory.types';

export const useStockTransfer = () => {
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load transfers from API
  const loadTransfers = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching inventory transfers...');
      const response = await inventoryTransferService.getAllTransfers();
      console.log('✅ Transfers response:', response);

      let transfersData: any[] = [];
      if (response.success === false) {
        console.error('❌ Backend error:', response.error);
        return;
      }

      // Handle different response structures
      if (Array.isArray(response.data)) {
        transfersData = response.data;
      } else if (response.data?.transfers) {
        transfersData = response.data.transfers;
      } else if (response.data?.data) {
        transfersData = response.data.data;
      }

      // Transform backend data to frontend format
      const transformedRequests: TransferRequest[] = transfersData.map((transfer: any) => ({
        id: String(transfer.id),
        code: transfer.transfer_number || `TRF-${transfer.id}`,
        sourceBranch: transfer.from_branch?.branch_name || `Chi nhánh #${transfer.from_branch_id}`,
        targetBranch: transfer.to_branch?.branch_name || `Chi nhánh #${transfer.to_branch_id}`,
        fromBranchId: transfer.from_branch_id,
        toBranchId: transfer.to_branch_id,
        status: transfer.status === 'pending' ? 'Pending' 
              : transfer.status === 'approved' ? 'Approved'
              : transfer.status === 'shipped' ? 'Shipped'
              : transfer.status === 'completed' ? 'Completed'  // ✅ FIX: Backend trả về 'completed' không phải 'received'
              : transfer.status === 'cancelled' ? 'Cancelled'
              : 'Cancelled',  // Default fallback
        createdDate: new Date(transfer.created_at).toLocaleString('vi-VN'),
        createdBy: transfer.created_by_user?.full_name || `User #${transfer.created_by}`,
        items: (transfer.items || transfer.transfer_items || []).map((item: any) => ({
          id: String(item.product_id),
          name: item.product?.name || `Sản phẩm #${item.product_id}`,
          category: item.product?.category?.name || 'Chưa phân loại',
          price: parseFloat(item.product?.price || '0'),
          totalStock: 0,
          minStock: 0,
          maxStock: 0,
          requestedQty: item.quantity,
          allocatedQty: 0,
          missingQty: 0,
          batches: [],
          allocationDetails: []
        }))
      }));

      setRequests(transformedRequests);
    } catch (error) {
      console.error('❌ Error loading transfers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  // Calculate allocation using FEFO batches from API
  const calculateAllocation = async (req: TransferRequest): Promise<TransferRequest> => {
    const processedItems: TransferItem[] = await Promise.all(
      req.items.map(async (item) => {
        try {
          // Get FEFO batches for this product at source branch
          const batchResponse = await batchService.getFEFOBatches(
            req.fromBranchId!, 
            parseInt(item.id)
          );
          
          let availableBatches: any[] = [];
          if (batchResponse.success !== false && batchResponse.data) {
            availableBatches = Array.isArray(batchResponse.data) 
              ? batchResponse.data 
              : batchResponse.data.batches || [];
          }

          let remainingNeed = item.requestedQty;
          let totalAllocated = 0;
          const allocationDetails: { batchId: string, takeQty: number }[] = [];

          // Process batches according to FEFO
          const processedBatches: (ProductBatch & { transferable: number })[] = availableBatches.map((batch: any) => {
            const available = batch.available_quantity || batch.quantity - (batch.reserved_quantity || 0);
            const safeMinStock = 5; // Reserve some stock
            const transferable = Math.max(0, available - safeMinStock);

            let take = 0;
            if (remainingNeed > 0 && transferable > 0) {
              take = Math.min(remainingNeed, transferable);
              remainingNeed -= take;
              totalAllocated += take;
              allocationDetails.push({ batchId: String(batch.id), takeQty: take });
            }

            return {
              id: String(batch.id),
              batchCode: batch.batch_number,
              expiryDate: batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString('vi-VN') : 'N/A',
              location: `Kệ ${batch.id}`,
              quantity: batch.quantity,
              transferable
            };
          });

          return {
            ...item,
            batches: processedBatches,
            allocationDetails,
            allocatedQty: totalAllocated,
            missingQty: item.requestedQty - totalAllocated
          };
        } catch (error) {
          console.error(`Error getting batches for product ${item.id}:`, error);
          return {
            ...item,
            batches: [],
            allocationDetails: [],
            allocatedQty: 0,
            missingQty: item.requestedQty
          };
        }
      })
    );

    return { ...req, items: processedItems };
  };

  const openRequestDetail = async (req: TransferRequest) => {
    try {
      const calculatedReq = await calculateAllocation(req);
      setSelectedRequest(calculatedReq);
      setIsDetailOpen(true);
    } catch (error) {
      console.error('Error opening request detail:', error);
      setSelectedRequest(req);
      setIsDetailOpen(true);
    }
  };

  // Approve transfer via API
  const approveFull = async (confirmCallback?: () => Promise<boolean>) => {
    if (!selectedRequest) return;
    if (confirmCallback && !(await confirmCallback())) return;

    try {
      await inventoryTransferService.approveTransfer(parseInt(selectedRequest.id));
      await loadTransfers();
      setIsDetailOpen(false);
      console.log('✅ Đã duyệt phiếu chuyển kho thành công!');
      return { success: true, message: 'Đã duyệt phiếu chuyển kho thành công!' };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi duyệt phiếu');
    }
  };

  // Ship transfer via API
  const shipTransfer = async (confirmCallback?: () => Promise<boolean>) => {
    if (!selectedRequest) return;
    if (confirmCallback && !(await confirmCallback())) return;

    try {
      await inventoryTransferService.shipTransfer(parseInt(selectedRequest.id));
      await loadTransfers();
      setIsDetailOpen(false);
      console.log('✅ Đã xuất kho thành công!');
      return { success: true, message: 'Đã xuất kho thành công!' };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi xuất kho');
    }
  };

  // Receive transfer via API
  const receiveTransfer = async (confirmCallback?: () => Promise<boolean>) => {
    if (!selectedRequest) return;
    if (confirmCallback && !(await confirmCallback())) return;

    try {
      await inventoryTransferService.receiveTransfer(parseInt(selectedRequest.id));
      await loadTransfers();
      setIsDetailOpen(false);
      console.log('✅ Đã nhận hàng thành công!');
      return { success: true, message: 'Đã nhận hàng thành công!' };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi nhận hàng');
    }
  };

  // Cancel transfer via API
  const rejectRequest = async () => {
    if (!selectedRequest) return;
    // TODO: Create custom input dialog for reason
    const reason = prompt('Nhập lý do hủy phiếu:');
    if (!reason) return;

    try {
      await inventoryTransferService.cancelTransfer(parseInt(selectedRequest.id), reason);
      await loadTransfers();
      setIsDetailOpen(false);
      console.log('✅ Đã hủy phiếu chuyển kho!');
      return { success: true, message: 'Đã hủy phiếu chuyển kho!' };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi hủy phiếu');
    }
  };

  // Split and approve (tách phiếu nếu thiếu hàng)
  const splitAndApprove = async (confirmCallback?: () => Promise<boolean>) => {
    if (!selectedRequest) return;
    if (confirmCallback && !(await confirmCallback())) return;

    try {
      // Duyệt phiếu hiện tại với số lượng thực có
      await inventoryTransferService.approveTransfer(parseInt(selectedRequest.id));
      
      // Tạo phiếu mới cho phần thiếu
      const missingItems = selectedRequest.items.filter(item => item.missingQty > 0);
      if (missingItems.length > 0) {
        // Tạo phiếu chuyển kho cho từng sản phẩm (backend chỉ cho phép 1 product/lần)
        for (const item of missingItems) {
          await inventoryTransferService.createTransfer({
            from_branch_id: selectedRequest.fromBranchId!,
            to_branch_id: selectedRequest.toBranchId!,
            product_id: parseInt(item.id),
            quantity: item.missingQty,
            note: `Phiếu bổ sung từ ${selectedRequest.code}`,
          });
        }
      }

      await loadTransfers();
      setIsDetailOpen(false);
      console.log('✅ Đã tách phiếu và duyệt thành công!');
      return { success: true, message: 'Đã tách phiếu và duyệt thành công!' };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Lỗi khi tách phiếu');
    }
  };

  return {
    requests, 
    selectedRequest, 
    isDetailOpen,
    loading,
    actions: { 
      openRequestDetail, 
      closeDetail: () => setIsDetailOpen(false), 
      splitAndApprove, 
      approveFull, 
      rejectRequest,
      shipTransfer,
      receiveTransfer,
      refresh: loadTransfers
    }
  };
};