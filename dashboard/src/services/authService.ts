import { api } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
  full_name?: string;
  role_id: number;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    refreshToken: string;
    user: {
      id: number;
      username: string;
      email: string;
      full_name: string | null;
      role_id: number;
      roles: {
        role_name: string;
      };
    };
  };
  error?: string;
  status?: number;
}

export interface RegisterResponse {
  success: boolean;
  data?: {
    user: {
      id: number;
      username: string;
      email: string;
      full_name: string | null;
      role_id: number;
    };
  };
  error?: string;
  status?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  role_id: number;
  role_name: string;
  avatar?: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      }) as LoginResponse;
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post('/auth/register', data) as RegisterResponse;
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      interface UserResponse {
        id: number;
        username: string;
        email: string;
        full_name: string | null;
        role_id: number;
        avatar?: string;
        rolepermissions?: {
          role_name: string;
        };
      }

      const response = await api.get('/auth/me') as { success: boolean; data: UserResponse };
      
      if (response.success && response.data) {
        const user = response.data;
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role_id: user.role_id,
          role_name: user.rolepermissions?.role_name || 'USER',
          avatar: user.avatar
        };
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await api.post('/auth/logout', {});
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      this.clearAuth();
    }
  },

  clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
};
