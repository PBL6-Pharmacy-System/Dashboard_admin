import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, CheckCircle, XCircle } from 'lucide-react';
import { supplierOrderService, type SupplierOrder } from '../services/supplierOrderService';
import Toast from '../components/common/Toast';

interface ToastData {
  type: 'success' | 'error';
  message: string;
  description?: string;
}

const SupplierOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  // Auto dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (selectedStatus) params.status = selectedStatus;
      
      console.log('🔄 Fetching supplier orders with params:', params);
      const response = await supplierOrderService.getAllOrders(params);
      console.log('✅ Supplier orders response:', response);
      
      // Check if backend returned error
      if (response.success === false) {
        console.error('❌ Backend error:', response.error);
        setToast({
          type: 'error',
          message: 'Lỗi tải dữ liệu',
          description: response.error || 'Không thể lấy danh sách đơn hàng'
        });
        setOrders([]);
        return;
      }
      
      // Handle different response structures
      let ordersData = [];
      if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else if (response.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      }
      
      setOrders(ordersData);
    } catch (error) {
      console.error('❌ Error loading supplier orders:', error);
      // Set empty array on error so UI doesn't break
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    if (confirm(`Xác nhận cập nhật trạng thái đơn thành "${getStatusLabel(status)}"?`)) {
      try {
        const response = await supplierOrderService.updateOrderStatus(id, status);
        if (response.success) {
          setToast({
            type: 'success',
            message: 'Cập nhật thành công',
            description: `Đơn hàng đã chuyển sang trạng thái "${getStatusLabel(status)}"`
          });
          loadOrders();
        } else {
          setToast({
            type: 'error',
            message: 'Cập nhật thất bại',
            description: response.error || 'Không thể cập nhật trạng thái'
          });
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        setToast({
          type: 'error',
          message: 'Lỗi hệ thống',
          description: error instanceof Error ? error.message : 'Không thể cập nhật trạng thái đơn hàng'
        });
      }
    }
  };



  const handleCancelOrder = async (id: number) => {
    const reason = prompt('Nhập lý do hủy đơn:');
    if (reason) {
      try {
        const response = await supplierOrderService.cancelOrder(id, reason);
        if (response.success) {
          setToast({
            type: 'success',
            message: 'Đã hủy đơn hàng',
            description: reason
          });
          loadOrders();
        } else {
          setToast({
            type: 'error',
            message: 'Hủy đơn thất bại',
            description: response.error || 'Không thể hủy đơn hàng'
          });
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
        setToast({
          type: 'error',
          message: 'Lỗi hệ thống',
          description: error instanceof Error ? error.message : 'Không thể hủy đơn hàng'
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Nháp',
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      shipped: 'Đang vận chuyển',
      received: 'Đã nhận',
      cancelled: 'Đã hủy'
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="p-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          description={toast.description}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đơn đặt hàng Nhà cung cấp</h1>
        <p className="text-gray-600 mt-1">Quản lý đơn đặt hàng từ nhà cung cấp</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="draft">Nháp</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            <button
              onClick={() => navigate('/dashboard/supplier-orders/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Tạo đơn mới
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mã đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    NCC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Chi nhánh
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{order.order_number}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Supplier #{order.supplier_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Branch #{order.branch_id}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => window.location.href = `/dashboard/supplier-orders/${order.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {/* Draft -> Pending: Gửi đơn */}
                        {order.status === 'draft' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'pending')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Gửi đơn đặt hàng"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        
                        {/* Pending -> Approved: Duyệt đơn */}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'approved')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Duyệt đơn đặt hàng"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        
                        {/* Cancel button for draft, pending, approved */}
                        {['draft', 'pending', 'approved'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Hủy đơn"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierOrders;
