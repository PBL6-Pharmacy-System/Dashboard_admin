import { api } from './api';

interface StockTake {
  id: number;
  branch_id: number;
  stock_take_number?: string;
  stock_take_no?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  note?: string;
  created_by?: number;
  started_by?: number;
  created_at: string;
  updated_at: string;
  start_date?: string;
  completed_at?: string;
  completion_date?: string;
  // Nested objects from backend
  branches?: {
    id: number;
    name?: string;
    branch_name?: string;
    address?: string;
  };
  users_stockTake_started_byTousers?: {
    id: number;
    username: string;
    full_name?: string;
  };
  users_stockTake_completed_byTousers?: {
    id: number;
    username: string;
    full_name?: string;
  };
  stockTakeItem?: StockTakeItem[];
}

interface StockTakeItem {
  id: number;
  stock_take_id: number;
  product_id: number;
  expected_quantity?: number;
  system_qty?: number;
  actual_quantity?: number;
  actual_qty?: number;
  difference?: number;
  variance?: number;
  variance_value?: number;
  notes?: string;
  products?: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  };
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
    // Backend expects actual_qty, not actual_quantity
    const payload = {
      actual_qty: data.actual_quantity,
      note: data.notes
    };
    return api.put(`/stock-takes/${stockTakeId}/items/${itemId}`, payload);
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
