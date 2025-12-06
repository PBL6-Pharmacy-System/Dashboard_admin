import { createContext } from 'react';
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

export interface DashboardContextType {
  // Date range
  dateRange: {
    startDate: string;
    endDate: string;
  };
  setDateRange: (range: { startDate: string; endDate: string }) => void;
  
  // Branch filter
  selectedBranch: number | null;
  setSelectedBranch: (branchId: number | null) => void;
  branches: Branch[];
  
  // Dashboard data
  overview: OverviewData | null;
  revenue: RevenueData[];
  topProducts: {
    topSelling: TopProduct[];
    lowSelling: TopProduct[];
  };
  ordersStats: OrdersStatsData[];
  reviews: ReviewData[];
  reviewsTotal: number;
  activities: ActivityData[];
  analytics: AnalyticsInsight[];
  
  // Loading states
  loading: {
    overview: boolean;
    revenue: boolean;
    topProducts: boolean;
    ordersStats: boolean;
    reviews: boolean;
    activities: boolean;
    analytics: boolean;
    branches: boolean;
  };
  
  // Error states
  errors: {
    overview: string | null;
    revenue: string | null;
    topProducts: string | null;
    ordersStats: string | null;
    reviews: string | null;
    activities: string | null;
    analytics: string | null;
    branches: string | null;
  };
  
  // Refresh function
  refreshData: () => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);
