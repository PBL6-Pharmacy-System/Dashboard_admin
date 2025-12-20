import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Calendar, User, MapPin, DollarSign, 
  CheckCircle, XCircle, Clock, Truck, FileText, AlertCircle 
} from 'lucide-react';
import { supplierOrderService, type SupplierOrder, type SupplierOrderItem } from '../services/supplierOrderService';

const SupplierOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<SupplierOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadOrderDetail(id);
    }
  }, [id]);

  const loadOrderDetail = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierOrderService.getOrderById(parseInt(orderId));
      
      console.log('📦 Supplier order detail response:', response);
      
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError('Không tìm thấy đơn hàng');
      }
    } catch (err) {
      console.error('Error loading order detail:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipped: 'Đang vận chuyển',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5" />;
      case 'shipped': return <Truck className="w-5 h-5" />;
      case 'delivered': return <Package className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <p className="text-red-700 font-bold text-lg mb-4">{error || 'Không tìm thấy đơn hàng'}</p>
            <button
              onClick={() => navigate('/dashboard/supplier-orders')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = order.supplierOrderItem?.reduce((sum, item) => 
    sum + (parseFloat(item.unit_price?.toString() || item.unit_cost?.toString() || '0') * item.quantity), 0
  ) || order.total_amount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/supplier-orders')}
              className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-md transition-all border-2 border-blue-200"
            >
              <ArrowLeft size={20} className="text-blue-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="text-blue-600" size={32} />
                Chi tiết đơn hàng #{order.id}
              </h1>
              <p className="text-gray-500 mt-1">Đơn hàng từ nhà cung cấp</p>
            </div>
          </div>
          
          <div className={`px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 border-2 ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            {getStatusLabel(order.status)}
          </div>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="text-blue-600" />
                Thông tin đơn hàng
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <InfoItem 
                  icon={<User className="text-purple-600" />}
                  label="Nhà cung cấp"
                  value={order.suppliers?.name || 'N/A'}
                />
                <InfoItem 
                  icon={<MapPin className="text-green-600" />}
                  label="Chi nhánh nhận"
                  value={order.branches?.branch_name || order.branches?.name || 'N/A'}
                />
                <InfoItem 
                  icon={<Calendar className="text-blue-600" />}
                  label="Ngày đặt hàng"
                  value={new Date(order.created_at).toLocaleDateString('vi-VN')}
                />
                <InfoItem 
                  icon={<Calendar className="text-orange-600" />}
                  label="Ngày dự kiến giao"
                  value={order.expected_delivery_date 
                    ? new Date(order.expected_delivery_date).toLocaleDateString('vi-VN')
                    : 'Chưa xác định'}
                />
              </div>

              {order.notes && (
                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">Ghi chú:</p>
                  <p className="text-yellow-700">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="text-blue-600" />
                  Danh sách sản phẩm ({order.supplierOrderItem?.length || 0})
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Sản phẩm</th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">Số lượng</th>
                      <th className="text-right py-4 px-6 text-sm font-bold text-gray-700">Đơn giá</th>
                      <th className="text-right py-4 px-6 text-sm font-bold text-gray-700">Thành tiền</th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">Đã nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.supplierOrderItem && order.supplierOrderItem.length > 0 ? (
                      order.supplierOrderItem.map((item: SupplierOrderItem) => (
                        <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-semibold text-gray-900">{item.products?.name || `Product #${item.product_id}`}</p>
                              <p className="text-sm text-gray-500">ID: {item.product_id}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="font-bold text-blue-600">{item.quantity}</span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-gray-700">{parseFloat((item.unit_price || item.unit_cost || 0).toString()).toLocaleString('vi-VN')}₫</span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="font-bold text-gray-900">
                              {(parseFloat((item.unit_price || item.unit_cost || 0).toString()) * item.quantity).toLocaleString('vi-VN')}₫
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {item.received_quantity !== undefined && item.received_quantity !== null ? (
                              <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                                item.received_quantity >= item.quantity 
                                  ? 'bg-green-100 text-green-700'
                                  : item.received_quantity > 0
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {item.received_quantity} / {item.quantity}
                              </span>
                            ) : (
                              <span className="text-gray-400">Chưa nhận</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          Không có sản phẩm nào trong đơn hàng
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            
            {/* Total Amount */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-8 h-8" />
                <h3 className="text-xl font-bold">Tổng giá trị đơn</h3>
              </div>
              <p className="text-4xl font-bold">{totalAmount.toLocaleString('vi-VN')}₫</p>
              <p className="text-blue-100 mt-2">{order.supplierOrderItem?.length || 0} sản phẩm</p>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="text-blue-600" />
                Lịch sử đơn hàng
              </h3>
              
              <div className="space-y-4">
                <TimelineItem 
                  status="created"
                  label="Đơn hàng được tạo"
                  date={order.created_at}
                  active
                />
                {order.status !== 'pending' && order.status !== 'cancelled' && (
                  <TimelineItem 
                    status="confirmed"
                    label="Đã xác nhận"
                    date={order.updated_at}
                    active={['confirmed', 'shipped', 'delivered'].includes(order.status)}
                  />
                )}
                {order.status === 'shipped' || order.status === 'delivered' ? (
                  <TimelineItem 
                    status="shipped"
                    label="Đang vận chuyển"
                    date={order.updated_at}
                    active
                  />
                ) : null}
                {order.status === 'delivered' && (
                  <TimelineItem 
                    status="delivered"
                    label="Đã giao hàng"
                    date={order.updated_at}
                    active
                  />
                )}
                {order.status === 'cancelled' && (
                  <TimelineItem 
                    status="cancelled"
                    label="Đã hủy"
                    date={order.updated_at}
                    active
                  />
                )}
              </div>
            </div>

            {/* Contact Info */}
            {order.supplier?.contact_info && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="text-blue-600" />
                  Thông tin liên hệ
                </h3>
                <p className="text-gray-700">{order.supplier.contact_info}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
    <div className="mt-0.5">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const TimelineItem = ({ 
  status, 
  label, 
  date, 
  active 
}: { 
  status: string; 
  label: string; 
  date: string; 
  active: boolean; 
}) => {
  const getStatusColor = () => {
    if (!active) return 'bg-gray-300';
    switch (status) {
      case 'created': return 'bg-blue-500';
      case 'confirmed': return 'bg-green-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`w-3 h-3 rounded-full mt-1 ${getStatusColor()}`}></div>
      <div className="flex-1">
        <p className={`font-semibold ${active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</p>
        <p className="text-sm text-gray-500">{new Date(date).toLocaleString('vi-VN')}</p>
      </div>
    </div>
  );
};

export default SupplierOrderDetail;
