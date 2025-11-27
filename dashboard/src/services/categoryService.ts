import { api } from './api';

export interface Category {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export const categoryService = {
  async getAllCategories(): Promise<CategoriesResponse> {
    return api.get('/categories');
  },

  async getCategoryById(id: number): Promise<Category> {
    return api.get(`/categories/${id}`);
  },

  // DEPRECATED: This endpoint does not exist in backend
  async getProductsByCategory(categoryName: string) {
    console.warn('[categoryService] getProductsByCategory is deprecated - use getProductsByCategoryId instead');
    return { products: [] };
  },

  // Use categoryId to fetch products - this is the correct endpoint
  async getProductsByCategoryId(categoryId: number, page: number = 1, limit: number = 20) {
    const response = await api.get(`/products?categoryId=${categoryId}&page=${page}&limit=${limit}`);
    return {
      products: response?.data?.products || response?.products || [],
      pagination: response?.data?.pagination || response?.pagination || { total: 0, totalPages: 1 }
    };
  },
};
