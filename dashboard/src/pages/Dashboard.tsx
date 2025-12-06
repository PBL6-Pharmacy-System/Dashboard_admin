import { useMemo } from 'react';
import { Users, ShoppingBag, Calendar, Filter, TrendingUp, Package, Building2 } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import SalesChart from '../components/dashboard/SalesChart';
import TopProducts from '../components/dashboard/TopProducts';
import OrdersChart from '../components/dashboard/OrdersChart';
import ReviewsList from '../components/dashboard/ReviewsList';
import RecentActivities from '../components/dashboard/RecentActivities';
import CategoryChart from '../components/dashboard/CategoryChart';
import InsightsPanel from '../components/dashboard/InsightsPanel';
import type { StatCardData } from '../types/dashboard.types';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard = () => {
  const { 
    dateRange, 
    setDateRange, 
    selectedBranch, 
    setSelectedBranch, 
    branches, 
    overview, 
    loading,
    analytics,
    errors
  } = useDashboard();

  // Hàm xử lý khi đổi ngày
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange({ ...dateRange, [field]: value });
  };

  // Generate stats data from overview
  const statsData = useMemo<StatCardData[]>(() => {
    if (!overview) {
      return [];
    }

    const formatCurrency = (value: number) => 
      new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value || 0) + 'đ';
    
    // Parse growth percentage from string like "+100%" or "-50%"
    const parseGrowth = (growthStr: string): number => {
      const match = growthStr.match(/([+-]?\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    return [
      {
        title: 'Tổng Doanh Thu',
        value: formatCurrency(overview.revenue?.thisMonth || 0),
        change: parseGrowth(overview.revenue?.growth || '0%'),
        changeLabel: 'so với tháng trước',
        icon: <ShoppingBag size={20} className="text-blue-600" />,
        bgColor: 'bg-blue-100',
      },
      {
        title: 'Tổng Đơn Hàng',
        value: (overview.orders?.total || 0).toString(),
        change: overview.orders?.newThisMonth || 0,
        changeLabel: 'đơn mới trong tháng này',
        icon: <TrendingUp size={20} className="text-emerald-600" />,
        bgColor: 'bg-emerald-100',
      },
      {
        title: 'Khách Hàng',
        value: (overview.customers?.total || 0).toString(),
        change: overview.customers?.newThisMonth || 0,
        changeLabel: 'khách hàng mới tháng này',
        icon: <Users size={20} className="text-purple-600" />,
        bgColor: 'bg-purple-100',
      },
      {
        title: 'Sản Phẩm',
        value: (overview.products?.total || 0).toString(),
        change: overview.products?.lowStock || 0,
        changeLabel: 'sản phẩm sắp hết hàng',
        icon: <Package size={20} className="text-orange-600" />,
        bgColor: 'bg-orange-100',
      },
    ];
  }, [overview]);

  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-gray-50/30 overflow-y-auto">
      {/* Header & Global Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo Kinh Doanh</h1>
          <p className="text-sm text-gray-500">Số liệu tài chính & hiệu quả bán hàng.</p>
        </div>

        {/* GLOBAL FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Branch Filter - Only show if branches available */}
          {branches.length > 0 && (
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
              <div className="px-2 text-gray-500 flex items-center gap-2">
                <Building2 size={16} />
                <span className="text-xs font-semibold uppercase">Chi nhánh:</span>
              </div>
              <select
                value={selectedBranch || ''}
                onChange={(e) => setSelectedBranch(e.target.value ? parseInt(e.target.value) : null)}
                className="bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-blue-500 min-w-[150px]"
                disabled={loading.branches}
              >
                <option value="">Tất cả chi nhánh</option>
                {branches.map((branch) => (
                  <option key={branch.branch_id} value={branch.branch_id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
            <div className="px-2 text-gray-500 flex items-center gap-2">
              <Filter size={16} />
              <span className="text-xs font-semibold uppercase">Lọc thời gian:</span>
            </div>
            <input 
              type="date" 
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-blue-500"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-blue-500"
            />
            <button className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors">
              <Calendar size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {loading.overview ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
          {statsData.map((stat, index) => (
            <div key={index} className="h-32">
              <StatsCard data={stat} />
            </div>
          ))}
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-[400px]">
        {/* Revenue Chart (2/3 width) */}
        <div className="xl:col-span-2 h-full">
          <SalesChart />
        </div>
        {/* Category Chart (1/3 width) */}
        <div className="xl:col-span-1 h-full">
          <CategoryChart />
        </div>
      </div>

      {/* Insights for Revenue & Category */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <InsightsPanel 
            insights={analytics.filter(i => ['revenue', 'sales', 'trend'].includes(i.type))} 
            loading={loading.analytics}
            error={errors.analytics}
            title="Phân tích Doanh thu & xu hướng"
            selectedBranch={selectedBranch}
          />
        </div>
        <div className="xl:col-span-1">
          <InsightsPanel 
            insights={analytics.filter(i => ['category', 'product'].includes(i.type))} 
            loading={loading.analytics}
            error={errors.analytics}
            title="Insights Danh mục"
            selectedBranch={selectedBranch}
          />
        </div>
      </div>

      {/* Second Row: Orders Chart & Top Products */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-[350px]">
        <div className="h-full">
          <OrdersChart />
        </div>
        <div className="h-full">
          <TopProducts />
        </div>
      </div>

      {/* Insights for Orders & Products */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div>
          <InsightsPanel 
            insights={analytics.filter(i => ['order', 'time'].includes(i.type))} 
            loading={loading.analytics}
            error={errors.analytics}
            title="Insights Đơn hàng"
            selectedBranch={selectedBranch}
          />
        </div>
        <div>
          <InsightsPanel 
            insights={analytics.filter(i => ['inventory', 'stock'].includes(i.type))} 
            loading={loading.analytics}
            error={errors.analytics}
            title="Insights Sản phẩm & Tồn kho"
            selectedBranch={selectedBranch}
          />
        </div>
      </div>

      {/* Third Row: Reviews & Recent Activities */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-[400px]">
        <div className="h-full">
          <ReviewsList />
        </div>
        <div className="h-full">
          <RecentActivities />
        </div>
      </div>

      {/* General Insights - Separate section with proper spacing */}
      <div className="mt-4 pb-6">
        <InsightsPanel 
          insights={analytics.filter(i => !['revenue', 'sales', 'trend', 'category', 'product', 'order', 'time', 'inventory', 'stock'].includes(i.type))} 
          loading={loading.analytics}
          error={errors.analytics}
          title="Tổng quan & Đề xuất"
          selectedBranch={selectedBranch}
        />
      </div>
    </div>
  );
};

export default Dashboard;