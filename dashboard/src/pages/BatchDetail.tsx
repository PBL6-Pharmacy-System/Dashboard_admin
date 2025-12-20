import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Calendar, DollarSign, 
  AlertTriangle, TrendingUp, TrendingDown, Info, Trash2
} from 'lucide-react';
import { batchService, type ProductBatch } from '../services/batchService';

const BatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<ProductBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadBatchDetail(id);
    }
  }, [id]);

  const loadBatchDetail = async (batchId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await batchService.getBatchById(parseInt(batchId));
      
      console.log('📦 Batch detail response:', response);
      
      if (response.success && response.data) {
        setBatch(response.data);
      } else {
        setError('Không tìm thấy lô hàng');
      }
    } catch (err) {
      console.error('Error loading batch detail:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin lô hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (batch: ProductBatch) => {
    const today = new Date();
    const expiryDate = new Date(batch.expiry_date);
    const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (batch.quantity === 0) {
      return { label: 'Hết hàng', color: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
    if (daysToExpiry < 0) {
      return { label: 'Đã hết hạn', color: 'bg-red-100 text-red-800 border-red-300' };
    }
    if (daysToExpiry <= 30) {
      return { label: 'Sắp hết hạn', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    }
    if (daysToExpiry <= 90) {
      return { label: 'Cần chú ý', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    }
    return { label: 'Tốt', color: 'bg-green-100 text-green-800 border-green-300' };
  };

  const getDaysToExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysToExpiry;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin lô hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <p className="text-red-700 font-bold text-lg mb-4">{error || 'Không tìm thấy lô hàng'}</p>
            <button
              onClick={() => navigate('/dashboard/batches')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = getStatusBadge(batch);
  const daysToExpiry = getDaysToExpiry(batch.expiry_date);
  const availableQty = batch.quantity - (batch.reserved_quantity || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/batches')}
              className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-md transition-all border-2 border-blue-200"
            >
              <ArrowLeft size={20} className="text-blue-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="text-blue-600" size={32} />
                Chi tiết lô hàng
              </h1>
              <p className="text-gray-500 mt-1">Mã lô: {batch.batch_number}</p>
            </div>
          </div>
          
          <div className={`px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 border-2 ${status.color}`}>
            <Info className="w-5 h-5" />
            {status.label}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Batch Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="text-blue-600" />
                Thông tin sản phẩm
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <InfoItem 
                  label="Tên sản phẩm"
                  value={batch.products?.product_name || batch.products?.name || `Product #${batch.product_id}`}
                />
                <InfoItem 
                  label="Đơn vị"
                  value={batch.products?.unit_of_measure || 'N/A'}
                />
                <InfoItem 
                  label="Chi nhánh"
                  value={batch.branches?.branch_name || batch.branches?.name || `Branch #${batch.branch_id}`}
                />
                <InfoItem 
                  label="Mã lô"
                  value={batch.batch_number}
                />
              </div>
            </div>

            {/* Quantity Info */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-600" />
                Thông tin số lượng
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold mb-2">Tổng số lượng</p>
                  <p className="text-3xl font-bold text-blue-600">{batch.quantity}</p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <p className="text-sm text-yellow-600 font-semibold mb-2">Đã đặt trước</p>
                  <p className="text-3xl font-bold text-yellow-600">{batch.reserved_quantity || 0}</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <p className="text-sm text-green-600 font-semibold mb-2">Có thể bán</p>
                  <p className="text-3xl font-bold text-green-600">{availableQty}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-700">Tỷ lệ sử dụng</span>
                  <span className="text-gray-600">
                    {((batch.reserved_quantity || 0) / batch.quantity * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                    style={{ width: `${Math.min((batch.reserved_quantity || 0) / batch.quantity * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Date Info */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="text-purple-600" />
                Thông tin ngày tháng
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {batch.manufacturing_date && (
                  <InfoItem 
                    label="Ngày sản xuất"
                    value={new Date(batch.manufacturing_date).toLocaleDateString('vi-VN')}
                  />
                )}
                <InfoItem 
                  label="Hạn sử dụng"
                  value={new Date(batch.expiry_date).toLocaleDateString('vi-VN')}
                />
                <InfoItem 
                  label="Ngày nhập kho"
                  value={new Date(batch.created_at).toLocaleDateString('vi-VN')}
                />
                <InfoItem 
                  label="Cập nhật lần cuối"
                  value={new Date(batch.updated_at).toLocaleString('vi-VN')}
                />
              </div>

              {/* Expiry Warning */}
              {daysToExpiry < 90 && daysToExpiry >= 0 && (
                <div className={`mt-4 p-4 rounded-lg border-l-4 ${
                  daysToExpiry <= 30 
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-5 h-5 ${daysToExpiry <= 30 ? 'text-red-600' : 'text-yellow-600'}`} />
                    <p className={`font-semibold ${daysToExpiry <= 30 ? 'text-red-800' : 'text-yellow-800'}`}>
                      Còn {daysToExpiry} ngày hết hạn
                    </p>
                  </div>
                  <p className={`text-sm mt-1 ${daysToExpiry <= 30 ? 'text-red-700' : 'text-yellow-700'}`}>
                    {daysToExpiry <= 30 
                      ? 'Cần xử lý gấp! Hàng sắp hết hạn.'
                      : 'Cần có kế hoạch tiêu thụ sớm.'}
                  </p>
                </div>
              )}

              {daysToExpiry < 0 && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-600">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="font-semibold text-red-800">
                      Đã quá hạn {Math.abs(daysToExpiry)} ngày
                    </p>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Lô hàng này không thể tiêu thụ. Cần tiêu hủy ngay.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            
            {/* Cost Info */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-8 h-8" />
                <h3 className="text-xl font-bold">Giá trị lô hàng</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-green-100 text-sm mb-1">Giá nhập</p>
                  <p className="text-3xl font-bold">{parseFloat(batch.cost_price.toString()).toLocaleString('vi-VN')}₫</p>
                  <p className="text-green-100 text-sm mt-1">per unit</p>
                </div>
                
                <div className="pt-3 border-t border-green-400">
                  <p className="text-green-100 text-sm mb-1">Tổng giá trị</p>
                  <p className="text-2xl font-bold">
                    {(parseFloat(batch.cost_price.toString()) * batch.quantity).toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>
            </div>

            {/* Location - Not available in ProductBatch interface */}

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê nhanh</h3>
              
              <div className="space-y-3">
                <StatItem 
                  label="Tỷ lệ tồn kho"
                  value={`${((availableQty / batch.quantity) * 100).toFixed(0)}%`}
                  color="text-blue-600"
                />
                <StatItem 
                  label="Giá trị còn lại"
                  value={`${(parseFloat(batch.cost_price.toString()) * availableQty).toLocaleString('vi-VN')}₫`}
                  color="text-green-600"
                />
                <StatItem 
                  label="Thời gian còn lại"
                  value={daysToExpiry > 0 ? `${daysToExpiry} ngày` : 'Hết hạn'}
                  color={daysToExpiry > 30 ? 'text-green-600' : 'text-red-600'}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Hành động</h3>
              
              <div className="space-y-2">
                <button className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition-all border border-blue-200 flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Nhập thêm hàng
                </button>
                <button className="w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-semibold transition-all border border-orange-200 flex items-center justify-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Xuất hàng
                </button>
                {daysToExpiry < 0 && (
                  <button className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold transition-all border border-red-200 flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Tiêu hủy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
);

const StatItem = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-600 text-sm">{label}</span>
    <span className={`font-bold ${color}`}>{value}</span>
  </div>
);

export default BatchDetail;
