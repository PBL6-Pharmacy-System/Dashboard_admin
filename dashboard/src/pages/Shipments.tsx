import React, { useState, useEffect } from 'react';
import {
  getAllShipments,
  getShipmentById,
  updateShipmentStatus,
  getShipmentStatistics,
  type Shipment,
  type ShipmentFilters,
  type ShipmentStatistics as ShipmentStatsType
} from '../services/shipmentService';

const Shipments: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [statistics, setStatistics] = useState<ShipmentStatsType['data'] | null>(null);

  // Filters
  const [filters, setFilters] = useState<ShipmentFilters>({
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Load shipments
  const loadShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching shipments with filters:', filters);
      
      const response = await getAllShipments(filters);
      console.log('📦 Shipments loaded:', response.data);
      
      setShipments(response.data.shipments);
      setPagination(response.data.pagination);
    } catch (err: any) {
      console.error('❌ Error loading shipments:', err);
      setError(err.message || 'Không thể tải danh sách lô hàng');
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await getShipmentStatistics(filters);
      setStatistics(response.data);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  // Load shipment detail
  const handleViewDetail = async (id: number) => {
    try {
      setLoading(true);
      const response = await getShipmentById(id);
      setSelectedShipment(response.data);
      setView('detail');
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết lô hàng');
    } finally {
      setLoading(false);
    }
  };

  // Update status
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    if (!confirm(`Xác nhận cập nhật trạng thái thành "${newStatus}"?`)) return;

    try {
      setLoading(true);
      await updateShipmentStatus(id, { status: newStatus });
      await loadShipments();
      if (selectedShipment?.id === id) {
        const response = await getShipmentById(id);
        setSelectedShipment(response.data);
      }
      alert('Cập nhật trạng thái thành công!');
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
    loadStatistics();
  }, [filters]);

  // Status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Chờ xử lý' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đang xử lý' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đã giao cho ĐVVC' },
      in_transit: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang vận chuyển' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã giao hàng' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Render statistics
  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Tổng lô hàng</div>
          <div className="text-2xl font-bold text-blue-600">{statistics.totalShipments}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Đã giao</div>
          <div className="text-2xl font-bold text-green-600">{statistics.shipmentsByStatus.delivered}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Đang vận chuyển</div>
          <div className="text-2xl font-bold text-yellow-600">{statistics.shipmentsByStatus.in_transit}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Tỷ lệ giao đúng hạn</div>
          <div className="text-2xl font-bold text-purple-600">{statistics.onTimeDeliveryRate}</div>
        </div>
      </div>
    );
  };

  // Render list view
  const renderListView = () => (
    <div>
      {/* Header & Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Quản lý giao hàng</h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đã giao cho ĐVVC</option>
              <option value="in_transit">Đang vận chuyển</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ page: 1, limit: 20, sortBy: 'created_at', sortOrder: 'desc' })}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {renderStatistics()}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã vận đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn vị vận chuyển
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phí vận chuyển
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Không có đơn giao hàng nào
                  </td>
                </tr>
              ) : (
                shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{shipment.tracking_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">#{shipment.order_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{shipment.orders?.customers?.full_name || '-'}</div>
                      <div className="text-sm text-gray-500">{shipment.orders?.customers?.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{shipment.carrier}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(shipment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(shipment.shipping_fee || 0)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(shipment.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(shipment.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, (filters.page || 1) + 1) })}
                disabled={filters.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{' '}
                  <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>
                  {' '}trong{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Trang {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, (filters.page || 1) + 1) })}
                    disabled={filters.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render detail view
  const renderDetailView = () => {
    if (!selectedShipment) return null;

    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setView('list')}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Quay lại danh sách
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Chi tiết giao hàng</h2>
              <div className="text-gray-600">Mã vận đơn: {selectedShipment.tracking_number}</div>
            </div>
            {getStatusBadge(selectedShipment.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin đơn hàng */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Thông tin đơn hàng</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-medium">#{selectedShipment.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="font-medium">{formatCurrency(selectedShipment.orders?.total_amount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái đơn:</span>
                  <span className="font-medium">{selectedShipment.orders?.status}</span>
                </div>
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Thông tin khách hàng</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Họ tên:</span>
                  <span className="font-medium">{selectedShipment.orders?.customers?.full_name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số điện thoại:</span>
                  <span className="font-medium">{selectedShipment.orders?.customers?.phone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{selectedShipment.orders?.customers?.email || '-'}</span>
                </div>
              </div>
            </div>

            {/* Thông tin vận chuyển */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Thông tin vận chuyển</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Đơn vị vận chuyển:</span>
                  <span className="font-medium">{selectedShipment.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium">{formatCurrency(selectedShipment.shipping_fee || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày gửi:</span>
                  <span className="font-medium">{formatDate(selectedShipment.shipped_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dự kiến giao:</span>
                  <span className="font-medium">{formatDate(selectedShipment.estimated_delivery)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã giao:</span>
                  <span className="font-medium">{formatDate(selectedShipment.delivered_date)}</span>
                </div>
              </div>
            </div>

            {/* Địa chỉ giao hàng */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Địa chỉ giao hàng</h3>
              {selectedShipment.shippingaddresses && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Người nhận:</span>
                    <span className="font-medium">{selectedShipment.shippingaddresses.recipient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SĐT:</span>
                    <span className="font-medium">{selectedShipment.shippingaddresses.phone}</span>
                  </div>
                  <div className="text-sm mt-2">
                    <span className="text-gray-600">Địa chỉ:</span>
                    <p className="font-medium mt-1">
                      {selectedShipment.shippingaddresses.address}, {selectedShipment.shippingaddresses.ward},{' '}
                      {selectedShipment.shippingaddresses.district}, {selectedShipment.shippingaddresses.city}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Note */}
          {selectedShipment.note && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Ghi chú</h3>
              <p className="text-sm text-gray-700">{selectedShipment.note}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {selectedShipment.status === 'pending' && (
              <button
                onClick={() => handleUpdateStatus(selectedShipment.id, 'processing')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={loading}
              >
                Bắt đầu xử lý
              </button>
            )}
            {selectedShipment.status === 'processing' && (
              <button
                onClick={() => handleUpdateStatus(selectedShipment.id, 'shipped')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                disabled={loading}
              >
                Đã giao cho ĐVVC
              </button>
            )}
            {selectedShipment.status === 'shipped' && (
              <button
                onClick={() => handleUpdateStatus(selectedShipment.id, 'in_transit')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                disabled={loading}
              >
                Đang vận chuyển
              </button>
            )}
            {selectedShipment.status === 'in_transit' && (
              <button
                onClick={() => handleUpdateStatus(selectedShipment.id, 'delivered')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={loading}
              >
                Đã giao hàng
              </button>
            )}
            {!['delivered', 'cancelled'].includes(selectedShipment.status) && (
              <button
                onClick={() => handleUpdateStatus(selectedShipment.id, 'cancelled')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={loading}
              >
                Hủy
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {view === 'list' ? renderListView() : renderDetailView()}
    </div>
  );
};

export default Shipments;
