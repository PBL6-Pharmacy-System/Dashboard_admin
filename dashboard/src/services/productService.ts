import { api } from './api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  category_id: number;
  supplier_id: number;
  image_url: string | null;
  prescription_required: boolean;
  created_at: string;
  updated_at: string;
  tax_fee: string;
  base_unit_id: number;
  images: string[];
  manufacturer: string;
  usage: string;
  dosage: string;
  specification: string;
  adverseEffect: string;
  registNum: string;
  brand: string;
  producer: string;
  manufactor: string;
  legalDeclaration: string | null;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  categories: {
    id: number;
    name: string;
    description: string | null;
    parent_id: number | null;
    created_at: string;
    updated_at: string;
  };
  suppliers: {
    id: number;
    name: string;
    contact_info: string | null;
    created_at: string;
    updated_at: string;
  };
  unittype: {
    id: number;
    name: string;
  };
}

export interface ProductsResponse {
  products: Product[];
}

export const productService = {
  async getAllProducts(): Promise<ProductsResponse> {
    return api.get('/products');
  },

  async getProductById(id: number): Promise<Product> {
    return api.get(`/products/${id}`);
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    return api.post('/products', product);
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    return api.put(`/products/${id}`, product);
  },

  async deleteProduct(id: number): Promise<void> {
    return api.delete(`/products/${id}`);
  },
};
