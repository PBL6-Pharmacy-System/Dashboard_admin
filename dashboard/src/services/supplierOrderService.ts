import { api } from './api';

interface SupplierOrder {
  id: number;
  supplier_id: number;
  branch_id: number;
  order_number: string;
  status: 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled';
  total_amount: number;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  items?: SupplierOrderItem[];
}

interface SupplierOrderItem {
  id: number;
  supplier_order_id: number;
  product_id: number;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  received_quantity?: number;
  manufacturing_date?: string;
  expiry_date?: string;
}

const supplierOrderService = {
  async getAllOrders(params?: {
    supplierId?: number;
    branchId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.supplierId) query.append('supplierId', String(params.supplierId));
    if (params?.branchId) query.append('branchId', String(params.branchId));
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    
    return api.get(`/supplier-orders${query.toString() ? '?' + query.toString() : ''}`);
  },

  async getOrderById(id: number) {
    return api.get(`/supplier-orders/${id}`);
  },

  async createOrder(data: {
    supplier_id: number;
    branch_id: number;
    notes?: string;
    items: Array<{
      product_id: number;
      quantity: number;
      unit_cost: number;
      manufacturing_date?: string;
      expiry_date?: string;
    }>;
  }) {
    return api.post('/supplier-orders', data);
  },

  async updateOrderStatus(id: number, status: string, receivedItems?: any[]) {
    return api.patch(`/supplier-orders/${id}/status`, { status, receivedItems });
  },

  async receiveOrder(id: number, receivedItems: Array<{
    product_id: number;
    received_quantity: number;
    manufacturing_date?: string;
    expiry_date?: string;
  }>) {
    return api.post(`/supplier-orders/${id}/receive`, { receivedItems });
  },

  async cancelOrder(id: number, reason: string) {
    return api.post(`/supplier-orders/${id}/cancel`, { reason });
  },

  async getStatistics(params?: {
    startDate?: string;
    endDate?: string;
    supplierId?: number;
    branchId?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.supplierId) query.append('supplierId', String(params.supplierId));
    if (params?.branchId) query.append('branchId', String(params.branchId));
    
    return api.get(`/supplier-orders/statistics${query.toString() ? '?' + query.toString() : ''}`);
  }
};

export { supplierOrderService, type SupplierOrder, type SupplierOrderItem };
