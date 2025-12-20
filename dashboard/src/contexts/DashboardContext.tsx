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
  AnalyticsInsight,
  Branch,
} from '../types/dashboard.types';
import { DashboardContext } from './DashboardContextDefinition';

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);

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
  const [analytics, setAnalytics] = useState<AnalyticsInsight[]>([]);

  const [loading, setLoading] = useState({
    overview: true,
    revenue: true,
    topProducts: true,
    ordersStats: true,
    reviews: true,
    activities: true,
    analytics: true,
    branches: true,
  });

  const [errors, setErrors] = useState({
    overview: null as string | null,
    revenue: null as string | null,
    topProducts: null as string | null,
    ordersStats: null as string | null,
    reviews: null as string | null,
    activities: null as string | null,
    analytics: null as string | null,
    branches: null as string | null,
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

      await delay(300);

      // 7. Analytics Insights (Don't let this block the UI)
      setLoading(prev => ({ ...prev, analytics: true }));
      try {
        console.log('🔄 Fetching analytics insights...', { 
          selectedBranch: selectedBranch || 'all branches',
          hasSelectedBranch: selectedBranch !== null 
        });
        
        const analyticsRes = await dashboardService.getAnalytics(selectedBranch || undefined);
        console.log('📊 Analytics API raw response:', analyticsRes);
        
        // Check if insights is an array or object
        let insightsArray: AnalyticsInsight[] = [];
        
        // Try multiple paths to find insights
        // Response structure could be:
        // 1. { success: true, data: { insights: {...} } }  <- Standard API wrapper
        // 2. { insights: {...} }                           <- Direct response
        // 3. { data: { insights: {...} } }                 <- Partial wrapper
        const insights = analyticsRes?.data?.insights || analyticsRes?.insights || null;
        
        console.log('📊 Found insights:', !!insights);
        console.log('📊 Insights type:', typeof insights);
        console.log('📊 Insights value:', insights);
        
        if (insights && typeof insights === 'object' && insights !== null) {
          // If insights is already an array
          if (Array.isArray(insights)) {
            insightsArray = insights;
            console.log('✅ Insights is array:', insightsArray.length);
          } 
          // If insights is an object with key-value pairs
          else {
            console.log('📝 Converting insights object to array...');
            const keys = Object.keys(insights);
            console.log('📝 Insights keys:', keys);
            
            // Map of insight keys to types and severity
            const insightMapping: Record<string, { type: string; severity: string }> = {
              revenue_trend: { type: 'revenue', severity: 'info' },
              sales_performance: { type: 'sales', severity: 'warning' },
              customer_behavior: { type: 'order', severity: 'info' },
              product_recommendations: { type: 'product', severity: 'info' },
              inventory_alert: { type: 'inventory', severity: 'success' },
            };
            
            // Convert object to array
            insightsArray = (Object.entries(insights)
              .filter(([key, value]) => {
                const isValid = typeof value === 'string' && value.length > 0;
                if (!isValid) {
                  console.warn(`⚠️ Skipping invalid insight: ${key}`, typeof value);
                }
                return isValid;
              }) as any)
              .map(([key, value]: [string, any]) => {
                const mapping = insightMapping[key] || { type: 'general', severity: 'info' };
                return {
                  message: String(value),
                  type: mapping.type,
                  severity: mapping.severity,
                };
              });
            
            console.log('✅ Converted insights:', insightsArray.length, 'items');
            console.log('✅ Insights preview:', insightsArray.map(i => `${i.type}: ${i.message.substring(0, 50)}...`));
          }
        } else {
          console.log('⚠️ No valid insights found');
        }
        
        console.log('✅ Final insights count:', insightsArray.length);
        setAnalytics(insightsArray);
        setErrors(prev => ({ ...prev, analytics: null }));
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
        
        // Check if it's a CORS error
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('CORS')) {
          console.warn('⚠️ CORS error khi gọi analytics API - có thể do ngrok chưa config đúng');
          console.warn('💡 Giải pháp: Kiểm tra backend có enable CORS cho ngrok domain');
        } else {
          console.error('❌ Error fetching analytics:', err);
        }
        
        setErrors(prev => ({ ...prev, analytics: errorMessage }));
        setAnalytics([]);
      } finally {
        setLoading(prev => ({ ...prev, analytics: false }));
      }
    } catch (error) {
      console.error('Error in fetchAllData:', error);
    }
  };

  // Fetch branches once on mount
  const fetchBranches = async () => {
    setLoading(prev => ({ ...prev, branches: true }));
    try {
      console.log('[DashboardContext] Fetching branches...');
      
      // Method 1: Try to get branches from analytics API (Skip if causing CORS)
      try {
        const analyticsRes = await dashboardService.getAnalytics(); // No branch_id
        console.log('[DashboardContext] Analytics response for branches:', analyticsRes);
        
        // Check if response has revenue.by_branch with branch info
        if (analyticsRes?.revenue?.by_branch && Array.isArray(analyticsRes.revenue.by_branch)) {
          const branchesFromAnalytics = analyticsRes.revenue.by_branch
            .filter((b: any) => b.branch_id)
            .map((b: any) => ({
              branch_id: b.branch_id,
              name: b.branch_name || `Chi nhánh ${b.branch_id}`,
            }));
          
          if (branchesFromAnalytics.length > 0) {
            console.log('[DashboardContext] Found branches from analytics:', branchesFromAnalytics.length);
            setBranches(branchesFromAnalytics);
            setErrors(prev => ({ ...prev, branches: null }));
            setLoading(prev => ({ ...prev, branches: false }));
            return;
          }
        }
      } catch (err) {
        console.warn('[DashboardContext] Could not get branches from analytics (CORS or API error):', err);
        // Don't throw - continue to fallback
      }
      
      // Method 2: Use mock data as fallback
      console.warn('[DashboardContext] Using MOCK branch data for testing...');
      const mockBranches: Branch[] = [
        { branch_id: 1, name: 'Chi nhánh 1 - Hà Nội' },
        { branch_id: 2, name: 'Chi nhánh 2 - Hồ Chí Minh' },
        { branch_id: 3, name: 'Chi nhánh 3 - Đà Nẵng' },
      ];
      setBranches(mockBranches);
      setErrors(prev => ({ ...prev, branches: null }));
      
      /* Original code - uncomment when branch-sales API ready:
      const branchesRes = await dashboardService.getAllBranches();
      if (branchesRes?.success && branchesRes.data) {
        const uniqueBranches: Branch[] = [];
        const seenIds = new Set<number>();
        
        if (Array.isArray(branchesRes.data)) {
          branchesRes.data.forEach((item: any) => {
            if (item.branch_id && !seenIds.has(item.branch_id)) {
              seenIds.add(item.branch_id);
              uniqueBranches.push({
                branch_id: item.branch_id,
                name: item.branch_name || `Chi nhánh ${item.branch_id}`,
              });
            }
          });
        }
        
        setBranches(uniqueBranches);
        setErrors(prev => ({ ...prev, branches: null }));
      } else {
        console.warn('No branch data available');
        setBranches([]);
      }
      */
    } catch (err: unknown) {
      console.error('Error fetching branches:', err);
      setErrors(prev => ({ ...prev, branches: err instanceof Error ? err.message : 'Lỗi không xác định' }));
      setBranches([]);
    } finally {
      setLoading(prev => ({ ...prev, branches: false }));
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
      
      // Fetch branches if admin
      if (userIsAdmin) {
        fetchBranches();
      }
    };
    
    checkAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Fetch data when admin status is checked or date range/branch changes
  useEffect(() => {
    if (!isChecked) {
      console.log('[DashboardContext] Admin check not completed yet');
      return; // Wait for admin check to complete
    }
    
    console.log('[DashboardContext] Date range or branch changed:', {
      isAdmin,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      selectedBranch
    });
    
    if (isAdmin) {
      console.log('[DashboardContext] Fetching dashboard data...');
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.startDate, dateRange.endDate, selectedBranch, isAdmin, isChecked]);

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
        selectedBranch,
        setSelectedBranch,
        branches,
        overview,
        revenue,
        topProducts,
        ordersStats,
        reviews,
        reviewsTotal,
        activities,
        analytics,
        loading,
        errors,
        refreshData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
