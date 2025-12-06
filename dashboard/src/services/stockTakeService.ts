import { api } from './api';

interface StockTake {
  id: number;
  branch_id: number;
  stock_take_number: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface StockTakeItem {
  id: number;
  stock_take_id: number;
  product_id: number;
  expected_quantity: number;
  actual_quantity?: number;
  difference?: number;
  notes?: string;
}

const stockTakeService = {
  async getAllStockTakes(params?: {
    branchId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.branchId) query.append('branchId', String(params.branchId));
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    
    return api.get(`/stock-takes${query.toString() ? '?' + query.toString() : ''}`);
  },

  async getStockTakeById(id: number) {
    return api.get(`/stock-takes/${id}`);
  },

  async createStockTake(data: {
    branch_id: number;
    notes?: string;
  }) {
    return api.post('/stock-takes', data);
  },

  async getStockTakeItems(id: number) {
    return api.get(`/stock-takes/${id}/items`);
  },

  async updateStockTakeItem(stockTakeId: number, itemId: number, data: {
    actual_quantity: number;
    notes?: string;
  }) {
    return api.put(`/stock-takes/${stockTakeId}/items/${itemId}`, data);
  },

  async completeStockTake(id: number) {
    return api.post(`/stock-takes/${id}/complete`, {});
  },

  async cancelStockTake(id: number, reason: string) {
    return api.post(`/stock-takes/${id}/cancel`, { reason });
  },

  async deleteStockTake(id: number) {
    return api.delete(`/stock-takes/${id}`);
  }
};

export { stockTakeService, type StockTake, type StockTakeItem };
