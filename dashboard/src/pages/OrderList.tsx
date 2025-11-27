import { ShoppingCart, Eye, Edit2, X, Filter, Search, Package, DollarSign, Clock } from 'lucide-react';
import { useOrderManagement } from '../hooks/useOrderManagement';

const OrderList = () => {
  const { 
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
    actions 
  } = useOrderManagement();

  // Format currency
  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', dateString);
        return 'N/A';
      }
      return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date format error:', error, dateString);
      return 'N/A';
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    if (!status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border bg-gray-100 text-gray-700 border-gray-200">
          N/A
        </span>
      );
    }

    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      confirmed: { label: 'Đã xác nhận', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      processing: { label: 'Đang xử lý', className: 'bg-blue-100 text-blue-700 border-blue-200' }, // Old status
      shipping: { label: 'Đang giao hàng', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      shipped: { label: 'Đang giao hàng', className: 'bg-purple-100 text-purple-700 border-purple-200' }, // Old status
      delivered: { label: 'Đã giao', className: 'bg-green-100 text-green-700 border-green-200' },
      completed: { label: 'Hoàn thành', className: 'bg-teal-100 text-teal-700 border-teal-200' },
      cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-700 border-red-200' },
      returned: { label: 'Đã trả lại', className: 'bg-orange-100 text-orange-700 border-orange-200' }
    };

    const statusInfo = statusMap[status.toLowerCase()] || { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };  // Get payment status badge
  const getPaymentStatusBadge = (payments: Array<{ status: string; payment_method?: string }> | undefined) => {
    // Get the latest payment status
    const latestPayment = payments && payments.length > 0 
      ? payments[payments.length - 1] 
      : null;
    
    const status = latestPayment?.status;
    
    if (!status) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          N/A
        </span>
      );
    }
    
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Chờ thanh toán', className: 'bg-orange-100 text-orange-700 border-orange-200' },
      paid: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-700 border-green-200' },
      failed: { label: 'Thất bại', className: 'bg-red-100 text-red-700 border-red-200' },
      cancelled: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-700 border-gray-200' }
    };
    
    const statusInfo = statusMap[status.toLowerCase()] || { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200' };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen flex flex-col">
      {/* HEADER & STATISTICS */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Quản lý Đơn hàng</h1>
        
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total_orders}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <ShoppingCart className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.pending_orders}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Đã giao</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.delivered_orders}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Package className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tổng doanh thu</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(statistics.total_revenue)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <DollarSign className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-500" />
          <h2 className="text-sm font-bold text-gray-700">Bộ lọc</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo ID, tên, email, SĐT..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="All">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipping">Đang giao hàng</option>
            <option value="delivered">Đã giao</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="returned">Đã trả lại</option>
          </select>
          
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="All">Tất cả thanh toán</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="failed">Thất bại</option>
          </select>
          
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Từ ngày"
          />
          
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Mã đơn</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Thanh toán</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ngày tạo</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Không tìm thấy đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    // Debug log to check status value
                    if (!order.status) {
                      console.log('Order missing status:', order.id, 'Status value:', order.status, 'Full order:', order);
                    }
                    
                    return (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-600">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{order.customers?.users?.full_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.customers?.users?.email || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{formatCurrency(Number(order.final_amount || order.total_amount))}</div>
                        <div className="text-xs text-gray-500">{order.orderitems?.[0]?.products?.name?.substring(0, 30) || ''}...</div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4">{getPaymentStatusBadge(order.payments)}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{formatDate(order.order_date)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => actions.openDetailModal(order)} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết">
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => actions.openUpdateModal(order)} 
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            disabled={updating}
                            title="Cập nhật">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => actions.cancelOrder(order)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={cancelling || order.status === 'cancelled'}
                            title="Hủy đơn">
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-500">
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} của {totalItems} đơn hàng
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => actions.goToPage(currentPage - 1)} 
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                Trước
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => actions.goToPage(pageNum)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                    }`}>
                    {pageNum}
                  </button>
                );
              })}
              <button 
                onClick={() => actions.goToPage(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button onClick={() => setIsDetailModalOpen(false)}>
                <X size={20} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Thông tin khách hàng</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tên:</span>
                    <span className="text-sm font-medium">{selectedOrder.customers?.users?.full_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">{selectedOrder.customers?.users?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Số điện thoại:</span>
                    <span className="text-sm font-medium">{selectedOrder.customers?.users?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Địa chỉ giao hàng:</span>
                    <span className="text-sm font-medium text-right">{selectedOrder.shippingaddresses?.address_line || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Thông tin đơn hàng</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Trạng thái đơn hàng:</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Trạng thái thanh toán:</span>
                    {getPaymentStatusBadge(selectedOrder.payments)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phương thức thanh toán:</span>
                    <span className="text-sm font-medium">{selectedOrder.payments?.[0]?.payment_method?.toUpperCase() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Giảm giá:</span>
                    <span className="text-sm font-medium text-red-600">-{formatCurrency(Number(selectedOrder.discount_amount))}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm font-bold text-gray-900">Tổng cộng:</span>
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(Number(selectedOrder.final_amount || selectedOrder.total_amount))}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.orderitems && selectedOrder.orderitems.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Sản phẩm trong đơn</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Sản phẩm</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Số lượng</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Đơn giá</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedOrder.orderitems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm">{item.products?.name || `Product #${item.product_id}`}</td>
                            <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right">{formatCurrency(Number(item.price))}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(Number(item.subtotal))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UPDATE MODAL */}
      {isUpdateModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Cập nhật đơn hàng #{selectedOrder.id}</h2>
              <button onClick={() => setIsUpdateModalOpen(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={actions.updateOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Trạng thái đơn hàng</label>
                <select
                  value={updateFormData.status}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required>
                  <option value="pending">Chờ xử lý</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="delivered">Đã giao</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                  <option value="returned">Đã trả lại</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={updateFormData.note}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Thêm ghi chú cho đơn hàng..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsUpdateModalOpen(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={updating}>
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                  disabled={updating}>
                  {updating ? 'Đang lưu...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
