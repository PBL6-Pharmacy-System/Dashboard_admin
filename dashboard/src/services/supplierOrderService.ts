import { api } from './api';

interface SupplierOrder {
  id: number;
  supplier_id: number;
  branch_id: number;
  order_number: string;
  status: 'draft' | 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled';
  total_amount: number;
  notes?: string;
  note?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  expected_delivery_date?: string;
  order_date?: string;
  // Nested objects from backend
  suppliers?: {
    id: number;
    name: string;
    contact_info?: string;
  };
  branches?: {
    id: number;
    name?: string;
    branch_name?: string;
  };
  supplierOrderItem?: SupplierOrderItem[];
  items?: SupplierOrderItem[]; // Backward compatibility
}

interface SupplierOrderItem {
  id: number;
  supplier_order_id: number;
  product_id: number;
  quantity: number;
  unit_cost?: number;
  unit_price?: number;
  total_cost?: number;
  subtotal?: number;
  received_quantity?: number;
  manufacturing_date?: string;
  expiry_date?: string;
  products?: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  };
  product?: {
    id: number;
    name: string;
  };
}

const supplierOrderService = {
  async getAllOrders(params?: {
    supplierId?: number;
    supplier_id?: number;
    branchId?: number;
    branch_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    // Backend expects supplier_id and branch_id (snake_case)
    const supplierIdValue = params?.supplier_id || params?.supplierId;
    const branchIdValue = params?.branch_id || params?.branchId;
    
    if (supplierIdValue) query.append('supplier_id', String(supplierIdValue));
    if (branchIdValue) query.append('branch_id', String(branchIdValue));
    if (params?.status) query.append('status', params.status);
    if (params?.start_date) query.append('start_date', params.start_date);
    if (params?.end_date) query.append('end_date', params.end_date);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
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
    expected_date?: string;
    note?: string;
    notes?: string;
    items: Array<{
      product_id: number;
      quantity: number;
      unit_price?: number;
      cost_price?: number;
      unit_cost?: number;
      batch_number?: string;
      manufacture_date?: string;
      manufacturing_date?: string;
      expiry_date?: string;
      note?: string;
    }>;
  }) {
    // Build payload theo API backend
    const payload: Record<string, unknown> = {
      supplier_id: data.supplier_id,
      branch_id: data.branch_id,
      items: data.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price || item.cost_price || item.unit_cost || 0,
        batch_number: item.batch_number,
        manufacture_date: item.manufacture_date || item.manufacturing_date,
        expiry_date: item.expiry_date,
        note: item.note
      }))
    };
    
    // Add optional fields
    if (data.expected_date) {
      payload.expected_date = data.expected_date;
    }
    
    const noteValue = data.note || data.notes;
    if (noteValue && typeof noteValue === 'string' && noteValue.trim()) {
      payload.note = noteValue.trim();
    }
    
    console.log('✅ Supplier order payload:', JSON.stringify(payload, null, 2));
    
    return api.post('/supplier-orders', payload);
  },

  async updateOrderStatus(id: number, status: string) {
    return api.patch(`/supplier-orders/${id}/status`, { status });
  },

  // Nhận hàng từ NCC - TỰ ĐỘNG NHẬP KHO
  // ⚠️ Tự động cập nhật branchinventory.stock và tạo productBatch
  async receiveOrder(id: number, receivedItems?: Array<{
    product_id: number;
    received_qty: number;
  }>) {
    return api.post(`/supplier-orders/${id}/receive`, { receivedItems });
  },

  async cancelOrder(id: number, reason: string) {
    return api.post(`/supplier-orders/${id}/cancel`, { reason });
  },

  async getStatistics(params?: {
    startDate?: string;
    start_date?: string;
    endDate?: string;
    end_date?: string;
    supplierId?: number;
    supplier_id?: number;
    branchId?: number;
    branch_id?: number;
  }) {
    const query = new URLSearchParams();
    // Backend expects snake_case parameters
    const startDateValue = params?.start_date || params?.startDate;
    const endDateValue = params?.end_date || params?.endDate;
    const supplierIdValue = params?.supplier_id || params?.supplierId;
    const branchIdValue = params?.branch_id || params?.branchId;
    
    if (startDateValue) query.append('start_date', startDateValue);
    if (endDateValue) query.append('end_date', endDateValue);
    if (supplierIdValue) query.append('supplier_id', String(supplierIdValue));
    if (branchIdValue) query.append('branch_id', String(branchIdValue));
    
    return api.get(`/supplier-orders/statistics${query.toString() ? '?' + query.toString() : ''}`);
  }
};

export { supplierOrderService, type SupplierOrder, type SupplierOrderItem };
