import type { ReactNode } from 'react';

export interface StatCardData {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: ReactNode;
  bgColor: string;
}

export interface DrugItem {
  id: string;
  productName: string;
  productImage: string;
  batchNo: string;
  expiryDate: string;
  daysLeft: number;
  stock: number;
  unit: string;
  status: 'Critical' | 'Warning' | 'Good';
}

// Thay '[key: string]: any' bằng 'string | number | undefined' 
// Đây là kiểu dữ liệu an toàn cho các biểu đồ (chỉ chứa chữ hoặc số)
export interface SalesData {
  date: string;
  display: string;
  value: number;
  [key: string]: string | number | undefined; 
}

export interface ProductData {
  name: string;
  sales: number;
  amount: number;
  [key: string]: string | number | undefined;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number | undefined;
}

export interface ChartProps {
  startDate: string;
  endDate: string;
}

// Cập nhật Interface Product để hỗ trợ quản lý kho chi nhánh
export interface Product {
  id: string;
  image: string;
  name: string;
  category: string;
  price: number;
  totalStock: number; // Tổng tồn kho
  minStock: number;   // Định mức tối thiểu
  availableColors: string[];
  expiryDate: string; // Thêm hạn dùng cho quản lý kho
  // Quản lý tồn kho theo chi nhánh
  branches: {
    name: string;
    stock: number;
  }[];
}

// ============= DASHBOARD API TYPES =============

// 1. Revenue API Response
export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface RevenueResponse {
  success: boolean;
  data: {
    period: string;
    dateRange: {
      startDate: string;
      endDate: string;
      days: number;
    };
    current: {
      totalRevenue: number;
      totalOrders: number;
      averageOrderValue: number;
    };
    chart: RevenueData[];
    comparison: {
      previousPeriod: {
        revenue: number;
        orders: number;
        averageOrderValue: number;
      };
      growth: {
        revenue: string;
        orders: string;
      };
    };
  };
}

// 2. Top Products API Response
export interface TopProduct {
  productId: number;
  name: string;
  category: string;
  image: string;
  soldQuantity: number;
  revenue: number;
}

export interface TopProductsResponse {
  success: boolean;
  data: {
    period: string;
    bestSellers: TopProduct[];
    worstSellers: TopProduct[];
    totalProducts: number;
  };
}

// 3. Orders Stats API Response
export interface OrdersStatsData {
  hour: string;  // "00:00", "01:00", etc.
  count: number;
}

export interface OrdersStatsResponse {
  success: boolean;
  data: {
    period: string;
    current: {
      total: number;
      statusBreakdown: {
        pending: number;
        processing: number;
        shipping: number;
        completed: number;
        cancelled: number;
      };
      ordersByHour: OrdersStatsData[];
      averageProcessingTime: string;
      cancellationRate: string;
    };
    comparison?: {
      previousPeriod: {
        total: number;
        statusBreakdown: Record<string, number>;
      };
      growth: string;
    };
  };
}

// 4. Overview API Response
export interface OverviewData {
  revenue: {
    today: number;
    thisMonth: number;
    lastMonth: number;
    growth: string;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
    newThisMonth: number;
    activeToday: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
    activeToday: number;
  };
  products: {
    total: number;
    outOfStock: number;
    lowStock: number;
    expiringToday: number;
    expiringNext30: number;
  };
}

export interface OverviewResponse {
  success: boolean;
  data: OverviewData;
}

// 5. Inventory Stats API Response
export interface InventoryStatsData {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  expiringProducts: number;
}

export interface InventoryStatsResponse {
  success: boolean;
  data: InventoryStatsData;
}

// 6. Branch Sales API Response
export interface BranchSalesData {
  branch_id: number;
  branch_name: string;
  total_revenue: number;
  total_orders: number;
}

export interface BranchSalesResponse {
  success: boolean;
  data: BranchSalesData[];
}

// 7. Promotions Stats API Response
export interface PromotionsStatsData {
  totalPromotions: number;
  activePromotions: number;
  expiredPromotions: number;
  upcomingPromotions: number;
}

export interface PromotionsStatsResponse {
  success: boolean;
  data: PromotionsStatsData;
}

// 8. Reviews Stats API Response
export interface ReviewData {
  id: number;
  productId: number;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewsStatsResponse {
  success: boolean;
  data: {
    averageRating: string;
    totalReviews: number;
    ratingDistribution: {
      "5stars": number;
      "4stars": number;
      "3stars": number;
      "2stars": number;
      "1star": number;
    };
    recentReviews: ReviewData[];
    pendingModeration: number;
  };
}

// 9. Recent Activities API Response
export interface ActivityData {
  type: string;
  message: string;
  orderId?: number;
  customer?: string;
  amount?: number;
  productId?: number;
  currentStock?: number;
  customerId?: number;
  name?: string;
  timestamp: string;
}

export interface RecentActivitiesResponse {
  success: boolean;
  data: {
    activities: ActivityData[];
  };
}

// 10. Analytics API Response (AI Insights)
export interface AnalyticsInsight {
  type: string;
  message: string;
  severity?: 'info' | 'warning' | 'success' | 'error';
  data?: any;
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    insights: AnalyticsInsight[];
    summary?: string;
  };
}

// Branch type
export interface Branch {
  branch_id: number;
  name: string;
  address?: string;
}