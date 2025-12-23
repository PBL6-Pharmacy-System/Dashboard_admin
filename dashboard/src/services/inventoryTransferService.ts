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
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const query = new URLSearchParams();
    if (params?.branchId) query.append('branchId', String(params.branchId));
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
    
    return api.get(`/inventory-transfers${query.toString() ? '?' + query.toString() : ''}`);
  },

  async getTransferById(id: number) {
    return api.get(`/inventory-transfers/${id}`);
  },

  // Tạo phiếu chuyển kho - Chỉ chuyển 1 product mỗi lần theo API backend
  async createTransfer(data: {
    from_branch_id: number;
    to_branch_id: number;
    product_id: number;
    quantity: number;
    note?: string;
  }) {
    return api.post('/inventory-transfers', data);
  },

  // Workflow: pending → approved → shipped → completed
  async approveTransfer(id: number) {
    return api.post(`/inventory-transfers/${id}/approve`, {});
  },

  async shipTransfer(id: number, tracking_number?: string) {
    return api.post(`/inventory-transfers/${id}/ship`, { tracking_number });
  },

  // Tự động tạo lô hàng mới tại chi nhánh đích
  async receiveTransfer(id: number) {
    return api.post(`/inventory-transfers/${id}/receive`, {});
  },

  async cancelTransfer(id: number, reason: string) {
    return api.post(`/inventory-transfers/${id}/cancel`, { reason });
  }
};

export { inventoryTransferService, type InventoryTransfer };
