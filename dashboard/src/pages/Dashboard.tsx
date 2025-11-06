import { Users, Package, TrendingUp, Clock } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import SalesChart from '../components/dashboard/SalesChart';
import DealsTable from '../components/dashboard/DealsTable';
import type { StatCardData } from '../types/dashboard.types';

const Dashboard = () => {
  const statsData: StatCardData[] = [
    {
      title: 'Total User',
      value: '40,689',
      change: 8.5,
      changeLabel: 'Up from yesterday',
      icon: <Users size={20} className="text-purple-600" />,
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Order',
      value: '10293',
      change: 1.3,
      changeLabel: 'Up from past week',
      icon: <Package size={20} className="text-yellow-600" />,
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Total Sales',
      value: '$89,000',
      change: -4.3,
      changeLabel: 'Down from yesterday',
      icon: <TrendingUp size={20} className="text-green-600" />,
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Pending',
      value: '2040',
      change: 1.8,
      changeLabel: 'Up from yesterday',
      icon: <Clock size={20} className="text-red-600" />,
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="h-full flex flex-col gap-3 lg:gap-4 animate-fade-in overflow-hidden">
      {/* Header Section - Compact */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-all duration-200 shadow-sm hover:shadow">
            Export
          </button>
          <button className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg text-xs font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50">
            Add New
          </button>
        </div>
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 flex-shrink-0">
        {statsData.map((stat, index) => (
          <div 
            key={index}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StatsCard data={stat} />
          </div>
        ))}
      </div>

      {/* Charts Row - Tràn hết chiều ngang và chiều dọc còn lại */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4 min-h-0 overflow-hidden">
        {/* Sales Chart */}
        <div className="h-full overflow-hidden" style={{ animationDelay: '400ms' }}>
          <SalesChart />
        </div>

        {/* Deals Table */}
        <div className="h-full overflow-hidden" style={{ animationDelay: '500ms' }}>
          <DealsTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;