import { showGlobalToast } from '../hooks/useToast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL;

// Global flag to prevent multiple simultaneous redirects
let isRedirecting = false;

const getHeaders = (baseUrl?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Only add ngrok header for ngrok URLs
  if (baseUrl && baseUrl.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  
  // Get token from localStorage (persistent across page reloads)
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const handleUnauthorized = () => {
  // Prevent multiple simultaneous redirects
  if (isRedirecting) {
    console.log('Redirect already in progress, skipping...');
    return;
  }
  
  isRedirecting = true;
  console.warn('🚨 Authentication failed - clearing session and redirecting');
  
  // Clear auth data from both localStorage and sessionStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.clear();
  
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
      !endpoint.includes('/auth/register') &&
      !endpoint.includes('/auth/logout')) {
    
    // Only trigger redirect once, even if multiple API calls fail
    if (!isRedirecting) {
      console.warn('⚠️ Authentication failed on endpoint:', endpoint);
      handleUnauthorized();
    }
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }
  
  // Handle 404 - Route not found
  if (response.status === 404) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Route ${endpoint} không tồn tại`);
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // If not JSON (e.g., HTML from ngrok), throw error
    const text = await response.text();
    console.error('Non-JSON response:', text.substring(0, 200));
    throw new Error('Server trả về dữ liệu không đúng định dạng. Vui lòng kiểm tra lại API URL.');
  }
  
  return response.json();
};

export const api = {
  async get(endpoint: string, baseUrl: string = API_BASE_URL) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: getHeaders(baseUrl),
    });
    return handleResponse(response, endpoint);
  },

  async post(endpoint: string, data: unknown, baseUrl: string = API_BASE_URL) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(baseUrl),
      body: JSON.stringify(data),
    });
    return handleResponse(response, endpoint);
  },

  async put(endpoint: string, data: unknown, baseUrl: string = API_BASE_URL) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(baseUrl),
      body: JSON.stringify(data),
    });
    return handleResponse(response, endpoint);
  },

  async delete(endpoint: string, baseUrl: string = API_BASE_URL) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(baseUrl),
    });
    return handleResponse(response, endpoint);
  },

  async patch(endpoint: string, data: unknown, baseUrl: string = API_BASE_URL) {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(baseUrl),
      body: JSON.stringify(data),
    });
    return handleResponse(response, endpoint);
  },
};

// Export AI Base URL for use in services
export const getAIBaseURL = () => AI_BASE_URL;
