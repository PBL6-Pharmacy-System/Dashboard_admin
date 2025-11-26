import { showGlobalToast } from '../hooks/useToast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const handleUnauthorized = () => {
  // Clear auth data
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  
  // Show toast notification
  showGlobalToast('error', 'Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại để tiếp tục');
  
  // Redirect to login if not already there
  if (window.location.pathname !== '/login') {
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500); // Delay to show toast
  }
};

const handleResponse = async (response: Response, endpoint: string) => {
  // Handle 401 Unauthorized or 403 Forbidden
  // BUT skip for login/register endpoints (they return 401 for wrong credentials)
  if ((response.status === 401 || response.status === 403) && 
      !endpoint.includes('/auth/login') && 
      !endpoint.includes('/auth/register')) {
    console.warn('Authentication failed, redirecting to login...');
    handleUnauthorized();
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    return handleResponse(response, endpoint);
  },

  async post(endpoint: string, data: unknown) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response, endpoint);
  },

  async put(endpoint: string, data: unknown) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response, endpoint);
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response, endpoint);
  },
};
