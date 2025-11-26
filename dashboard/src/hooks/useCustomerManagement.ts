import { useState, useEffect, useMemo, useCallback } from 'react';
import { customerService, type Customer, type UpdateCustomerRequest } from '../services/customerService';
import { useToast } from './useToast';

export const useCustomerManagement = () => {
  const { showToast } = useToast();
  
  // --- STATE DATA ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const CUSTOMERS_PER_PAGE = 10;
  
  // --- STATE FILTER ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // --- STATE MODAL & FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<UpdateCustomerRequest>({
    full_name: '',
    phone: '',
    email: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  // --- FETCH CUSTOMERS ---
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching customers, page:', currentPage);
      const response = await customerService.getAllCustomers(currentPage, CUSTOMERS_PER_PAGE);
      console.log('Customer API response:', response);
      
      if (response.success && response.data) {
        setCustomers(response.data.customers || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotalCustomers(response.data.pagination.total);
        }
        console.log('Customers loaded:', response.data.customers?.length || 0);
      } else {
        console.warn('API returned success=false or no data');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      showToast('error', 'Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, [currentPage, showToast]);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage]);

  // --- ACTIONS ---
  const openEditModal = async (customer: Customer) => {
    try {
      console.log('Opening edit modal for customer:', customer);
      
      // Set initial data from the customer object immediately
      setEditingCustomer(customer);
      setFormData({
        full_name: customer.users.full_name || '',
        phone: customer.users.phone || '',
        email: customer.users.email || '',
        dob: customer.dob ? customer.dob.split('T')[0] : '', // Format date for input[type="date"]
        gender: customer.gender || '',
        address: customer.address || '',
        city: customer.city || '',
        is_active: customer.users.is_active
      });
      setIsModalOpen(true);
      
      // Try to fetch fresh data in background (optional)
      try {
        console.log('Fetching fresh customer details for ID:', customer.id);
        const response = await customerService.getCustomerById(customer.id);
        console.log('Customer detail response:', response);
        
        if (response.success && response.data) {
          const customerData = response.data;
          setEditingCustomer(customerData);
          setFormData({
            full_name: customerData.users.full_name || '',
            phone: customerData.users.phone || '',
            email: customerData.users.email || '',
            dob: customerData.dob ? customerData.dob.split('T')[0] : '',
            gender: customerData.gender || '',
            address: customerData.address || '',
            city: customerData.city || '',
            is_active: customerData.users.is_active
          });
        }
      } catch (fetchError) {
        // Silently fail - we already have data from the list
        console.log('Could not fetch fresh data, using existing data:', fetchError);
      }
    } catch (error) {
      console.error('Error opening edit modal:', error);
      showToast('error', 'Không thể mở form chỉnh sửa');
    }
  };

  const saveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setSaving(true);
    try {
      console.log('Updating customer:', editingCustomer.id, formData);
      const response = await customerService.updateCustomer(editingCustomer.id, formData);
      console.log('Update response:', response);
      
      if (response.success) {
        showToast('success', 'Cập nhật khách hàng thành công');
        setIsModalOpen(false);
        fetchCustomers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      showToast('error', 'Không thể cập nhật khách hàng');
    } finally {
      setSaving(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- COMPUTED (Client-side filtering) ---
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchSearch = searchQuery === '' || 
        customer.users.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.users.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.users.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.users.phone || '').includes(searchQuery);
      
      const matchStatus = statusFilter === 'All' || 
        (statusFilter === 'Active' && customer.users.is_active) ||
        (statusFilter === 'Inactive' && !customer.users.is_active);
      
      return matchSearch && matchStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  return {
    customers: filteredCustomers,
    loading,
    currentPage,
    totalPages,
    totalCustomers,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    editingCustomer,
    saving,
    actions: {
      openEditModal,
      saveCustomer,
      handlePageChange,
      refreshCustomers: fetchCustomers
    }
  };
};
