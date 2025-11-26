import { useMemo, useState, type FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, TrendingDown } from 'lucide-react';
import type { ProductData } from '../../types/dashboard.types';
import { useDashboard } from '../../hooks/useDashboard';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
const LOW_COLORS = ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'];

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value);

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
  const currentColors = activeTab === 'top' ? COLORS : LOW_COLORS;

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
            <BarChart data={currentData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                width={100}
                tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 500 }}
              />
              <Tooltip 
                cursor={{ fill: '#F9FAFB' }}
                formatter={(val: number, name: string) => {
                  if (name === 'sales') return [`${val} sp`, 'Đã bán'];
                  if (name === 'amount') return [`${formatCurrency(val)}đ`, 'Doanh thu'];
                  return [val, name];
                }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: '#F3F4F6' }}>
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