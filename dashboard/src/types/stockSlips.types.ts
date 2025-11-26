// Định nghĩa cấu trúc dữ liệu riêng biệt để dễ quản lý
export interface StockSlipsDetail {
  id: string;
  stock_take_id: string;
  product_id: string;
  
  // Hiển thị
  product_name: string;
  product_image: string;
  unit_price: number; 

  // Dữ liệu kiểm kê
  branch_id: string;
  system_qty: number;     // Tồn máy
  actual_qty: number;     // Tồn thực
  variance: number;       // Lệch
  variance_value: number; // Giá trị lệch
  reason: string;
  note: string;
  
  created_at: string;
  updated_at: string;
}

export interface StockSlipsSession {
  id: string;
  code: string;
  branch_id: string;
  branch_name: string;
  status: 'Draft' | 'Completed' | 'Cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
  total_variance_value: number;
  details: StockSlipsDetail[];
}