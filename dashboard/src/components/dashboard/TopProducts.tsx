import { useMemo, useState, type FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, TrendingDown } from 'lucide-react';
import type { ProductData } from '../../types/dashboard.types';
import { useDashboard } from '../../hooks/useDashboard';

// Màu xanh dương cho tab "Bán chạy"
const TOP_COLORS = ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'];

// Màu đỏ cho tab "Bán tệ"
const LOW_COLORS = ['#991B1B', '#B91C1C', '#DC2626', '#EF4444', '#F87171'];

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value);

// Hàm cắt ngắn tên sản phẩm
const truncateText = (text: string, maxLength: number = 25) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Custom YAxis tick để hiển thị tên ngắn gọn hơn
const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const shortName = truncateText(payload.value, 25);
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#4B5563"
        fontSize="11"
        fontWeight="500"
      >
        {shortName}
      </text>
    </g>
  );
};

const TopProducts: FC = () => {
  const { topProducts, loading, errors, dateRange } = useDashboard();
  const [activeTab, setActiveTab] = useState<'top' | 'low'>('top');

  const topSelling = useMemo<ProductData[]>(() => {
    return (topProducts.topSelling || []).slice(0, 5).map(item => ({
      name: item.name || 'N/A',
      sales: item.soldQuantity || 0,
      amount: item.revenue || 0,
    }));
  }, [topProducts.topSelling]);

  const lowSelling = useMemo<ProductData[]>(() => {
    return (topProducts.lowSelling || []).slice(0, 5).map(item => ({
      name: item.name || 'N/A',
      sales: item.soldQuantity || 0,
      amount: item.revenue || 0,
    }));
  }, [topProducts.lowSelling]);

  const currentData = activeTab === 'top' ? topSelling : lowSelling;
  const currentColors = activeTab === 'top' ? TOP_COLORS : LOW_COLORS;
  
  // Tính max scale động dựa trên số sản phẩm bán nhiều nhất, làm tròn lên số chẵn
  const maxSales = useMemo(() => {
    if (currentData.length === 0) return 50;
    const max = Math.max(...currentData.map(p => p.sales));
    // Làm tròn lên bội số của 10 hoặc 5
    if (max <= 10) return Math.ceil(max / 5) * 5;
    if (max <= 50) return Math.ceil(max / 10) * 10;
    if (max <= 100) return Math.ceil(max / 20) * 20;
    return Math.ceil(max / 50) * 50;
  }, [currentData]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('top')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'top'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Trophy size={16} />
              Bán chạy
            </button>
            <button
              onClick={() => setActiveTab('low')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'low'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingDown size={16} />
              Bán tệ
            </button>
          </div>
        </div>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
          {dateRange.startDate} - {dateRange.endDate}
        </span>
      </div>

      {loading.topProducts ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : errors.topProducts ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 text-sm">{errors.topProducts}</p>
        </div>
      ) : currentData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Không có dữ liệu</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={currentData} 
              layout="vertical" 
              margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
            >
              <XAxis type="number" domain={[0, maxSales]} hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                width={150}
                tick={<CustomYAxisTick />}
              />
              <Tooltip 
                cursor={{ fill: '#F9FAFB' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-gray-900 text-sm mb-2">{data.name}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Đã bán:</span> {data.sales} sản phẩm
                          </p>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Doanh thu:</span> {formatCurrency(data.amount)}đ
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="sales" 
                radius={[0, 4, 4, 0]} 
                barSize={18} 
                background={{ fill: '#F3F4F6' }}
              >
                {currentData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={currentColors[index % currentColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TopProducts;