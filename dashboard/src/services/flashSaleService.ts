import type {
  FlashSale,
  FlashSaleFormData,
  FlashSaleFilter
} from '../types/flashsale.types';
import { api } from './api';


const FLASHSALE_ENDPOINTS = {
  LIST: '/flashsales',
  CREATE: '/flashsales',
  UPDATE: (id: number) => `/flashsales/${id}`,
  DELETE: (id: number) => `/flashsales/${id}`,
  DETAIL: (id: number) => `/flashsales/${id}`
};

/**
 * Get all flash sales with optional filters
 */
export const getAllFlashSales = async (filters?: FlashSaleFilter): Promise<FlashSale[]> => {
  try {
    // Admin: dùng /flashsales (full access)
    // Customer/Staff: dùng /flashsales/active (chỉ xem active)
    
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    const queryString = params.toString();
    
    const baseEndpoint = FLASHSALE_ENDPOINTS.LIST;
    const endpoint = queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint;
    const response = await api.get(endpoint);

    type RawProduct = {
      id: number;
      product_id?: number;
      flash_sale_id?: number;
      flash_price: number | string;
      stock_limit: number;
      sold_count?: number;
      purchase_limit?: number;
      created_at?: string;
      updated_at?: string;
      product?: RawProductInfo;
      products?: RawProductInfo;
    };
    type RawProductInfo = {
      id: number;
      name: string;
      price: number | string;
      stock?: number;
      in_stock?: number;
      image?: string;
      image_url?: string;
      images?: string[];
    };
    type RawFlashSale = {
      id: number;
      name: string;
      description?: string;
      start_time: string;
      end_time: string;
      is_active?: boolean;
      status?: string;
      created_at?: string;
      updated_at?: string;
      products?: RawProduct[];
      flashsale_products?: RawProduct[];
    };

    let rawList: RawFlashSale[] = [];
    if (Array.isArray(response.data)) {
      rawList = response.data;
    } else if (response.data?.data) {
      rawList = Array.isArray(response.data.data) ? response.data.data : [];
    } else if (response.data?.flashsales) {
      rawList = Array.isArray(response.data.flashsales) ? response.data.flashsales : [];
    }

    const normalized = rawList.map((raw): FlashSale => {
      const productsRaw = raw.products || raw.flashsale_products || [];
      const products = Array.isArray(productsRaw) ? productsRaw.map((p: RawProduct) => {
        let productInfo: RawProductInfo | undefined = undefined;
        if (p.product && typeof p.product === 'object') {
          productInfo = p.product;
        } else if (p.products && typeof p.products === 'object' && !Array.isArray(p.products)) {
          productInfo = p.products;
        }
        // Ensure product_id is always a number
        const product_id = p.product_id !== undefined ? p.product_id : (productInfo?.id !== undefined ? productInfo.id : 0);
        return {
          id: p.id,
          product_id,
          flash_sale_id: p.flash_sale_id || raw.id,
          flash_price: typeof p.flash_price === 'string' ? parseFloat(p.flash_price) : p.flash_price,
          stock_limit: p.stock_limit || 0,
          sold_count: p.sold_count || 0,
          purchase_limit: p.purchase_limit,
          created_at: p.created_at,
          updated_at: p.updated_at,
          product: productInfo ? {
            id: productInfo.id,
            name: productInfo.name,
            price: typeof productInfo.price === 'string' ? parseFloat(productInfo.price) : productInfo.price,
            image: productInfo.image || productInfo.image_url || (Array.isArray(productInfo.images) ? productInfo.images[0] : undefined)
          } : undefined
        };
      }) : [];
      return {
        id: raw.id,
        name: raw.name,
        description: raw.description,
        start_time: raw.start_time,
        end_time: raw.end_time,
        is_active: raw.is_active !== undefined ? raw.is_active : (raw.status === 'active'),
        created_at: raw.created_at,
        updated_at: raw.updated_at,
        products: Array.isArray(products) ? products : []
      };
    });

    // FE filter by status (running, upcoming, ended)
    if (filters?.status && filters.status !== 'all') {
      const now = new Date();
      return normalized.filter(flashSale => {
        const start = new Date(flashSale.start_time);
        const end = new Date(flashSale.end_time);
        if (filters.status === 'running') {
          return flashSale.is_active && now >= start && now <= end;
        }
        if (filters.status === 'upcoming') {
          return flashSale.is_active && now < start;
        }
        if (filters.status === 'ended') {
          return !flashSale.is_active || now > end;
        }
        return true;
      });
    }
    return normalized;
  } catch (error) {
    console.error('Error fetching flash sales:', error);
    throw error;
  }
};

/**
 * Get flash sale by ID
 */
export const getFlashSaleById = async (id: number): Promise<FlashSale> => {
  try {
    const response = await api.get(FLASHSALE_ENDPOINTS.DETAIL(id));

    type RawProduct = {
      id: number;
      product_id?: number;
      flash_sale_id?: number;
      flash_price: number | string;
      stock_limit: number;
      sold_count?: number;
      purchase_limit?: number;
      created_at?: string;
      updated_at?: string;
      product?: RawProductInfo;
      products?: RawProductInfo;
    };
    type RawProductInfo = {
      id: number;
      name: string;
      price: number | string;
      stock?: number;
      in_stock?: number;
      image?: string;
      image_url?: string;
      images?: string[];
    };
    type RawFlashSale = {
      id: number;
      name: string;
      description?: string;
      start_time: string;
      end_time: string;
      is_active?: boolean;
      status?: string;
      created_at?: string;
      updated_at?: string;
      products?: RawProduct[];
      flashsale_products?: RawProduct[];
    };

    let raw: RawFlashSale;
    if (response.data?.data) {
      raw = response.data.data;
    } else if (response.data?.flashsale) {
      raw = response.data.flashsale;
    } else if (response.data && !response.data.data && !response.data.flashsale) {
      raw = response.data;
    } else {
      throw new Error('Invalid response structure');
    }

    const productsRaw = raw.products || raw.flashsale_products || [];
    const products = Array.isArray(productsRaw) ? productsRaw.map((p: RawProduct) => {
      let productInfo: RawProductInfo | undefined = undefined;
      if (p.product && typeof p.product === 'object') {
        productInfo = p.product;
      } else if (p.products && typeof p.products === 'object' && !Array.isArray(p.products)) {
        productInfo = p.products;
      }
      // Ensure product_id is always a number
      const product_id = p.product_id !== undefined ? p.product_id : (productInfo?.id !== undefined ? productInfo.id : 0);
      return {
        id: p.id,
        product_id,
        flash_sale_id: p.flash_sale_id || raw.id,
        flash_price: typeof p.flash_price === 'string' ? parseFloat(p.flash_price) : p.flash_price,
        stock_limit: p.stock_limit || 0,
        sold_count: p.sold_count || 0,
        purchase_limit: p.purchase_limit,
        created_at: p.created_at,
        updated_at: p.updated_at,
        product: productInfo ? {
          id: productInfo.id,
          name: productInfo.name,
          price: typeof productInfo.price === 'string' ? parseFloat(productInfo.price) : productInfo.price,
          image: productInfo.image || productInfo.image_url || (Array.isArray(productInfo.images) ? productInfo.images[0] : undefined)
        } : undefined
      };
    }) : [];

    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      start_time: raw.start_time,
      end_time: raw.end_time,
      is_active: raw.is_active !== undefined ? raw.is_active : (raw.status === 'active'),
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      products: Array.isArray(products) ? products : []
    };
  } catch (error) {
    console.error(`Error fetching flash sale ${id}:`, error);
    throw error;
  }
};

/**
 * Create new flash sale
 */
export const createFlashSale = async (data: FlashSaleFormData): Promise<FlashSale> => {
  try {
    const response = await api.post(
      FLASHSALE_ENDPOINTS.CREATE,
      data
    );
    
    // Handle different response structures
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data?.flashsale) {
      return response.data.flashsale;
    } else if (response.data && !response.data.data && !response.data.flashsale) {
      return response.data;
    }
    
    throw new Error('Invalid response structure');
  } catch (error) {
    console.error('Error creating flash sale:', error);
    throw error;
  }
};

/**
 * Update existing flash sale
 */
export const updateFlashSale = async (id: number, data: FlashSaleFormData): Promise<FlashSale> => {
  try {
    const response = await api.put(
      FLASHSALE_ENDPOINTS.UPDATE(id),
      data
    );
    
    // Handle different response structures
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data?.flashsale) {
      return response.data.flashsale;
    } else if (response.data && !response.data.data && !response.data.flashsale) {
      return response.data;
    }
    
    throw new Error('Invalid response structure');
  } catch (error) {
    console.error(`Error updating flash sale ${id}:`, error);
    throw error;
  }
};

/**
 * Delete flash sale
 */
export const deleteFlashSale = async (id: number): Promise<boolean> => {
  try {
    await api.delete(
      FLASHSALE_ENDPOINTS.DELETE(id)
    );
    return true;
  } catch (error) {
    console.error(`Error deleting flash sale ${id}:`, error);
    throw error;
  }
};

/**
 * Duplicate/Clone flash sale
 */
export const duplicateFlashSale = async (id: number): Promise<FlashSale> => {
  try {
    // First get the flash sale details
    const original = await getFlashSaleById(id);
    
    // Create a copy with modified name and future dates
    const now = new Date();
    const copyData: FlashSaleFormData = {
      name: `${original.name} (Copy)`,
      description: original.description,
      start_time: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      end_time: new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
      is_active: false, // Set to inactive by default
      products: original.products?.map(p => ({
        product_id: p.product_id,
        flash_price: p.flash_price,
        stock_limit: p.stock_limit,
        purchase_limit: p.purchase_limit
      })) || []
    };
    
    return await createFlashSale(copyData);
  } catch (error) {
    console.error(`Error duplicating flash sale ${id}:`, error);
    throw error;
  }
};

/**
 * Validate flash sale time slot (check for overlaps)
 */
export const validateTimeSlot = async (
  startTime: string,
  endTime: string,
  excludeId?: number
): Promise<{ isValid: boolean; message?: string }> => {
  try {
    const allFlashSales = await getAllFlashSales();
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Check if end time is after start time
    if (end <= start) {
      return {
        isValid: false,
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu'
      };
    }
    
    // Check for overlapping time slots with active flash sales
    const overlapping = allFlashSales.find(fs => {
      if (!fs.is_active || (excludeId && fs.id === excludeId)) {
        return false;
      }
      
      const fsStart = new Date(fs.start_time);
      const fsEnd = new Date(fs.end_time);
      
      // Check if time ranges overlap
      return (start < fsEnd && end > fsStart);
    });
    
    if (overlapping) {
      return {
        isValid: false,
        message: `Khung giờ bị trùng với Flash Sale "${overlapping.name}"`
      };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('Error validating time slot:', error);
    return { isValid: true }; // Don't block on validation errors
  }
};
