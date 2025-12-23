// Flash Sale Types and Interfaces

export interface FlashSaleProduct {
  id: number;
  product_id: number;
  flash_sale_id: number;
  flash_price: number;
  stock_limit: number;
  sold_count?: number;
  purchase_limit?: number;
  created_at?: string;
  updated_at?: string;
  // Product details (populated from join)
  product?: {
    id: number;
    name: string;
    price: number;
    stock?: number;
    image?: string;
    sku?: string;
  };
}

export interface FlashSale {
  id: number;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  status?: 'pending' | 'active' | 'ended'; // ✅ Status từ backend
  created_at?: string;
  updated_at?: string;
  products?: FlashSaleProduct[];
}

export interface FlashSaleFormData {
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  products: FlashSaleProductInput[];
}

export interface FlashSaleProductInput {
  product_id: number;
  flash_price: number;
  stock_limit: number;
  purchase_limit?: number;
  // For UI display
  product_name?: string;
  product_price?: number;
  product_stock?: number;
  product_image?: string;
  product_sku?: string;
}

export interface FlashSaleFilter {
  search?: string;
  status?: 'active' | 'pending' | 'ended' | 'all';
  start_date?: string;
  end_date?: string;
}

export type FlashSaleStatus = 'active' | 'pending' | 'ended';

export interface FlashSaleStatusInfo {
  status: FlashSaleStatus;
  label: string;
  color: string;
  bgColor: string;
}

// API Response Types
export interface FlashSaleListResponse {
  success: boolean;
  data: FlashSale[];
  total?: number;
}

export interface FlashSaleDetailResponse {
  success: boolean;
  data: FlashSale;
}

export interface FlashSaleCreateResponse {
  success: boolean;
  data: FlashSale;
  message?: string;
}

export interface FlashSaleUpdateResponse {
  success: boolean;
  data: FlashSale;
  message?: string;
}

export interface FlashSaleDeleteResponse {
  success: boolean;
  message?: string;
}
