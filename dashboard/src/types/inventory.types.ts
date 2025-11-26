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
}

// Sản phẩm kèm thông tin Lô (Dùng cho logic phân bổ)
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

// Phiếu yêu cầu
export interface TransferRequest {
  id: string;
  code: string;
  sourceBranch: string; // Kho yêu cầu (A)
  targetBranch: string; // Kho xuất (B)
  status: 'Pending' | 'Approved' | 'Splitted' | 'Cancelled';
  items: TransferProduct[];
  createdDate: string;
  createdBy: string;
}