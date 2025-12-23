import { api } from './api';

interface ProductBatch {
  id: number;
  batch_number: string;
  product_id: number;
  branch_id: number;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  cost_price: number;
  manufacturing_date?: string;
  expiry_date: string;
  supplier_id?: number;
  status: 'available' | 'reserved' | 'expired' | 'disposed';
  created_at: string;
  updated_at: string;
  products?: {
    product_id: number;
    product_name: string;
    name: string;
    unit_of_measure: string;
  };
  branches?: {
    branch_id: number;
    branch_name: string;
    name: string;
  };
}

const batchService = {
  async getAllBatches(params?: {
    branchId?: number;
    productId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.branchId) query.append('branchId', String(params.branchId));
    if (params?.productId) query.append('productId', String(params.productId));
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    
    return api.get(`/product-batches${query.toString() ? '?' + query.toString() : ''}`);
  },

  async getBatchById(id: number) {
    return api.get(`/product-batches/${id}`);
  },

  async createBatch(data: Partial<ProductBatch>) {
    return api.post('/product-batches', data);
  },

  async updateBatch(id: number, data: Partial<ProductBatch>) {
    return api.put(`/product-batches/${id}`, data);
  },

  async deleteBatch(id: number) {
    return api.delete(`/product-batches/${id}`);
  },

  async getFEFOBatches(branchId: number, productId: number) {
    return api.get(`/product-batches/fefo/${branchId}/${productId}`);
  },

  async allocateFEFO(data: {
    branch_id: number;
    product_id: number;
    quantity: number;
  }) {
    return api.post('/product-batches/fefo/allocate', data);
  },

  // Xuất kho theo FEFO - xuất 1 sản phẩm mỗi lần
  async exportFEFO(data: {
    branch_id: number;
    product_id: number;
    quantity: number;
    reference_type: 'manual_export' | 'order_fulfillment' | 'transfer' | 'damage' | 'sample' | 'return_to_supplier';
    reference_id?: number;
    note?: string;
  }) {
    return api.post('/product-batches/fefo/export', data);
  },

  // Nhập kho - tạo lô hàng mới
  async importBatch(data: {
    product_id: number;
    branch_id: number;
    batch_number: string;
    quantity: number;
    manufacture_date: string;
    expiry_date: string;
    cost_price: number;
    selling_price?: number;
    supplier_id: number;
    note?: string;
  }) {
    return api.post('/product-batches', data);
  },

  // Nhập thêm vào lô hiện có
  async addStockToExistingBatch(data: {
    batch_id?: number;
    quantity: number;
    note?: string;
  }) {
    if (data.batch_id) {
      return api.post(`/product-batches/${data.batch_id}/add-stock`, {
        quantity: data.quantity,
        note: data.note
      });
    }
    return api.post('/product-batches/import', data);
  },

  async addStockToBatch(id: number, quantity: number) {
    return api.post(`/product-batches/${id}/add-stock`, { quantity });
  },

  async getBatchSummary(branchId: number, productId: number) {
    return api.get(`/product-batches/summary/${branchId}/${productId}`);
  },

  async getExpiringSoon(days = 30) {
    return api.get(`/product-batches/expiring-soon?days=${days}`);
  },

  async markExpired(id: number) {
    return api.post(`/product-batches/${id}/expire`, {});
  },

  async disposeBatch(id: number, reason?: string) {
    return api.post(`/product-batches/${id}/dispose`, { reason });
  },

  async autoExpire() {
    return api.post('/product-batches/auto-expire', {});
  },

  async generateBatchNumber(productId: number, branchId: number) {
    return api.get(`/product-batches/generate-number/${productId}/${branchId}`);
  }
};

export { batchService, type ProductBatch };
