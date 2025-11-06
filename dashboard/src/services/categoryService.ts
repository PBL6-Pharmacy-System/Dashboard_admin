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

  async getProductsByCategory(categoryName: string) {
    return api.get(`/products/category/${encodeURIComponent(categoryName)}`);
  },
};
