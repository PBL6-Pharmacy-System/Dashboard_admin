import { api } from './api';

interface InventoryTransfer {
  id: number;
  transfer_number: string;
  from_branch_id: number;
  to_branch_id: number;
  status: 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled';
  notes?: string;
  created_by: number;
  approved_by?: number;
  shipped_by?: number;
  received_by?: number;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  shipped_at?: string;
  received_at?: string;
}

const inventoryTransferService = {
  async getAllTransfers(params?: {
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
    
    return api.get(`/inventory-transfers${query.toString() ? '?' + query.toString() : ''}`);
  },

  async getTransferById(id: number) {
    return api.get(`/inventory-transfers/${id}`);
  },

  async createTransfer(data: {
    from_branch_id: number;
    to_branch_id: number;
    notes?: string;
    items: Array<{
      product_id: number;
      quantity: number;
    }>;
  }) {
    return api.post('/inventory-transfers', data);
  },

  async approveTransfer(id: number) {
    return api.post(`/inventory-transfers/${id}/approve`, {});
  },

  async shipTransfer(id: number) {
    return api.post(`/inventory-transfers/${id}/ship`, {});
  },

  async receiveTransfer(id: number) {
    return api.post(`/inventory-transfers/${id}/receive`, {});
  },

  async cancelTransfer(id: number, reason: string) {
    return api.post(`/inventory-transfers/${id}/cancel`, { reason });
  }
};

export { inventoryTransferService, type InventoryTransfer };
