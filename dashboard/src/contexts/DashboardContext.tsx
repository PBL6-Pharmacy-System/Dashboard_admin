import { useState, useEffect, type ReactNode } from 'react';
import { dashboardService } from '../services/dashboardService';
import { authService } from '../services/authService';
import type {
  RevenueData,
  TopProduct,
  OrdersStatsData,
  OverviewData,
  ReviewData,
  ActivityData,
} from '../types/dashboard.types';
import { DashboardContext } from './DashboardContextDefinition';

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<{ topSelling: TopProduct[]; lowSelling: TopProduct[] }>({
    topSelling: [],
    lowSelling: []
  });
  const [ordersStats, setOrdersStats] = useState<OrdersStatsData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [activities, setActivities] = useState<ActivityData[]>([]);

  const [loading, setLoading] = useState({
    overview: true,
    revenue: true,
    topProducts: true,
    ordersStats: true,
    reviews: true,
    activities: true,
  });

  const [errors, setErrors] = useState({
    overview: null as string | null,
    revenue: null as string | null,
    topProducts: null as string | null,
    ordersStats: null as string | null,
    reviews: null as string | null,
    activities: null as string | null,
  });

  const fetchAllData = async () => {
    // Fetch data with delays to avoid rate limiting
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // 1. Overview (most important)
      setLoading(prev => ({ ...prev, overview: true }));
      try {
        const overviewRes = await dashboardService.getOverview(dateRange.startDate, dateRange.endDate);
        if (overviewRes?.success && overviewRes.data) {
          setOverview(overviewRes.data);
          setErrors(prev => ({ ...prev, overview: null }));
        }
      } catch (err: unknown) {
        console.error('Error fetching overview:', err);
        setErrors(prev => ({ ...prev, overview: err instanceof Error ? err.message : 'Lỗi không xác định' }));
      } finally {
        setLoading(prev => ({ ...prev, overview: false }));
      }

      await delay(300);

      // 2. Revenue
      setLoading(prev => ({ ...prev, revenue: true }));
      try {
        const revenueRes = await dashboardService.getRevenue(dateRange.startDate, dateRange.endDate);
        if (revenueRes?.success && revenueRes.data?.chart) {
          setRevenue(Array.isArray(revenueRes.data.chart) ? revenueRes.data.chart : []);
          setErrors(prev => ({ ...prev, revenue: null }));
        } else {
          setRevenue([]);
        }
      } catch (err: unknown) {
        console.error('Error fetching revenue:', err);
        setErrors(prev => ({ ...prev, revenue: err instanceof Error ? err.message : 'Lỗi không xác định' }));
      } finally {
        setLoading(prev => ({ ...prev, revenue: false }));
      }

      await delay(300);

      // 3. Top Products
      setLoading(prev => ({ ...prev, topProducts: true }));
      try {
        const productsRes = await dashboardService.getTopProducts(dateRange.startDate, dateRange.endDate);
        if (productsRes?.success && productsRes.data) {
          const topSelling = productsRes.data.bestSellers || [];
          const lowSelling = productsRes.data.worstSellers || [];
          setTopProducts({
            topSelling: Array.isArray(topSelling) ? topSelling : [],
            lowSelling: Array.isArray(lowSelling) ? lowSelling : [],
          });
          setErrors(prev => ({ ...prev, topProducts: null }));
        }
      } catch (err: unknown) {
        console.error('Error fetching top products:', err);
        setErrors(prev => ({ ...prev, topProducts: err instanceof Error ? err.message : 'Lỗi không xác định' }));
      } finally {
        setLoading(prev => ({ ...prev, topProducts: false }));
      }

      await delay(300);

      // 4. Orders Stats
      setLoading(prev => ({ ...prev, ordersStats: true }));
      try {
        const ordersRes = await dashboardService.getOrdersStats(dateRange.startDate, dateRange.endDate);
        if (ordersRes?.success) {
          const ordersData = ordersRes.data?.current?.ordersByHour || ordersRes.data || [];
          setOrdersStats(Array.isArray(ordersData) ? ordersData : []);
          setErrors(prev => ({ ...prev, ordersStats: null }));
        }
      } catch (err: unknown) {
        console.error('Error fetching orders stats:', err);
        setErrors(prev => ({ ...prev, ordersStats: err instanceof Error ? err.message : 'Lỗi không xác định' }));
      } finally {
        setLoading(prev => ({ ...prev, ordersStats: false }));
      }

      await delay(300);

      // 5. Reviews
      setLoading(prev => ({ ...prev, reviews: true }));
      try {
        const reviewsRes = await dashboardService.getReviewsStats(3);
        if (reviewsRes?.success && reviewsRes.data?.recentReviews) {
          setReviews(Array.isArray(reviewsRes.data.recentReviews) ? reviewsRes.data.recentReviews : []);
          setReviewsTotal(reviewsRes.data.totalReviews || 0);
          setErrors(prev => ({ ...prev, reviews: null }));
        }
      } catch (err: unknown) {
        console.error('Error fetching reviews:', err);
        setErrors(prev => ({ ...prev, reviews: err instanceof Error ? err.message : 'Lỗi không xác định' }));
      } finally {
        setLoading(prev => ({ ...prev, reviews: false }));
      }

      await delay(300);

      // 6. Recent Activities
      setLoading(prev => ({ ...prev, activities: true }));
      try {
        const activitiesRes = await dashboardService.getRecentActivities(10);
        if (activitiesRes?.success && activitiesRes.data?.activities) {
          setActivities(Array.isArray(activitiesRes.data.activities) ? activitiesRes.data.activities : []);
          setErrors(prev => ({ ...prev, activities: null }));
        }
      } catch (err: unknown) {
        console.error('Error fetching activities:', err);
        setErrors(prev => ({ ...prev, activities: err instanceof Error ? err.message : 'Lỗi không xác định' }));
      } finally {
        setLoading(prev => ({ ...prev, activities: false }));
      }
    } catch (error) {
      console.error('Error in fetchAllData:', error);
    }
  };

  // Check user role once on mount
  useEffect(() => {
    console.log('[DashboardContext] Checking user role...');
    const checkAdmin = async () => {
      const user = await authService.getCurrentUser();
      const userIsAdmin = user?.role_name?.toLowerCase() === 'admin';
      console.log('[DashboardContext] User is admin:', userIsAdmin);
      setIsAdmin(userIsAdmin);
      setIsChecked(true);
    };
    
    checkAdmin();
  }, []); // Only run once on mount

  // Fetch data when admin status is checked or date range changes
  useEffect(() => {
    if (!isChecked) {
      console.log('[DashboardContext] Admin check not completed yet');
      return; // Wait for admin check to complete
    }
    
    console.log('[DashboardContext] Date range changed or admin status updated:', {
      isAdmin,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
    
    if (isAdmin) {
      console.log('[DashboardContext] Fetching dashboard data...');
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.startDate, dateRange.endDate, isAdmin, isChecked]);

  const refreshData = () => {
    // Only refresh if user is admin
    if (isAdmin) {
      fetchAllData();
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        dateRange,
        setDateRange,
        overview,
        revenue,
        topProducts,
        ordersStats,
        reviews,
        reviewsTotal,
        activities,
        loading,
        errors,
        refreshData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
