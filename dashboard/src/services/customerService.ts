import { api } from './api';

export interface Customer {
  id: number;
  user_id: number;
  dob: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  city_id: number | null;
  created_at: string;
  updated_at: string;
  users: {
    id: number;
    username: string;
    email: string;
    phone: string | null;
    full_name: string | null;
    avatar_url: string | null;
    is_active: boolean;
    is_verified: boolean;
    last_login: string | null;
  };
  cities: unknown | null;
  orders: unknown[];
  reviews: unknown[];
}

export interface CustomersResponse {
  success: boolean;
  data: {
    customers: Customer[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface CustomerResponse {
  success: boolean;
  data: Customer;
  error?: string;
}

export interface UpdateCustomerRequest {
  full_name?: string;
  phone?: string;
  email?: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  is_active?: boolean;
}

export const customerService = {
  async getAllCustomers(page: number = 1, limit: number = 10): Promise<CustomersResponse> {
    try {
      const response = await api.get(`/customers?page=${page}&limit=${limit}`);
      console.log('Raw API response:', response);
      
      // Backend returns { data: customers[], pagination: {...} }
      // Transform to match our interface
      if (response.data) {
        return {
          success: true,
          data: {
            customers: response.data,
            pagination: response.pagination
          }
        };
      }
      
      return response as CustomersResponse;
    } catch (error) {
      console.error('Get all customers error:', error);
      throw error;
    }
  },

  async getCustomerById(customerId: number): Promise<CustomerResponse> {
    try {
      const response = await api.get(`/customers/${customerId}`);
      console.log('Raw customer detail response:', response);
      
      // Backend returns customer object directly
      // Transform to match our interface
      if (response && !response.success) {
        return {
          success: true,
          data: response as Customer
        };
      }
      
      return response as CustomerResponse;
    } catch (error) {
      console.error('Get customer by ID error:', error);
      throw error;
    }
  },

  async updateCustomer(customerId: number, data: UpdateCustomerRequest): Promise<CustomerResponse> {
    try {
      const response = await api.put(`/customers/${customerId}`, data);
      console.log('Raw update response:', response);
      
      // Backend may return { success: true, data: customer } or customer directly
      if (response && !response.success) {
        return {
          success: true,
          data: response as Customer
        };
      }
      
      return response as CustomerResponse;
    } catch (error) {
      console.error('Update customer error:', error);
      throw error;
    }
  }
};
