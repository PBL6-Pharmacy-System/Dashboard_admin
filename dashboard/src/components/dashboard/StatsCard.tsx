import type { FC } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { StatCardData } from '../../types/dashboard.types';

interface StatsCardProps {
  data: StatCardData;
}

const StatsCard: FC<StatsCardProps> = ({ data }) => {
  const isPositive = data.change >= 0;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{data.title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{data.value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${data.bgColor} bg-opacity-10`}>
          {data.icon}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2">
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold ${
          isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(data.change)}%
        </div>
        <span className="text-xs text-gray-400 truncate">{data.changeLabel}</span>
      </div>
    </div>
  );
};

export default StatsCard;