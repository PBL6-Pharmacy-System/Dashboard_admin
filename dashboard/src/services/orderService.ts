import { api } from './api';

export interface Order {
  id: number;
  customer_id: number;
  voucher_id: number | null;
  shipping_address_id: number;
  total_amount: string | number;
  discount_amount: string | number;
  final_amount: string | number;
  status: string;
  order_date: string;
  updated_at: string;
  payments?: Payment[];
  shipments?: unknown[];
  customers?: {
    id: number;
    user_id: number;
    dob: string | null;
    gender: string | null;
    address: string | null;
    created_at: string;
    updated_at: string;
    city: string | null;
    city_id: number | null;
    users: {
      full_name: string | null;
      email: string;
      phone: string | null;
    };
  };
  orderitems?: OrderItem[];
  vouchers?: unknown;
  shippingaddresses?: {
    id: number;
    customer_id: number;
    address_line: string;
    city: string;
    state: string | null;
    postal_code: string | null;
    country: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
    city_id: number | null;
  };
  // Legacy fields for backward compatibility
  payment_method?: string;
  shipping_address?: string;
  shipping_fee?: number;
  note?: string | null;
  created_at?: string;
  order_items?: OrderItem[];
}

export interface Payment {
  id: number;
  payment_method: string;
  amount: string | number;
  status: string; // pending, paid, failed, cancelled
  transaction_id: string;
  payment_date: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  unit_id: number;
  quantity: number;
  price: string | number;
  subtotal: string | number;
  created_at: string;
  updated_at: string;
  products?: {
    id: number;
    name: string;
    image_url: string | null;
  };
  productunits?: {
    id: number;
    unit_name: string;
  };
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
  error?: string;
}

export interface OrderDetailResponse {
  success: boolean;
  data: Order;
  error?: string;
}

export interface OrderStatistics {
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
}

export interface UpdateOrderRequest {
  status?: string;
  payment_status?: string;
  note?: string;
}

export const orderService = {
  // 1. Get all orders with pagination
  async getAllOrders(page: number = 1, limit: number = 10): Promise<OrdersResponse> {
    try {
      const response = await api.get(`/orders?page=${page}&limit=${limit}`);
      console.log('Raw orders API response:', response);
      console.log('Response type:', typeof response);
      console.log('Is array?', Array.isArray(response));
      console.log('Has data property?', response && 'data' in response);
      
      if (response.data) {
        console.log('response.data type:', typeof response.data);
        console.log('response.data keys:', Object.keys(response.data));
        console.log('response.data content:', response.data);
        
        // Check for orders array
        if (response.data.orders && Array.isArray(response.data.orders)) {
          console.log('✅ Found orders array at response.data.orders');
          console.log('First order sample:', response.data.orders[0]);
          return {
            success: true,
            data: response.data
          };
        }
        
        // Check if data itself is an array
        if (Array.isArray(response.data)) {
          console.log('✅ response.data is array of orders');
          console.log('First order sample:', response.data[0]);
          return {
            success: true,
            data: {
              orders: response.data,
              pagination: {
                currentPage: page,
                totalPages: Math.ceil(response.data.length / limit),
                totalItems: response.data.length,
                itemsPerPage: limit
              }
            }
          };
        }
      }
      
      // Handle different response formats
      if (Array.isArray(response)) {
        console.log('✅ Response is array directly');
        return {
          success: true,
          data: {
            orders: response,
            pagination: {
              currentPage: page,
              totalPages: 1,
              totalItems: response.length,
              itemsPerPage: limit
            }
          }
        };
      }
      
      console.log('⚠️ Unknown response format, returning as-is');
      return response as OrdersResponse;
    } catch (error) {
      console.error('Get all orders error:', error);
      throw error;
    }
  },

  // 2. Get order by ID
  async getOrderById(orderId: number): Promise<OrderDetailResponse> {
    try {
      const response = await api.get(`/orders/${orderId}`);
      console.log('Raw order detail response:', response);
      
      if (response && !response.success && response.id) {
        return {
          success: true,
          data: response as Order
        };
      }
      
      return response as OrderDetailResponse;
    } catch (error) {
      console.error('Get order by ID error:', error);
      throw error;
    }
  },

  // 3. Get orders by customer ID
  async getOrdersByCustomerId(customerId: number): Promise<OrdersResponse> {
    try {
      const response = await api.get(`/customers/${customerId}/orders`);
      console.log('Raw customer orders response:', response);
      
      if (Array.isArray(response)) {
        return {
          success: true,
          data: {
            orders: response,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: response.length,
              itemsPerPage: response.length
            }
          }
        };
      }
      
      if (response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: {
            orders: response.data,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: response.data.length,
              itemsPerPage: response.data.length
            }
          }
        };
      }
      
      return response as OrdersResponse;
    } catch (error) {
      console.error('Get orders by customer ID error:', error);
      throw error;
    }
  },

  // 4. Update order
  async updateOrder(orderId: number, data: UpdateOrderRequest): Promise<OrderDetailResponse> {
    try {
      // Backend only accepts status update via /orders/:id/status
      const response = await api.put(`/orders/${orderId}/status`, { status: data.status });
      console.log('Raw update order response:', response);
      
      if (response && !response.success && response.id) {
        return {
          success: true,
          data: response as Order
        };
      }
      
      return response as OrderDetailResponse;
    } catch (error) {
      console.error('Update order error:', error);
      throw error;
    }
  },

  // 5. Cancel order
  async cancelOrder(orderId: number): Promise<{ success: boolean; message: string }> {
    try {
      // Backend uses POST to cancel, not DELETE
      const response = await api.post(`/orders/${orderId}/cancel`, {});
      console.log('Raw cancel order response:', response);
      
      return {
        success: true,
        message: 'Hủy đơn hàng thành công'
      };
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  },

  // 6. Get order statistics
  async getOrderStatistics(): Promise<{ success: boolean; data: OrderStatistics }> {
    try {
      const response = await api.get('/orders/statistics');
      console.log('Raw order statistics response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null');
      console.log('Response content:', response);
      
      if (response && response.data) {
        console.log('✅ Found statistics at response.data');
        console.log('Statistics content:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      if (response && response.total_orders !== undefined) {
        console.log('✅ Statistics in response directly');
        return {
          success: true,
          data: response as OrderStatistics
        };
      }
      
      console.log('⚠️ No statistics found, returning defaults');
      return {
        success: true,
        data: {
          total_orders: 0,
          pending_orders: 0,
          processing_orders: 0,
          shipped_orders: 0,
          delivered_orders: 0,
          cancelled_orders: 0,
          total_revenue: 0,
          average_order_value: 0
        }
      };
    } catch (error) {
      console.error('Get order statistics error:', error);
      throw error;
    }
  }
};
