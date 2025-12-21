import { api } from './api';

export interface Shipment {
  id: number;
  order_id: number;
  branch_id: number;
  shipping_address_id: number;
  tracking_number: string;
  carrier: string;
  shipped_date: string | null;
  estimated_delivery: string | null;
  delivered_date: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';
  shipping_fee: number;
  note: string | null;
  created_at: string;
  updated_at: string;
  orders?: {
    id: number;
    customer_id: number;
    total_amount: number;
    status: string;
    customers?: {
      full_name: string;
      phone: string;
      email: string;
    };
  };
  branches?: {
    id: number;
    name: string;
    address: string;
    phone: string;
  };
  shippingaddresses?: {
    id: number;
    recipient_name: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    city: string;
  };
}

export interface ShipmentFilters {
  page?: number;
  limit?: number;
  status?: string;
  branchId?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ShipmentResponse {
  success: boolean;
  data: {
    shipments: Shipment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ShipmentDetailResponse {
  success: boolean;
  data: Shipment;
}

export interface ShipmentStatistics {
  success: boolean;
  data: {
    totalShipments: number;
    shipmentsByStatus: {
      pending: number;
      processing: number;
      shipped: number;
      in_transit: number;
      delivered: number;
      cancelled: number;
    };
    averageDeliveryTime: number;
    onTimeDeliveryRate: string;
  };
}

export const getAllShipments = async (filters: ShipmentFilters = {}): Promise<ShipmentResponse> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.branchId) params.append('branchId', filters.branchId.toString());
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const queryString = params.toString();
  return api.get(`/shipments${queryString ? `?${queryString}` : ''}`);
};

export const getShipmentById = async (id: number): Promise<ShipmentDetailResponse> => {
  return api.get(`/shipments/${id}`);
};

export const getOrderShipments = async (orderId: number): Promise<ShipmentResponse> => {
  return api.get(`/orders/${orderId}/shipments`);
};

export const trackShipment = async (trackingNumber: string): Promise<ShipmentDetailResponse> => {
  return api.get(`/shipments/track/${trackingNumber}`);
};

export const getShipmentStatistics = async (filters: ShipmentFilters = {}): Promise<ShipmentStatistics> => {
  const params = new URLSearchParams();
  if (filters.branchId) params.append('branchId', filters.branchId.toString());
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  const queryString = params.toString();
  return api.get(`/shipments/statistics${queryString ? `?${queryString}` : ''}`);
};

export const createShipment = async (data: {
  order_id: number;
  branch_id: number;
  shipping_address_id: number;
  carrier: string;
  shipping_fee: number;
  estimated_delivery?: string;
  note?: string;
}): Promise<ShipmentDetailResponse> => {
  return api.post('/shipments', data);
};

export const updateShipmentStatus = async (
  id: number,
  data: {
    status: string;
    note?: string;
    delivered_date?: string;
  }
): Promise<ShipmentDetailResponse> => {
  return api.put(`/shipments/${id}/status`, data);
};
