import { api } from './api';

const inventoryStatisticsService = {
  async getOverview(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    
    return api.get(`/statistics/inventory/overview${query.toString() ? '?' + query.toString() : ''}`);
  },

  async getBranchStatistics(branchId: number, params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    
    return api.get(`/statistics/inventory/branch/${branchId}${query.toString() ? '?' + query.toString() : ''}`);
  },

  async getLowStock(threshold?: number) {
    const query = threshold ? `?threshold=${threshold}` : '';
    return api.get(`/statistics/inventory/low-stock${query}`);
  },

  async getOverstock(threshold?: number) {
    const query = threshold ? `?threshold=${threshold}` : '';
    return api.get(`/statistics/inventory/overstock${query}`);
  },

  async getMovements(params?: {
    branchId?: number;
    productId?: number;
    startDate?: string;
    endDate?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.branchId) query.append('branchId', String(params.branchId));
    if (params?.productId) query.append('productId', String(params.productId));
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.type) query.append('type', params.type);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    
    return api.get(`/statistics/inventory/movements${query.toString() ? '?' + query.toString() : ''}`);
  },

  async getTopImported(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.limit) query.append('limit', String(params.limit));
    
    return api.get(`/statistics/inventory/top-imported${query.toString() ? '?' + query.toString() : ''}`);
  },

  async getTopExported(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.limit) query.append('limit', String(params.limit));
    
    return api.get(`/statistics/inventory/top-exported${query.toString() ? '?' + query.toString() : ''}`);
  },

  async getByCategory(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    
    return api.get(`/statistics/inventory/by-category${query.toString() ? '?' + query.toString() : ''}`);
  }
};

export { inventoryStatisticsService };
