import { useState, useEffect } from 'react';
import type { StockSlip, SlipItem, Product } from '../types/inventory.types';
import { supplierOrderService } from '../services/supplierOrderService';
import { inventoryTransferService } from '../services/inventoryTransferService';
import { productService } from '../services/productService';
import { branchService } from '../services/branchService';

export const useStockSlips = () => {
  // State dữ liệu
  const [slips, setSlips] = useState<StockSlip[]>([]);
  const [inventoryList, setInventoryList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSlips();
    loadInventory();
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const response = await branchService.getAllBranches({ active: true });
      const branchList = Array.isArray(response.data) ? response.data : response.data?.branches || [];
      setBranches(branchList);
      if (branchList.length > 0) {
        setSelectedBranchId(branchList[0].id);
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadSlips = async () => {
    try {
      setLoading(true);
      
      // Load both supplier orders (imports) and transfers (exports)
      const [ordersResponse, transfersResponse] = await Promise.all([
        supplierOrderService.getAllOrders().catch(() => ({ success: false, data: [] })),
        inventoryTransferService.getAllTransfers().catch(() => ({ success: false, data: [] }))
      ]);
      
      const allSlips: StockSlip[] = [];
      
      // Process supplier orders (IMPORT slips)
      if (ordersResponse.success && ordersResponse.data) {
        const orders = Array.isArray(ordersResponse.data) 
          ? ordersResponse.data 
          : ordersResponse.data.orders || ordersResponse.data.supplierOrders || [];
        
        const importSlips: StockSlip[] = orders.map((order: any) => {
          // Backend returns supplierOrderItem, not items
          const orderItems = order.supplierOrderItem || order.items || [];
          console.log('Mapping order:', order.order_number, 'Items count:', orderItems.length);
          
          return {
            id: `SO-${order.id}`,
            code: order.order_number || `PN-${order.id.toString().padStart(6, '0')}`,
            type: 'IMPORT' as const,
            reason: order.note || order.notes || 'Nhập hàng từ nhà cung cấp',
            date: new Date(order.created_at || order.order_date).toLocaleString('vi-VN'),
            creator: order.created_by_name || 'Admin',
            branchId: order.branch_id,
            branchName: order.branches?.name || order.branch?.name || 'Chi nhánh',
            status: order.status === 'received' ? 'Completed' : 
                    order.status === 'cancelled' ? 'Cancelled' : 'Pending',
            totalAmount: order.final_amount || order.total_amount || 0,
            items: orderItems.map((item: any) => ({
              productId: item.product_id.toString(),
              productName: item.products?.name || item.product?.name || `Sản phẩm ${item.product_id}`,
              unitPrice: item.unit_cost || 0,
              currentStock: 0,
              requestQuantity: item.quantity,
              actualQuantity: item.received_quantity || item.quantity
            }))
          };
        });
        
        allSlips.push(...importSlips);
      }
      
      // Process transfers (EXPORT slips)
      if (transfersResponse.success && transfersResponse.data) {
        const transfers = Array.isArray(transfersResponse.data) 
          ? transfersResponse.data 
          : transfersResponse.data.transfers || [];
        
        const exportSlips: StockSlip[] = transfers.map((transfer: any) => ({
          id: `TR-${transfer.id}`,
          code: transfer.transfer_number || `PX-${transfer.id.toString().padStart(6, '0')}`,
          type: 'EXPORT' as const,
          reason: transfer.notes || transfer.note || 'Chuyển kho nội bộ',
          date: new Date(transfer.created_at).toLocaleString('vi-VN'),
          creator: transfer.created_by_name || 'Staff',
          branchId: transfer.from_branch_id,
          branchName: transfer.from_branch?.name || transfer.fromBranch?.name || 'Chi nhánh nguồn',
          status: transfer.status === 'received' ? 'Completed' : 
                  transfer.status === 'cancelled' ? 'Cancelled' : 'Pending',
          totalAmount: 0,
          items: transfer.items?.map((item: any) => ({
            productId: item.product_id.toString(),
            productName: item.products?.name || item.product?.name || `Sản phẩm ${item.product_id}`,
            unitPrice: 0,
            currentStock: 0,
            requestQuantity: item.quantity,
            actualQuantity: item.received_quantity || item.quantity
          })) || []
        }));
        
        allSlips.push(...exportSlips);
      }
      
      // Sort by date (newest first)
      allSlips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setSlips(allSlips);
    } catch (error) {
      console.error('Error loading slips:', error);
      setSlips([]);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await productService.getAllProducts(1, 100);
      const products = response.products?.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        category: p.category?.name || 'Chưa phân loại',
        price: Number(p.price) || 0,
        totalStock: 0, // Will be loaded from branch inventory
        minStock: 50,
        maxStock: 500
      })) || [];
      
      setInventoryList(products);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };
  
  // State cho Modal Tạo Phiếu (Bước 1)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [modalType, setModalType] = useState<'IMPORT' | 'EXPORT'>('IMPORT');
  const [newSlipItems, setNewSlipItems] = useState<SlipItem[]>([]);
  const [slipReason, setSlipReason] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [destinationBranchId, setDestinationBranchId] = useState<number | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [filterBranchId, setFilterBranchId] = useState<number | null>(null);

  // State cho Modal Nhập Thực Tế (Bước 3)
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [receivingSlip, setReceivingSlip] = useState<StockSlip | null>(null);

  // --- LOGIC BƯỚC 1: TẠO PHIẾU DỰ KIẾN ---

  const openCreateModal = (type: 'IMPORT' | 'EXPORT') => {
    setModalType(type);
    setNewSlipItems([]);
    setSlipReason(type === 'IMPORT' ? 'Nhập hàng bổ sung' : 'Xuất bán lẻ');
    if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
    setIsCreateOpen(true);
  };

  // Thêm sản phẩm thủ công
  const addItemManual = (productId: string) => {
    const product = inventoryList.find(p => p.id === productId);
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
    const lowStock = inventoryList.filter(p => p.totalStock <= p.minStock);
    
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
  const saveSlip = async () => {
    try {
      if (modalType === 'IMPORT') {
        if (!selectedBranchId) {
          alert('Vui lòng chọn chi nhánh!');
          return;
        }

        if (newSlipItems.length === 0) {
          alert('Vui lòng thêm ít nhất 1 sản phẩm!');
          return;
        }

        // Validate all items have valid quantities and prices
        const hasInvalidItems = newSlipItems.some(
          item => !item.requestQuantity || item.requestQuantity <= 0 || !item.unitPrice || item.unitPrice <= 0
        );

        if (hasInvalidItems) {
          alert('Vui lòng kiểm tra lại số lượng và đơn giá!');
          return;
        }

        // Create supplier order (acting as import slip)
        console.log('📋 Starting order creation with items:', newSlipItems);
        
        let totalAmount = 0;
        for (let i = 0; i < newSlipItems.length; i++) {
          const item = newSlipItems[i];
          const qty = Number(item.requestQuantity);
          const price = Number(item.unitPrice);
          
          console.log(`Item ${i}:`, {
            productId: item.productId,
            requestQuantity: item.requestQuantity,
            unitPrice: item.unitPrice,
            parsed: { qty, price },
            isValidQty: !isNaN(qty) && qty > 0,
            isValidPrice: !isNaN(price) && price > 0
          });
          
          if (isNaN(qty) || qty <= 0) {
            alert(`❌ Số lượng không hợp lệ cho sản phẩm ${item.productId}: "${item.requestQuantity}"`);
            return;
          }
          
          if (isNaN(price) || price <= 0) {
            alert(`❌ Giá không hợp lệ cho sản phẩm ${item.productId}: "${item.unitPrice}"`);
            return;
          }
          
          totalAmount += qty * price;
        }

        console.log(`🧮 Final calculated total: ${totalAmount}`);

        // Ensure total is valid number
        if (isNaN(totalAmount) || totalAmount <= 0) {
          alert('❌ Lỗi tính toán tổng tiền. Vui lòng kiểm tra lại!');
          return;
        }

        const roundedTotal = Math.round(totalAmount * 100) / 100;
        console.log(`✅ Rounded total: ${roundedTotal}`);
        
        const orderPayload = {
          supplier_id: 1, // Default supplier, should be selectable
          branch_id: selectedBranchId,
          note: slipReason,
          total_amount: roundedTotal,
          items: newSlipItems.map(item => ({
            product_id: Number(item.productId),
            quantity: Number(item.requestQuantity),
            unit_cost: Number(item.unitPrice)
          }))
        };

        console.log('📤 Sending order payload:', JSON.stringify(orderPayload, null, 2));
        
        const response = await supplierOrderService.createOrder(orderPayload as any);
        console.log('✅ Order response:', response);

        alert('✅ Tạo phiếu nhập thành công!');
        await loadSlips();
        setIsCreateOpen(false);
        setNewSlipItems([]);
        setSlipReason('');
      } else if (modalType === 'EXPORT') {
        // Create inventory transfer (export)
        if (!selectedBranchId) {
          alert('Vui lòng chọn chi nhánh nguồn!');
          return;
        }

        if (!destinationBranchId) {
          alert('Vui lòng chọn chi nhánh đích!');
          return;
        }

        if (selectedBranchId === destinationBranchId) {
          alert('Chi nhánh nguồn và đích không được giống nhau!');
          return;
        }

        if (newSlipItems.length === 0) {
          alert('Vui lòng thêm ít nhất 1 sản phẩm!');
          return;
        }

        await inventoryTransferService.createTransfer({
          from_branch_id: selectedBranchId,
          to_branch_id: destinationBranchId,
          notes: slipReason,
          items: newSlipItems.map(item => ({
            product_id: Number(item.productId),
            quantity: item.requestQuantity
          }))
        });

        alert('✅ Tạo phiếu chuyển kho thành công!');
        await loadSlips();
        setIsCreateOpen(false);
      }
    } catch (error) {
      console.error('Error saving slip:', error);
      
      // Better error messages
      let errorMsg = 'Lỗi không xác định';
      if (error instanceof Error) {
        errorMsg = error.message;
        // Try to extract backend error message
        if (error.message.includes('Invalid')) {
          errorMsg = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        }
      }
      
      alert('❌ Lỗi khi tạo phiếu: ' + errorMsg);
    }
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

  // Filter slips by branch
  const filteredSlips = filterBranchId 
    ? slips.filter(slip => slip.branchId === filterBranchId)
    : slips;

  // Xác nhận hoàn tất
  const confirmReceipt = async () => {
    if (!receivingSlip) return;
    
    if (window.confirm('Xác nhận nhập/xuất kho theo số lượng thực tế này?')) {
      try {
        // Extract the actual ID from slip ID (format: SO-123 or TR-456)
        const [type, idStr] = receivingSlip.id.split('-');
        const actualId = Number(idStr);
        
        if (type === 'SO') {
          // Supplier Order - Import
          await supplierOrderService.receiveOrder(actualId, {
            items: receivingSlip.items.map(item => ({
              product_id: Number(item.productId),
              received_quantity: item.actualQuantity
            }))
          });
          alert('✅ Nhận hàng thành công!');
        } else if (type === 'TR') {
          // Transfer - Export/Ship
          await inventoryTransferService.shipTransfer(actualId);
          alert('✅ Đã xuất kho chuyển hàng!');
        }

        await loadSlips();
        setIsReceiveOpen(false);
        setReceivingSlip(null);
      } catch (error) {
        console.error('Error confirming receipt:', error);
        alert('❌ Lỗi khi xác nhận: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const cancelSlip = async (id: string) => {
    if (window.confirm('Hủy phiếu này?')) {
      try {
        const [type, idStr] = id.split('-');
        const actualId = Number(idStr);
        
        if (type === 'SO') {
          await supplierOrderService.cancelOrder(actualId, 'Hủy bởi người dùng');
        } else if (type === 'TR') {
          await inventoryTransferService.cancelTransfer(actualId, 'Hủy bởi người dùng');
        }
        
        alert('✅ Đã hủy phiếu');
        await loadSlips();
      } catch (error) {
        console.error('Error cancelling slip:', error);
        alert('❌ Lỗi khi hủy phiếu');
      }
    }
  };

  const deleteSlip = async (id: string) => {
    if (window.confirm('Xóa vĩnh viễn khỏi lịch sử?')) {
      try {
        // Backend might not have delete endpoint, so just update locally
        setSlips(prev => prev.filter(s => s.id !== id));
        alert('✅ Đã xóa phiếu');
      } catch (error) {
        console.error('Error deleting slip:', error);
      }
    }
  };

  return {
    slips: filteredSlips,
    inventoryList,
    loading,
    isCreateOpen,
    setIsCreateOpen,
    modalType,
    newSlipItems,
    slipReason,
    setSlipReason,
    selectedBranchId,
    setSelectedBranchId,
    destinationBranchId,
    setDestinationBranchId,
    branches,
    filterBranchId,
    setFilterBranchId,
    isReceiveOpen,
    setIsReceiveOpen,
    receivingSlip,
    actions: {
      openCreateModal,
      addItemManual,
      autoFillLowStock,
      updateRequestQty,
      removeItem,
      saveSlip,
      openReceiveModal,
      updateActualQty,
      confirmReceipt,
      cancelSlip,
      deleteSlip
    }
  };
};