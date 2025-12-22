import { useMemo, type FC } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import type { CategoryData } from '../../types/dashboard.types';
import { useDashboard } from '../../hooks/useDashboard';

// Màu xanh dương cho các category - nhiều tông xanh khác nhau
const CATEGORY_COLORS: string[] = [
  '#1E40AF',    // Blue-800 (dark blue)
  '#2563EB',    // Blue-600
  '#3B82F6',    // Blue-500
  '#60A5FA',    // Blue-400
  '#93C5FD',    // Blue-300
  '#BFDBFE',    // Blue-200
  '#DBEAFE',    // Blue-100
  '#1E3A8A',    // Blue-900 (very dark)
];

const CategoryChart: FC = () => {
  const { topProducts, loading } = useDashboard();

  // Tính toán phần trăm category từ dữ liệu top products
  const categoryData = useMemo<CategoryData[]>(() => {
    const allProducts = [...topProducts.topSelling, ...topProducts.lowSelling];
    if (allProducts.length === 0) return [];

    // Đếm số lượng bán theo category
    const categoryMap = new Map<string, number>();
    let total = 0;

    allProducts.forEach(product => {
      const category = product.category || 'Khác';
      const quantity = product.soldQuantity || 0;
      categoryMap.set(category, (categoryMap.get(category) || 0) + quantity);
      total += quantity;
    });

    // Chuyển đổi sang mảng và tính phần trăm
    const data = Array.from(categoryMap.entries())
      .map(([name, quantity], index) => ({
        name,
        value: total > 0 ? parseFloat(((quantity / total) * 100).toFixed(1)) : 0,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        quantity,
      }))
      .sort((a, b) => b.value - a.value);

    return data;
  }, [topProducts]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PieIcon size={20} className="text-blue-600" />
          <h2 className="font-bold text-lg text-gray-900">Danh mục</h2>
        </div>
      </div>

      {loading.topProducts ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : categoryData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Không có dữ liệu</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Biểu đồ */}
          <div className="flex-1 relative" style={{ minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="font-bold text-gray-900 text-sm mb-1">{data.name}</p>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Tỷ trọng:</span> {data.value}%
                          </p>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Số lượng:</span> {data.quantity} sản phẩm
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-3 text-center pointer-events-none">
              <span className="text-xs text-gray-400 font-medium">Tổng</span>
              <div className="text-xl font-bold text-gray-800">100%</div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center px-2 pb-2">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600 font-medium">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryChart;