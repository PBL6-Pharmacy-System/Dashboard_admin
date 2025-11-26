import { api } from './api';

export interface Staff {
  id: number;
  user_id: number;
  position: string;
  department: string;
  hire_date: string;
  salary: number | null;
  branch_id: number | null;
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
    role_id: number;
    roles: {
      id: number;
      role_name: string;
    };
  };
  branches: {
    id: number;
    name: string;
    address: string;
  } | null;
}

export interface StaffResponse {
  success: boolean;
  data: Staff[];
  error?: string;
}

export interface StaffDetailResponse {
  success: boolean;
  data: Staff;
  error?: string;
}

export interface UpdateStaffRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  branch_id?: number;
  is_active?: boolean;
  role_id?: number;
}

export const staffService = {
  async getAllStaff(): Promise<StaffResponse> {
    try {
      const response = await api.get('/staff');
      console.log('Raw staff API response:', response);
      console.log('Response type:', typeof response);
      console.log('Is array?', Array.isArray(response));
      console.log('Has data property?', response && 'data' in response);
      console.log('response.data type:', typeof response?.data);
      console.log('response.data is array?', response?.data && Array.isArray(response.data));
      
      // Log the actual data structure
      if (response?.data) {
        console.log('response.data keys:', Object.keys(response.data));
        console.log('response.data content:', response.data);
      }
      
      // Backend returns staff array directly or { data: staff[] }
      if (Array.isArray(response)) {
        console.log('✅ Response is array, returning as-is');
        return {
          success: true,
          data: response
        };
      }
      
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Response.data is array, returning response.data');
        return {
          success: true,
          data: response.data
        };
      }
      
      // Check if response.data.staff exists (nested staff array)
      if (response.data && response.data.staff && Array.isArray(response.data.staff)) {
        console.log('✅ Response.data.staff is array, returning response.data.staff');
        return {
          success: true,
          data: response.data.staff
        };
      }
      
      console.log('⚠️ Response format unknown, returning as StaffResponse');
      return response as StaffResponse;
    } catch (error) {
      console.error('Get all staff error:', error);
      throw error;
    }
  },

  async getStaffById(staffId: number): Promise<StaffDetailResponse> {
    try {
      const response = await api.get(`/staff/${staffId}`);
      console.log('Raw staff detail response:', response);
      
      // Backend returns staff object directly
      if (response && !response.success && response.users) {
        return {
          success: true,
          data: response as Staff
        };
      }
      
      return response as StaffDetailResponse;
    } catch (error) {
      console.error('Get staff by ID error:', error);
      throw error;
    }
  },

  async updateStaff(staffId: number, data: UpdateStaffRequest): Promise<StaffDetailResponse> {
    try {
      const response = await api.put(`/staff/${staffId}`, data);
      console.log('Raw update staff response:', response);
      
      // Backend may return { success: true, data: staff } or staff directly
      if (response && !response.success && response.users) {
        return {
          success: true,
          data: response as Staff
        };
      }
      
      return response as StaffDetailResponse;
    } catch (error) {
      console.error('Update staff error:', error);
      throw error;
    }
  },

  async deleteStaff(staffId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/staff/${staffId}`);
      console.log('Raw delete staff response:', response);
      
      return {
        success: true,
        message: 'Xóa nhân viên thành công'
      };
    } catch (error) {
      console.error('Delete staff error:', error);
      throw error;
    }
  }
};
