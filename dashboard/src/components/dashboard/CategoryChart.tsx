import type { FC } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import type { CategoryData } from '../../types/dashboard.types';

const data: CategoryData[] = [
  { name: 'Thuốc kê đơn', value: 40, color: '#3B82F6' },
  { name: 'TPCN', value: 30, color: '#8B5CF6' },
  { name: 'Mỹ phẩm', value: 20, color: '#EC4899' },
  { name: 'Thiết bị', value: 10, color: '#10B981' },
];

const CategoryChart: FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PieIcon size={20} className="text-purple-500" />
          <h2 className="font-bold text-lg text-gray-900">Danh mục</h2>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(val: number) => [`${val}%`, 'Tỷ trọng']}
              contentStyle={{ fontSize: '13px' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={40}
              iconSize={10}
              iconType="circle"
              wrapperStyle={{ fontSize: '13px', fontWeight: 500 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-5 text-center pointer-events-none">
          <span className="text-sm text-gray-400 font-medium">Tổng</span>
          <div className="text-2xl font-bold text-gray-800">100%</div>
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;