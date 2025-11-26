import { useMemo, type FC } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

const OrdersChart: FC = () => {
  const { ordersStats, loading, errors, dateRange } = useDashboard();

  const data = useMemo(() => {
    return ordersStats.map(item => ({
      hour: item.hour || '0h',
      orders: item.count || 0,
    }));
  }, [ordersStats]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-indigo-600" />
          <h2 className="font-bold text-gray-900">Đơn hàng theo giờ</h2>
        </div>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
          {dateRange.startDate} - {dateRange.endDate}
        </span>
      </div>

      {loading.ordersStats ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : errors.ordersStats ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 text-sm">{errors.ordersStats}</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Không có dữ liệu</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis 
                dataKey="hour" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value} đơn`, 'Số đơn hàng']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#6366F1" 
                strokeWidth={2}
                dot={{ fill: '#6366F1', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default OrdersChart;
