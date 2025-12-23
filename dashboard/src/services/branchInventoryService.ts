import { api } from './api';

export interface BranchInventoryItem {
  id: number;
  branch_id: number;
  product_id: number;
  stock: number; // Số lượng tồn kho thực tế
  min_stock: number;
  max_stock: number;
  reserved_quantity: number;
  available_quantity: number;
  last_updated: string;
  branches?: {
    id: number;
    branch_name: string;
    address: string;
    phone: string;
  };
  products?: {
    id: number;
    name: string;
    image_url: string | null;
    unittype: {
      id: number;
      name: string;
    } | null;
  };
}

export interface BranchInventoryResponse {
  success: boolean;
  data: {
    inventory: BranchInventoryItem[];
    pagination?: {
      page: number;
      limit: number;
      totalPages: number;
      totalRecords: number;
    };
  };
}

export const branchInventoryService = {
  /**
   * Lấy danh sách tồn kho theo chi nhánh và/hoặc sản phẩm
   * @param params - Tham số filter và pagination
   */
  async getBranchInventory(params?: {
    branchId?: number;
    productId?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<BranchInventoryResponse> {
    const query = new URLSearchParams();
    
    if (params?.branchId) query.append('branch_id', String(params.branchId));
    if (params?.productId) query.append('product_id', String(params.productId));
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

    const response = await api.get(`/branch-inventory${query.toString() ? '?' + query.toString() : ''}`);
    
    // API response structure: { success: true, data: { inventory: [...], pagination: {...} } }
    return response;
  },

  /**
   * Lấy tồn kho của một sản phẩm tại một chi nhánh cụ thể
   * @param branchId - ID chi nhánh
   * @param productId - ID sản phẩm
   */
  async getProductStockAtBranch(branchId: number, productId: number): Promise<BranchInventoryItem | null> {
    try {
      const response = await this.getBranchInventory({
        branchId,
        productId,
        limit: 1
      });

      if (response.success && response.data.inventory.length > 0) {
        return response.data.inventory[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error getting product stock at branch:', error);
      return null;
    }
  },

  /**
   * Lấy tồn kho của nhiều sản phẩm tại một chi nhánh
   * @param branchId - ID chi nhánh
   * @param productIds - Danh sách ID sản phẩm
   */
  async getMultipleProductsStockAtBranch(branchId: number, productIds: number[]): Promise<Map<number, BranchInventoryItem>> {
    const stockMap = new Map<number, BranchInventoryItem>();
    
    try {
      // Lấy tất cả inventory của chi nhánh này
      const response = await this.getBranchInventory({
        branchId,
        limit: 10000 // Lấy tất cả
      });

      if (response.success) {
        response.data.inventory.forEach(item => {
          if (productIds.includes(item.product_id)) {
            stockMap.set(item.product_id, item);
          }
        });
      }
    } catch (error) {
      console.error('Error getting multiple products stock:', error);
    }

    return stockMap;
  },

  /**
   * Lấy tất cả sản phẩm có tồn kho tại một chi nhánh
   * @param branchId - ID chi nhánh
   * @param options - Tùy chọn filter
   */
  async getAllProductsAtBranch(branchId: number, options?: {
    minStockOnly?: boolean; // Chỉ lấy sản phẩm có stock > min_stock
    inStockOnly?: boolean;  // Chỉ lấy sản phẩm có stock > 0
  }): Promise<BranchInventoryItem[]> {
    try {
      const response = await this.getBranchInventory({
        branchId,
        limit: 10000
      });

      if (!response.success) {
        return [];
      }

      let inventory = response.data.inventory;

      // Filter theo options
      if (options?.inStockOnly) {
        inventory = inventory.filter(item => item.stock > 0);
      }

      if (options?.minStockOnly) {
        inventory = inventory.filter(item => item.stock > item.min_stock);
      }

      return inventory;
    } catch (error) {
      console.error('Error getting all products at branch:', error);
      return [];
    }
  },

  /**
   * Lấy cảnh báo tồn kho thấp
   */
  async getLowStockAlerts(params?: {
    branchId?: number;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    
    if (params?.branchId) query.append('branchId', String(params.branchId));
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    return api.get(`/branch-inventory/alerts/low-stock${query.toString() ? '?' + query.toString() : ''}`);
  }
};
