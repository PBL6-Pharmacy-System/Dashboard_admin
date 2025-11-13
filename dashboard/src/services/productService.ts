import { api } from './api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  category_id: number | null;
  supplier_id: number | null;
  image_url: string | null;
  prescription_required: boolean;
  created_at: string;
  updated_at: string;
  tax_fee: string;
  base_unit_id: number;
  images: string[];
  manufacturer: string | null;
  usage: string | null;
  dosage: string | null;
  specification: string | null;
  adverseEffect: string | null;
  registNum: string | null;
  brand: string | null;
  producer: string | null;
  manufactor: string | null;
  legalDeclaration: string | null;
  faq: Array<{
    question: string;
    answer: string;
  }> | null;
  categories: {
    id: number;
    name: string;
    description: string | null;
    parent_id: number | null;
    created_at: string;
    updated_at: string;
  } | null;
  suppliers: {
    id: number;
    name: string;
    contact_info: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  unittype: {
    id: number;
    name: string;
  };
}

export interface ProductsResponse {
  products: Product[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: string;
  tax_fee?: string;
  manufacturer?: string;
  usage?: string;
  dosage?: string;
  specification?: string;
  adverseEffect?: string;
  registNum?: string;
  brand?: string;
  producer?: string;
  manufactor?: string;
  legalDeclaration?: string | null;
  category_id?: number | null;
  supplier_id?: number | null;
  base_unit_id?: number | null;
  images?: string[];
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  productUnits?: Array<{
    base_qty_per_unit: number;
    sale_price: number;
    is_default: boolean;
    sku: string;
    barcode: string;
    unit_id: number;
  }>;
}

export interface CreateProductResponse {
  success: boolean;
  message: string;
  data?: Product;
  error?: string;
}

export const productService = {
  async getAllProducts(page: number = 1, limit: number = 1000): Promise<ProductsResponse> {
    return api.get(`/products?page=${page}&limit=${limit}`);
  },

  async getProductById(id: number): Promise<Product> {
    return api.get(`/products/${id}`);
  },

  async createProduct(product: CreateProductRequest): Promise<CreateProductResponse> {
    console.log('🚀 Creating product with data:', product);
    const response = await api.post('/products', product);
    console.log('✅ Product created response:', response);
    return response as CreateProductResponse;
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    return api.put(`/products/${id}`, product);
  },

  async deleteProduct(id: number): Promise<void> {
    return api.delete(`/products/${id}`);
  },
};
