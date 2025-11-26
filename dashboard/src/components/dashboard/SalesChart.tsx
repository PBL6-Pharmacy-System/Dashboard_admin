import { useMemo, type FC } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SalesData } from '../../types/dashboard.types';
import { useDashboard } from '../../hooks/useDashboard';

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

const SalesChart: FC = () => {
  const { revenue, loading, errors, dateRange } = useDashboard();

  const data = useMemo<SalesData[]>(() => {
    return revenue.map(item => ({
      date: item.date || '',
      display: item.date || '', // API already returns formatted date like "28/10"
      value: item.revenue || 0,
    }));
  }, [revenue]); 
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Biểu đồ Doanh thu</h2>
        <p className="text-xs text-gray-500">Dữ liệu từ <span className="font-semibold">{dateRange.startDate}</span> đến <span className="font-semibold">{dateRange.endDate}</span></p>
      </div>

      {loading.revenue ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : errors.revenue ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 text-sm">{errors.revenue}</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Không có dữ liệu</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis 
                dataKey="display" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#9CA3AF' }} 
                tickFormatter={(val) => `${val/1000000}M`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fill="url(#colorSales)" 
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SalesChart;