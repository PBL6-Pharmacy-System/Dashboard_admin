import type {
  AnalyticsResponse,
  BranchSalesResponse,
  InventoryStatsResponse,
  OrdersStatsResponse,
  OverviewResponse,
  PromotionsStatsResponse,
  RecentActivitiesResponse,
  RevenueResponse,
  ReviewsStatsResponse,
  TopProductsResponse,
} from '../types/dashboard.types';
import { api, getAIBaseURL } from './api';

export const dashboardService = {
  // 1. Lấy dữ liệu doanh thu theo ngày
  async getRevenue(startDate?: string, endDate?: string): Promise<RevenueResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/admin/dashboard/revenue${query}`);
  },

  // 2. Lấy danh sách sản phẩm bán chạy và bán tệ
  async getTopProducts(startDate?: string, endDate?: string): Promise<TopProductsResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/admin/dashboard/top-products${query}`);
  },

  // 3. Lấy thông tin số order trong từng giờ
  async getOrdersStats(startDate?: string, endDate?: string): Promise<OrdersStatsResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/admin/dashboard/orders-stats${query}`);
  },

  // 4. Lấy thông tin tổng quan (doanh thu, số order, số khách hàng, số sản phẩm)
  async getOverview(startDate?: string, endDate?: string): Promise<OverviewResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/admin/dashboard/overview${query}`);
  },

  // 5. Lấy thông tin inventory
  async getInventoryStats(): Promise<InventoryStatsResponse> {
    return api.get('/admin/dashboard/inventory-stats');
  },

  // 6. Lấy thông tin bán hàng của từng chi nhánh
  async getBranchSales(startDate?: string, endDate?: string): Promise<BranchSalesResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/admin/dashboard/branch-sales${query}`);
  },

  // 7. Lấy thông tin khuyến mãi
  async getPromotionsStats(): Promise<PromotionsStatsResponse> {
    return api.get('/admin/dashboard/promotions-stats');
  },

  // 8. Lấy danh sách bình luận đánh giá (limit 3 items mặc định)
  async getReviewsStats(limit: number = 3): Promise<ReviewsStatsResponse> {
    return api.get(`/admin/dashboard/reviews-stats?limit=${limit}`);
  },

  // 9. Lấy các hoạt động gần đây
  async getRecentActivities(limit: number = 10): Promise<RecentActivitiesResponse> {
    return api.get(`/admin/dashboard/recent-activities?limit=${limit}`);
  },

  // 10. Lấy analytics insights từ AI
  async getAnalytics(branchId?: number): Promise<AnalyticsResponse> {
    const params = branchId ? `?branch_id=${branchId}` : '';
    return api.get(`/admin/analytics${params}`, getAIBaseURL());
  },

  // 11. Lấy danh sách tất cả chi nhánh (sử dụng branch-sales API)
  async getAllBranches(): Promise<{ success: boolean; data: any[] }> {
    // Sử dụng API branch-sales với range 1 năm để lấy tất cả branches
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
    return this.getBranchSales(startDate, endDate);
  },
};
