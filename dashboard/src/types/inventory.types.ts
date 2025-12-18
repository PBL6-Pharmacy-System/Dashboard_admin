// Định nghĩa sản phẩm trong kho (Master Data)
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  totalStock: number;
  minStock: number;
  maxStock: number;
}

// Định nghĩa 1 dòng trong phiếu
export interface SlipItem {
  productId: string;
  productName: string;
  unitPrice: number;
  
  currentStock: number;   // Tồn kho tại thời điểm tạo phiếu
  requestQuantity: number; // SL Dự kiến / Đặt hàng
  actualQuantity: number;  // SL Thực nhận / Thực xuất
}

// Định nghĩa Phiếu
export interface StockSlip {
  id: string;
  code: string;
  type: 'IMPORT' | 'EXPORT';
  reason: string;
  date: string;
  creator: string;
  branchId?: number;
  branchName?: string;
  totalAmount: number; // Tính theo Actual Quantity khi hoàn tất
  status: 'Pending' | 'Completed' | 'Cancelled';
  items: SlipItem[];
}

// Lô hàng trong kho
export interface ProductBatch {
  id: string;
  batchCode: string; // Mã lô
  expiryDate: string;
  location: string;  // Vị trí trong kho (Kệ A, B...)
  quantity: number;  // Tồn thực tế của lô này
  transferable?: number; // SL có thể chuyển (sau khi trừ min stock)
}

// Transfer Item - Sản phẩm trong phiếu chuyển kho
export interface TransferItem {
  id: string;
  name: string;
  category: string;
  price: number;
  totalStock: number;
  minStock: number;
  maxStock: number;
  requestedQty: number;    // SL yêu cầu
  allocatedQty: number;    // SL đáp ứng được
  missingQty: number;      // SL Còn thiếu
  batches: (ProductBatch & { transferable?: number })[];
  allocationDetails: {     // Chi tiết lấy từ lô nào
    batchId: string;
    takeQty: number;
  }[];
}

// Sản phẩm kèm thông tin Lô (Dùng cho logic phân bổ) - Deprecated, use TransferItem
export interface TransferProduct extends Product {
  batches: ProductBatch[]; 
  requestedQty: number;    // SL Kho A yêu cầu
  allocatedQty: number;    // SL Kho B đáp ứng được
  missingQty: number;      // SL Còn thiếu
  allocationDetails: {     // Chi tiết lấy từ lô nào
    batchId: string;
    takeQty: number;
  }[];
}

// Phiếu yêu cầu chuyển kho
export interface TransferRequest {
  id: string;
  code: string;
  sourceBranch: string;   // Tên chi nhánh nguồn
  targetBranch: string;   // Tên chi nhánh đích
  fromBranchId?: number;  // ID chi nhánh nguồn
  toBranchId?: number;    // ID chi nhánh đích
  status: 'Pending' | 'Approved' | 'Shipped' | 'Completed' | 'Splitted' | 'Cancelled';
  items: TransferItem[];
  createdDate: string;
  createdBy: string;
  notes?: string;
}