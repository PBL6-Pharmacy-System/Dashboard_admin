import { api } from './api';

interface Branch {
  id: number;
  name?: string;
  branch_name?: string;
  address: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BranchInventory {
  id: number;
  branch_id: number;
  product_id: number;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  last_updated: string;
  product?: {
    product_id: number;
    product_name: string;
    unit_of_measure: string;
    image_url?: string;
  };
}

const branchService = {
  async getAllBranches(params?: {
    includeInventory?: boolean;
    search?: string;
    active?: boolean;
    hasInventory?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const query = new URLSearchParams();
    if (params?.includeInventory !== undefined) query.append('includeInventory', String(params.includeInventory));
    if (params?.search) query.append('search', params.search);
    if (params?.active !== undefined) query.append('active', String(params.active));
    if (params?.hasInventory !== undefined) query.append('hasInventory', String(params.hasInventory));
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
    
    return api.get(`/branches${query.toString() ? '?' + query.toString() : ''}`);
  },

  async getBranchById(id: number, includeInventory = false) {
    return api.get(`/branches/${id}?includeInventory=${includeInventory}`);
  },

  async createBranch(data: Partial<Branch>) {
    return api.post('/branches', data);
  },

  async updateBranch(id: number, data: Partial<Branch>) {
    return api.put(`/branches/${id}`, data);
  },

  async deleteBranch(id: number) {
    return api.delete(`/branches/${id}`);
  },

  async getBranchInventory(branchId: number, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
    
    return api.get(`/branches/${branchId}/inventory${query.toString() ? '?' + query.toString() : ''}`);
  },

  async getBranchInventoryProduct(branchId: number, productId: number) {
    return api.get(`/branches/${branchId}/inventory/${productId}`);
  },

  // ⚠️ KHÔNG cho phép cập nhật stock trực tiếp - chỉ cập nhật min/max stock
  // Stock chỉ thay đổi qua: nhập kho, xuất kho, chuyển kho, kiểm kê
  async updateInventoryConfig(branchId: number, productId: number, data: {
    min_stock?: number;
    max_stock?: number;
  }) {
    return api.put(`/branches/${branchId}/inventory/${productId}`, data);
  },

  async getLowStockAlerts(branchId: number, threshold?: number) {
    const query = threshold ? `?threshold=${threshold}` : '';
    return api.get(`/branches/${branchId}/inventory/alerts/low-stock${query}`);
  },

  async getExpiringAlerts(branchId: number, days: number = 30) {
    return api.get(`/branches/${branchId}/inventory/alerts/expiring-soon?days=${days}`);
  }
};

export { branchService, type Branch, type BranchInventory };
