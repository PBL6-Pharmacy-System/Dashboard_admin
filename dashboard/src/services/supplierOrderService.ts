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
    note?: string;
    notes?: string;
    total_amount?: number;
    tax_amount?: number;
    discount_amount?: number;
    items: Array<{
      product_id: number;
      quantity: number;
      unit_cost: number;
      manufacturing_date?: string;
      expiry_date?: string;
    }>;
  }) {
    // Calculate totals
    const totalAmount = data.total_amount || 0;
    const taxAmount = data.tax_amount || 0;
    const discountAmount = data.discount_amount || 0;
    const finalAmount = totalAmount + taxAmount - discountAmount;
    
    console.log(`💰 Order Calculations:
      - Total: ${totalAmount}
      - Tax: ${taxAmount}
      - Discount: ${discountAmount}
      - Final: ${finalAmount}`);
    
    // Validate amounts
    if (isNaN(totalAmount) || totalAmount <= 0) {
      throw new Error(`Invalid total_amount: ${totalAmount}. Must be > 0 and a valid number.`);
    }
    if (isNaN(finalAmount) || finalAmount < 0) {
      throw new Error(`Invalid final_amount: ${finalAmount}. Must be >= 0 and a valid number.`);
    }
    
    // Build payload with required fields from schema
    const payload: Record<string, any> = {
      supplier_id: data.supplier_id,
      branch_id: data.branch_id,
      total_amount: Math.round(totalAmount * 100) / 100,
      final_amount: Math.round(finalAmount * 100) / 100,
      items: data.items.map(item => {
        const itemPayload: Record<string, any> = {
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: Math.round(item.unit_cost * 100) / 100,
          subtotal: Math.round(item.quantity * item.unit_cost * 100) / 100
        };
        // Only add optional fields if they have values
        if (item.manufacturing_date) itemPayload.batch_number = item.manufacturing_date;
        if (item.expiry_date) itemPayload.expiry_date = item.expiry_date;
        return itemPayload;
      })
    };
    
    // Add optional amount fields if non-zero
    if (taxAmount > 0) {
      payload.tax_amount = Math.round(taxAmount * 100) / 100;
    }
    if (discountAmount > 0) {
      payload.discount_amount = Math.round(discountAmount * 100) / 100;
    }
    
    // Add note if provided
    const noteValue = data.note || data.notes;
    if (noteValue && typeof noteValue === 'string' && noteValue.trim()) {
      payload.note = noteValue.trim();
    }
    
    console.log('✅ Supplier order payload ready to send:', JSON.stringify(payload, null, 2));
    
    // Final validation
    if (!payload.supplier_id || !payload.branch_id) {
      throw new Error('Missing required fields: supplier_id or branch_id');
    }
    
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error('Items array is required and must not be empty');
    }
    
    if (!payload.total_amount || !payload.final_amount) {
      throw new Error('total_amount and final_amount are required and must be valid numbers');
    }
    
    return api.post('/supplier-orders', payload);
  },

  async updateOrderStatus(id: number, status: string, receivedItems?: any[]) {
    return api.patch(`/supplier-orders/${id}/status`, { status, receivedItems });
  },

  async receiveOrder(id: number, data: { 
    items: Array<{
      product_id: number;
      received_quantity: number;
      manufacturing_date?: string;
      expiry_date?: string;
    }>
  }) {
    return api.post(`/supplier-orders/${id}/receive`, { receivedItems: data.items });
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
