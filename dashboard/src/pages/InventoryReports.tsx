import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';
import { inventoryStatisticsService } from '../services/inventoryStatisticsService';

const InventoryReports = () => {
  const [overview, setOverview] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [topImported, setTopImported] = useState<any[]>([]);
  const [topExported, setTopExported] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching inventory statistics...');
      const [overviewRes, lowStockRes, importedRes, exportedRes] = await Promise.all([
        inventoryStatisticsService.getOverview(),
        inventoryStatisticsService.getLowStock(10),
        inventoryStatisticsService.getTopImported({ limit: 10 }),
        inventoryStatisticsService.getTopExported({ limit: 10 })
      ]);

      console.log('✅ Overview:', overviewRes);
      console.log('✅ Low Stock:', lowStockRes);
      console.log('✅ Top Imported:', importedRes);
      console.log('✅ Top Exported:', exportedRes);

      setOverview(overviewRes.data || {});
      setLowStock(lowStockRes.data?.products || []);
      setTopImported(importedRes.data || []);
      setTopExported(exportedRes.data || []);
    } catch (error) {
      console.error('❌ Error loading inventory statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo Tồn kho</h1>
        <p className="text-gray-600 mt-1">Thống kê và phân tích tồn kho</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(overview?.totalProducts || 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng tồn kho</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(overview?.totalStock || 0)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cảnh báo Low Stock</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {formatNumber(lowStock?.length || 0)}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Giá trị tồn kho</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(overview?.totalInventoryValue || 0)}đ
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="text-orange-600" size={20} />
              Sản phẩm sắp hết hàng
            </h2>
          </div>
          <div className="p-4">
            {lowStock.length > 0 ? (
              <div className="space-y-3">
                {lowStock.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name || `Product #${item.product_id}`}</p>
                      <p className="text-sm text-gray-600">{item.branch_name || `Branch #${item.branch_id}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600">{item.stock}/{item.min_stock}</p>
                      <p className="text-xs text-gray-500">còn lại/tối thiểu</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Không có sản phẩm nào</p>
            )}
          </div>
        </div>

        {/* Top Imported Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              Sản phẩm nhập nhiều nhất
            </h2>
          </div>
          <div className="p-4">
            {topImported.length > 0 ? (
              <div className="space-y-3">
                {topImported.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name || `Product #${item.id}`}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatNumber(item.total_imported || 0)}</p>
                      <p className="text-xs text-gray-500">đã nhập</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Không có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Top Exported Products */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingDown className="text-blue-600" size={20} />
              Sản phẩm xuất nhiều nhất
            </h2>
          </div>
          <div className="p-4">
            {topExported.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topExported.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name || `Product #${item.id}`}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{formatNumber(item.total_exported || 0)}</p>
                      <p className="text-xs text-gray-500">đã xuất</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Không có dữ liệu</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;
