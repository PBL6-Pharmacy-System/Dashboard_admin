import { useState, useEffect, useMemo, useCallback } from 'react';
import { orderService, type Order, type OrderStatistics } from '../services/orderService';
import { useToast } from './useToast';

export const useOrderManagement = () => {
  const { showToast } = useToast();
  
  // --- STATE DATA ---
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  
  // --- PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // --- STATE FILTER ---
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    paymentStatus: 'All',
    dateFrom: '',
    dateTo: ''
  });

  // --- STATE MODAL ---
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateFormData, setUpdateFormData] = useState({
    status: '',
    note: ''
  });

  // Fetch orders from API
  const fetchOrders = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      console.log('Fetching orders, page:', page);
      const response = await orderService.getAllOrders(page, itemsPerPage);
      console.log('Orders API response:', response);
      
      if (response.success && response.data && Array.isArray(response.data.orders)) {
        setOrderList(response.data.orders);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
        console.log('Orders loaded:', response.data.orders.length);
      } else {
        console.warn('Invalid orders response, setting empty array');
        setOrderList([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('error', 'Không thể tải danh sách đơn hàng');
      setOrderList([]);
    } finally {
      setLoading(false);
    }
  }, [showToast, itemsPerPage]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      console.log('Fetching order statistics...');
      const response = await orderService.getOrderStatistics();
      console.log('Statistics response:', response);
      
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Don't show toast for statistics error
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchOrders(1);
    fetchStatistics();
  }, [fetchOrders, fetchStatistics]);

  // --- ACTIONS ---

  const openDetailModal = async (order: Order) => {
    try {
      console.log('Opening order detail for ID:', order.id);
      setSelectedOrder(order);
      setIsDetailModalOpen(true);
      
      // Try to fetch fresh data
      try {
        const response = await orderService.getOrderById(order.id);
        console.log('Order detail response:', response);
        
        if (response.success && response.data) {
          setSelectedOrder(response.data);
        }
      } catch (fetchError) {
        console.log('Could not fetch fresh order data:', fetchError);
      }
    } catch (error) {
      console.error('Error opening order detail:', error);
      showToast('error', 'Không thể xem chi tiết đơn hàng');
    }
  };

  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    
    // Map old statuses to new valid statuses
    let validStatus = order.status;
    if (order.status === 'processing') {
      validStatus = 'confirmed'; // Map processing -> confirmed
    } else if (order.status === 'shipped') {
      validStatus = 'shipping'; // Map shipped -> shipping
    }
    
    setUpdateFormData({
      status: validStatus,
      note: order.note || ''
    });
    setIsUpdateModalOpen(true);
  };

  const updateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      console.log('=== UPDATE ORDER DEBUG ===');
      console.log('Original order status:', selectedOrder.status);
      console.log('Form data status:', updateFormData.status);
      console.log('Sending to API:', updateFormData);
      
      const response = await orderService.updateOrder(
        selectedOrder.id,
        updateFormData
      );
      console.log('Update response:', response);
      
      if (response.success) {
        showToast('success', 'Cập nhật đơn hàng thành công');
        setIsUpdateModalOpen(false);
        fetchOrders(currentPage);
      } else {
        showToast('error', 'Cập nhật đơn hàng thất bại');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('error', 'Không thể cập nhật đơn hàng');
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async (order: Order) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      return;
    }
    
    setCancelling(true);
    try {
      console.log('Cancelling order:', order.id);
      await orderService.cancelOrder(order.id);
      showToast('success', 'Hủy đơn hàng thành công');
      fetchOrders(currentPage);
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast('error', 'Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchOrders(page);
    }
  };

  // --- COMPUTED ---
  const filteredOrders = useMemo(() => {
    return orderList.filter(order => {
      const matchSearch = filters.search === '' ||
        order.id.toString().includes(filters.search) ||
        (order.customers?.users?.full_name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (order.customers?.users?.email || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (order.customers?.users?.phone || '').includes(filters.search);
      
      const matchStatus = filters.status === 'All' || order.status === filters.status;
      const latestPaymentStatus = order.payments && order.payments.length > 0 
        ? order.payments[order.payments.length - 1].status 
        : undefined;
      const matchPaymentStatus = filters.paymentStatus === 'All' || latestPaymentStatus === filters.paymentStatus;
      
      const matchDate = (!filters.dateFrom || new Date(order.order_date) >= new Date(filters.dateFrom)) &&
                        (!filters.dateTo || new Date(order.order_date) <= new Date(filters.dateTo));
      
      return matchSearch && matchStatus && matchPaymentStatus && matchDate;
    });
  }, [orderList, filters]);

  return {
    orderList,
    filteredOrders,
    statistics,
    loading,
    updating,
    cancelling,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    filters,
    setFilters,
    isDetailModalOpen,
    setIsDetailModalOpen,
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    selectedOrder,
    updateFormData,
    setUpdateFormData,
    actions: {
      openDetailModal,
      openUpdateModal,
      updateOrder,
      cancelOrder,
      goToPage,
      refreshOrders: () => fetchOrders(currentPage),
      refreshStatistics: fetchStatistics
    }
  };
};
