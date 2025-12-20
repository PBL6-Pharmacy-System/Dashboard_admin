import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Phone, Building2, Package, Users, 
  TrendingUp, DollarSign, AlertCircle, CheckCircle
} from 'lucide-react';
import { branchService } from '../services/branchService';

const BranchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadBranchDetail(id);
    }
  }, [id]);

  const loadBranchDetail = async (branchId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load branch info
      const branchResponse = await branchService.getBranchById(parseInt(branchId), true);
      console.log('📦 Branch detail response:', branchResponse);
      
      if (branchResponse.success && branchResponse.data) {
        setBranch(branchResponse.data);
      } else {
        setError('Không tìm thấy chi nhánh');
      }

      // Load branch inventory
      try {
        const inventoryResponse = await branchService.getBranchInventory(parseInt(branchId), { limit: 100 });
        console.log('📦 Branch inventory response:', inventoryResponse);
        
        if (inventoryResponse.success && inventoryResponse.data) {
          const inventoryData = Array.isArray(inventoryResponse.data) 
            ? inventoryResponse.data 
            : inventoryResponse.data.inventory || [];
          setInventory(inventoryData);
        }
      } catch (err) {
        console.error('Error loading inventory:', err);
      }
      
    } catch (err) {
      console.error('Error loading branch detail:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin chi nhánh');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin chi nhánh...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <p className="text-red-700 font-bold text-lg mb-4">{error || 'Không tìm thấy chi nhánh'}</p>
            <button
              onClick={() => navigate('/dashboard/branches')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalInventoryValue = inventory.reduce((sum, item) => {
    const quantity = item.quantity || item.stock || 0;
    const price = parseFloat(item.product?.price || 0);
    return sum + (quantity * price);
  }, 0);

  const lowStockItems = inventory.filter(item => 
    (item.quantity || item.stock || 0) < (item.min_stock || 50)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/branches')}
              className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-md transition-all border-2 border-blue-200"
            >
              <ArrowLeft size={20} className="text-blue-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="text-blue-600" size={32} />
                {branch.name || branch.branch_name}
              </h1>
              <p className="text-gray-500 mt-1">Chi nhánh #{branch.id || branch.branch_id}</p>
            </div>
          </div>
          
          <div className={`px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 border-2 ${
            branch.is_active 
              ? 'bg-green-100 text-green-800 border-green-300' 
              : 'bg-gray-100 text-gray-800 border-gray-300'
          }`}>
            {branch.is_active ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {branch.is_active ? 'Đang hoạt động' : 'Ngừng hoạt động'}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Branch Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="text-blue-600" />
                Thông tin chi nhánh
              </h2>
              
              <div className="space-y-4">
                <InfoRow 
                  icon={<MapPin className="text-green-600" />}
                  label="Địa chỉ"
                  value={branch.address || 'Chưa cập nhật'}
                />
                <InfoRow 
                  icon={<Phone className="text-purple-600" />}
                  label="Số điện thoại"
                  value={branch.phone || 'Chưa cập nhật'}
                />
                <InfoRow 
                  icon={<Users className="text-blue-600" />}
                  label="Ngày tạo"
                  value={new Date(branch.created_at).toLocaleDateString('vi-VN')}
                />
                <InfoRow 
                  icon={<Users className="text-orange-600" />}
                  label="Cập nhật lần cuối"
                  value={new Date(branch.updated_at).toLocaleString('vi-VN')}
                />
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="text-blue-600" />
                  Tồn kho tại chi nhánh ({inventory.length} sản phẩm)
                </h2>
              </div>
              
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Sản phẩm</th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">Tồn kho</th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">Khả dụng</th>
                      <th className="text-right py-4 px-6 text-sm font-bold text-gray-700">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inventory.length > 0 ? (
                      inventory.map((item, index) => {
                        const quantity = item.quantity || item.stock || 0;
                        const available = item.available_quantity || quantity - (item.reserved_quantity || 0);
                        const minStock = item.min_stock || 50;
                        const isLowStock = quantity < minStock;
                        
                        return (
                          <tr key={index} className="hover:bg-blue-50 transition-colors">
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {item.product?.name || item.product_name || `Product #${item.product_id}`}
                                </p>
                                <p className="text-sm text-gray-500">ID: {item.product_id}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-blue-600'}`}>
                                {quantity}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="font-bold text-green-600">{available}</span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              {isLowStock ? (
                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                                  Thiếu hàng
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                                  Ổn định
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          Chưa có dữ liệu tồn kho
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            
            {/* Inventory Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-8 h-8" />
                <h3 className="text-xl font-bold">Thống kê kho</h3>
              </div>
              
              <div className="space-y-4">
                <StatCard 
                  label="Tổng sản phẩm"
                  value={inventory.length.toString()}
                />
                <StatCard 
                  label="Tổng số lượng"
                  value={inventory.reduce((sum, i) => sum + (i.quantity || i.stock || 0), 0).toLocaleString()}
                />
                <StatCard 
                  label="Sản phẩm thiếu"
                  value={lowStockItems.length.toString()}
                  highlight={lowStockItems.length > 0}
                />
              </div>
            </div>

            {/* Value Stats */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-8 h-8" />
                <h3 className="text-xl font-bold">Giá trị tồn kho</h3>
              </div>
              
              <div>
                <p className="text-green-100 text-sm mb-2">Tổng giá trị (ước tính)</p>
                <p className="text-4xl font-bold">{totalInventoryValue.toLocaleString('vi-VN')}₫</p>
              </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="text-red-600" />
                  <h3 className="text-lg font-bold text-red-800">Cảnh báo thiếu hàng</h3>
                </div>
                
                <div className="space-y-2">
                  {lowStockItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg">
                      <p className="font-semibold text-gray-900 text-sm">
                        {item.product?.name || `Product #${item.product_id}`}
                      </p>
                      <p className="text-xs text-red-600">
                        Còn {item.quantity || item.stock || 0} (Tối thiểu: {item.min_stock || 50})
                      </p>
                    </div>
                  ))}
                  {lowStockItems.length > 5 && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      và {lowStockItems.length - 5} sản phẩm khác
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Hành động</h3>
              
              <div className="space-y-2">
                <button className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition-all border border-blue-200 flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Nhập hàng
                </button>
                <button className="w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-semibold transition-all border border-orange-200 flex items-center justify-center gap-2">
                  <Package className="w-4 h-4" />
                  Kiểm kê
                </button>
                <button className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-semibold transition-all border border-purple-200 flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Quản lý nhân viên
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
    <div className="flex-shrink-0">{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const StatCard = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className={`p-4 rounded-lg ${highlight ? 'bg-red-500' : 'bg-blue-500/20'} border border-blue-400`}>
    <p className="text-blue-100 text-sm mb-1">{label}</p>
    <p className={`text-3xl font-bold ${highlight ? 'text-white' : ''}`}>{value}</p>
  </div>
);

export default BranchDetail;
