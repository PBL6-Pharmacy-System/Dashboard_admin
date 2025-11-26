import { useState } from 'react';
import type { StockSlip, SlipItem, Product } from '../types/inventory.types';

// --- MOCK DATA KHO ---
const mockInventory: Product[] = [
  { id: 'P1', name: 'Panadol Extra', category: 'Thuốc', price: 150000, totalStock: 500, minStock: 100, maxStock: 1000 },
  { id: 'P2', name: 'Berberin 100mg', category: 'Tiêu hóa', price: 25000, totalStock: 10, minStock: 50, maxStock: 300 },
  { id: 'P3', name: 'Siro Ho Prospan', category: 'Thuốc Ho', price: 110000, totalStock: 5, minStock: 20, maxStock: 100 },
];

export const useStockSlips = () => {
  // State dữ liệu
  const [slips, setSlips] = useState<StockSlip[]>([]);
  
  // State cho Modal Tạo Phiếu (Bước 1)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [modalType, setModalType] = useState<'IMPORT' | 'EXPORT'>('IMPORT');
  const [newSlipItems, setNewSlipItems] = useState<SlipItem[]>([]);
  const [slipReason, setSlipReason] = useState('');

  // State cho Modal Nhập Thực Tế (Bước 3)
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [receivingSlip, setReceivingSlip] = useState<StockSlip | null>(null);

  // --- LOGIC BƯỚC 1: TẠO PHIẾU DỰ KIẾN ---

  const openCreateModal = (type: 'IMPORT' | 'EXPORT') => {
    setModalType(type);
    setNewSlipItems([]);
    setSlipReason(type === 'IMPORT' ? 'Nhập hàng bổ sung' : 'Xuất bán lẻ');
    setIsCreateOpen(true);
  };

  // Thêm sản phẩm thủ công
  const addItemManual = (productId: string) => {
    const product = mockInventory.find(p => p.id === productId);
    if (!product) return;
    
    // Check trùng
    if (newSlipItems.some(i => i.productId === productId)) return;

    const newItem: SlipItem = {
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      currentStock: product.totalStock,
      requestQuantity: 1, // Mặc định 1
      actualQuantity: 0 // Chưa nhập thực tế
    };
    setNewSlipItems([...newSlipItems, newItem]);
  };

  // Gợi ý nhập hàng tự động (Smart Fill)
  const autoFillLowStock = () => {
    if (modalType === 'EXPORT') return;
    const lowStock = mockInventory.filter(p => p.totalStock <= p.minStock);
    
    if (lowStock.length === 0) {
      alert('Kho ổn định, không cần nhập thêm!');
      return;
    }

    const items = lowStock.map(p => ({
      productId: p.id,
      productName: p.name,
      unitPrice: p.price,
      currentStock: p.totalStock,
      // Công thức: Max - Hiện tại
      requestQuantity: (p.maxStock || p.minStock * 3) - p.totalStock,
      actualQuantity: 0
    }));
    setNewSlipItems(items);
    setSlipReason('Tự động đề xuất hàng dưới định mức');
  };

  // Cập nhật số lượng dự kiến (Request Qty)
  const updateRequestQty = (index: number, val: number) => {
    const updated = [...newSlipItems];
    updated[index].requestQuantity = val > 0 ? val : 0;
    setNewSlipItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = [...newSlipItems];
    updated.splice(index, 1);
    setNewSlipItems(updated);
  };

  // Lưu phiếu (Trạng thái Pending)
  const saveSlip = () => {
    const total = newSlipItems.reduce((sum, item) => sum + (item.requestQuantity * item.unitPrice), 0);
    const newSlip: StockSlip = {
      id: `S${Date.now()}`,
      code: `${modalType === 'IMPORT' ? 'PN' : 'PX'}-${Date.now().toString().slice(-6)}`,
      type: modalType,
      reason: slipReason,
      date: new Date().toLocaleString('vi-VN'),
      creator: 'Admin',
      status: 'Pending',
      totalAmount: total,
      items: newSlipItems.map(i => ({...i, actualQuantity: i.requestQuantity})) // Mặc định Actual = Request để đỡ nhập lại
    };
    setSlips([newSlip, ...slips]);
    setIsCreateOpen(false);
  };

  // --- LOGIC BƯỚC 3: NHẬP THỰC TẾ & XÁC NHẬN ---

  const openReceiveModal = (slip: StockSlip) => {
    setReceivingSlip({ ...slip }); // Clone để sửa
    setIsReceiveOpen(true);
  };

  // Cập nhật số lượng thực tế (Actual Qty)
  const updateActualQty = (index: number, val: number) => {
    if (!receivingSlip) return;
    const updatedItems = [...receivingSlip.items];
    updatedItems[index].actualQuantity = val > 0 ? val : 0;
    setReceivingSlip({ ...receivingSlip, items: updatedItems });
  };

  // Xác nhận hoàn tất
  const confirmReceipt = () => {
    if (!receivingSlip) return;
    
    if (window.confirm('Xác nhận nhập/xuất kho theo số lượng thực tế này?')) {
      // Tính lại tổng tiền theo thực tế
      const finalTotal = receivingSlip.items.reduce((sum, item) => sum + (item.actualQuantity * item.unitPrice), 0);
      
      setSlips(prev => prev.map(s => 
        s.id === receivingSlip.id 
          ? { ...receivingSlip, totalAmount: finalTotal, status: 'Completed' } 
          : s
      ));
      
      // TODO: Ở đây sẽ gọi API cập nhật tồn kho chính (ProductStock)
      
      setIsReceiveOpen(false);
      setReceivingSlip(null);
    }
  };

  const cancelSlip = (id: string) => {
    if (window.confirm('Hủy phiếu này?')) {
      setSlips(prev => prev.map(s => s.id === id ? { ...s, status: 'Cancelled' } : s));
    }
  };

  const deleteSlip = (id: string) => {
    if (window.confirm('Xóa vĩnh viễn khỏi lịch sử?')) {
      setSlips(prev => prev.filter(s => s.id !== id));
    }
  };

  return {
    slips, inventoryList: mockInventory,
    // Create States
    isCreateOpen, setIsCreateOpen, modalType, newSlipItems, slipReason, setSlipReason,
    // Receive States
    isReceiveOpen, setIsReceiveOpen, receivingSlip,
    // Actions
    actions: {
      openCreateModal, addItemManual, autoFillLowStock, updateRequestQty, removeItem, saveSlip,
      openReceiveModal, updateActualQty, confirmReceipt,
      cancelSlip, deleteSlip
    }
  };
};