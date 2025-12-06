import { api } from './api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock?: number;
  in_stock?: number;
  category_id: number | null;
  supplier_id: number | null;
  image_url: string | null;
  prescription_required: boolean;
  created_at: string;
  updated_at: string;
  tax_fee: string;
  base_unit_id: number | null;
  images: string[] | null;
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
  } | null;
  sold_count?: number;
  productunits?: Array<any>;
}

export interface ProductsResponse {
  products: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
  async getAllProducts(page: number = 1, limit: number = 10): Promise<ProductsResponse> {
    const response = await api.get(`/products?page=${page}&limit=${limit}`);
    console.log('Raw products API response:', response);
    
    // Handle different response structures
    if (response?.data?.products) {
      // If response is { success: true, data: { products: [...], pagination: {...} } }
      return { 
        products: response.data.products,
        pagination: response.data.pagination 
      };
    } else if (response?.products) {
      // If response is { products: [...] }
      return { products: response.products };
    } else if (Array.isArray(response?.data)) {
      // If response is { data: [...] }
      return { products: response.data };
    } else if (Array.isArray(response)) {
      // If response is directly an array
      return { products: response };
    }
    
    // Fallback to empty array
    console.warn('Unexpected products API response structure:', response);
    return { products: [] };
  },

  async getProductById(id: number): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    console.log('Raw product detail response:', response);
    
    // Handle { success: true, data: {...} } structure
    if (response?.data) {
      return response.data;
    }
    
    // If response is directly the product object
    return response;
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
