import { TrendingUp, TrendingDown } from 'lucide-react';
import type { StatCardData } from '../../types/dashboard.types';

interface StatsCardProps {
  data: StatCardData;
}

const StatsCard = ({ data }: StatsCardProps) => {
  const isPositive = data.change >= 0;

  return (
    <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-3 lg:p-4 border border-gray-100 hover:border-gray-200 overflow-hidden animate-slide-up h-full">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-12 -mt-12 opacity-50 group-hover:opacity-70 transition-opacity"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{data.title}</p>
            <h3 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
              {data.value}
            </h3>
          </div>
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${data.bgColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <div className="w-5 h-5">
              {data.icon}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
            isPositive 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {isPositive ? (
              <TrendingUp size={10} className="flex-shrink-0" />
            ) : (
              <TrendingDown size={10} className="flex-shrink-0" />
            )}
            <span className="text-xs font-bold">
              {Math.abs(data.change)}%
            </span>
          </div>
          <span className="text-xs text-gray-500 font-medium truncate">{data.changeLabel}</span>
        </div>
      </div>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
      </div>
    </div>
  );
};

export default StatsCard;