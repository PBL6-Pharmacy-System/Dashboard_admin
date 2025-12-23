import { api } from './api';

export type ProductBatch = {
  id: number;
  batch_number: string;
  product_id: number;
  branch_id: number;
  quantity: number;
  expiry_date: string;
  cost_price: number;
  status: 'available' | 'expired' | 'disposed';
  created_at: string;
  supplier_id?: number;
  product?: {
    id: number;
    name: string;
    price: number;
  };
  branch?: {
    id: number;
    branch_name: string;
  };
};

export type FEFOAllocation = {
  batch_number: string;
  allocated_quantity: number;
  remaining_in_batch: number;
};

export type BatchSummary = {
  total_quantity: number;
  total_batches: number;
  total_value: number;
  batches_detail: ProductBatch[];
};

class ProductBatchService {
  private basePath = '/product-batches';

  // Lấy tất cả lô hàng
  async getAllBatches(params?: { 
    branch_id?: number; 
    product_id?: number; 
    supplier_id?: number;
    status?: 'active' | 'expired' | 'disposed';
    expiring_soon?: boolean;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString() : '';
    
    return await api.get(`${this.basePath}${queryString}`);
  }

  // Lấy lô hàng sắp hết hạn
  async getExpiringSoon(days: number = 30) {
    return await api.get(`${this.basePath}/expiring-soon?days=${days}`);
  }

  // Lấy lô hàng theo FEFO (First Expired First Out)
  async getFEFOBatches(branchId: number, productId: number) {
    return await api.get(`${this.basePath}/fefo/${branchId}/${productId}`);
  }

  // Xem trước phân bổ FEFO
  async allocateFEFO(data: { branch_id: number; product_id: number; quantity: number }) {
    return await api.post(`${this.basePath}/fefo/allocate`, data);
  }

  // Xuất kho theo FEFO - chỉ xuất 1 sản phẩm mỗi lần
  async exportFEFO(data: { 
    branch_id: number; 
    product_id: number; 
    quantity: number;
    reference_type: 'manual_export' | 'order_fulfillment' | 'transfer' | 'damage' | 'sample' | 'return_to_supplier';
    reference_id?: number;
    note?: string;
  }) {
    return await api.post(`${this.basePath}/fefo/export`, data);
  }

  // Nhập hàng vào lô mới - tạo batch mới
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
    // Sử dụng POST /product-batches để tạo batch mới
    return await api.post(`${this.basePath}`, data);
  }

  // Nhập thêm vào lô hiện có
  async addStockToBatch(batchId: number, data: { quantity: number; note?: string }) {
    return await api.post(`${this.basePath}/${batchId}/add-stock`, data);
  }

  // Xem tổng quan lô hàng của sản phẩm
  async getBatchSummary(branchId: number, productId: number) {
    return await api.get(`${this.basePath}/summary/${branchId}/${productId}`);
  }

  // Lấy chi tiết 1 lô hàng
  async getBatchById(batchId: number) {
    return await api.get(`${this.basePath}/${batchId}`);
  }

  // Cập nhật thông tin lô hàng
  async updateBatch(batchId: number, data: { expiry_date?: string; cost_price?: number }) {
    return await api.put(`${this.basePath}/${batchId}`, data);
  }

  // Đánh dấu lô hết hạn - KHÔNG tự động trừ stock
  async expireBatch(batchId: number) {
    return await api.post(`${this.basePath}/${batchId}/expire`, {});
  }

  // Tiêu hủy lô hàng hết hạn - TỰ ĐỘNG TRỪ STOCK
  // ⚠️ Chỉ tiêu hủy được lô đã đánh dấu 'expired'
  async disposeBatch(batchId: number, data: { note?: string }) {
    return await api.post(`${this.basePath}/${batchId}/dispose`, data);
  }

  // Xóa lô hàng
  async deleteBatch(batchId: number) {
    return await api.delete(`${this.basePath}/${batchId}`);
  }

  // Tự động đánh dấu lô hết hạn
  async autoExpireBatches() {
    return await api.post(`${this.basePath}/auto-expire`, {});
  }
}

export const productBatchService = new ProductBatchService();
