import { useState, useEffect, useMemo, useCallback } from 'react';
import { staffService, type Staff } from '../services/staffService';
import { useToast } from './useToast';

export const useStaffManagement = () => {
  const { showToast } = useToast();
  
  // --- STATE DATA ---
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // --- STATE FILTER ---
  const [filters, setFilters] = useState({
    search: '',
    role: 'All',
    status: 'All'
  });

  // --- STATE MODAL & FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    branch_id: undefined as number | undefined,
    is_active: true,
    role_id: 3
  });

  // Fetch staff data from API
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching staff list...');
      const response = await staffService.getAllStaff();
      console.log('Staff list response:', response);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        setStaffList(response.data);
      } else {
        console.warn('Invalid staff list response, setting empty array');
        setStaffList([]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      showToast('error', 'Không thể tải danh sách nhân viên');
      setStaffList([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Load data on mount
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);
  
  // --- ACTIONS (Hành động) ---
  
  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      branch_id: undefined,
      is_active: true,
      role_id: 3
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (staff: Staff) => {
    try {
      console.log('Opening edit modal for staff:', staff);
      
      // Set initial data immediately
      setEditingStaff(staff);
      setFormData({
        full_name: staff.users.full_name || '',
        email: staff.users.email || '',
        phone: staff.users.phone || '',
        position: staff.position || '',
        department: staff.department || '',
        branch_id: staff.branch_id || undefined,
        is_active: staff.users.is_active,
        role_id: staff.users.rolepermissions.id
      });
      setIsModalOpen(true);
      
      // Try to fetch fresh data
      try {
        console.log('Fetching fresh staff details for ID:', staff.id);
        const response = await staffService.getStaffById(staff.id);
        console.log('Staff detail response:', response);
        
        if (response.success && response.data) {
          const staffData = response.data;
          setEditingStaff(staffData);
          setFormData({
            full_name: staffData.users.full_name || '',
            email: staffData.users.email || '',
            phone: staffData.users.phone || '',
            position: staffData.position || '',
            department: staffData.department || '',
            branch_id: staffData.branch_id || undefined,
            is_active: staffData.users.is_active,
            role_id: staffData.users.rolepermissions.id
          });
        }
      } catch (fetchError) {
        console.log('Could not fetch fresh data, using existing data:', fetchError);
      }
    } catch (error) {
      console.error('Error opening edit modal:', error);
      showToast('error', 'Không thể mở form chỉnh sửa');
    }
  };

  const deleteStaff = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này không?')) {
      return;
    }
    
    setDeleting(true);
    try {
      console.log('Deleting staff:', id);
      await staffService.deleteStaff(id);
      showToast('success', 'Xóa nhân viên thành công');
      fetchStaff(); // Refresh list
    } catch (error) {
      console.error('Error deleting staff:', error);
      showToast('error', 'Không thể xóa nhân viên');
    } finally {
      setDeleting(false);
    }
  };

  const saveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setSaving(true);
    try {
      console.log('Updating staff:', editingStaff.id, formData);
      const response = await staffService.updateStaff(editingStaff.id, formData);
      console.log('Update response:', response);
      
      if (response.success) {
        showToast('success', 'Cập nhật nhân viên thành công');
        setIsModalOpen(false);
        fetchStaff(); // Refresh list
      } else {
        showToast('error', 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      showToast('error', 'Không thể cập nhật nhân viên');
    } finally {
      setSaving(false);
    }
  };

  // --- COMPUTED (Tính toán) ---
  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      const matchSearch = filters.search === '' ||
        (staff.users.full_name || '').toLowerCase().includes(filters.search.toLowerCase()) || 
        staff.users.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        (staff.users.phone || '').includes(filters.search);
      
      const matchRole = filters.role === 'All' || staff.users.rolepermissions.role_name === filters.role;
      const matchStatus = filters.status === 'All' || 
        (filters.status === 'Active' && staff.users.is_active) ||
        (filters.status === 'Inactive' && !staff.users.is_active);
      
      return matchSearch && matchRole && matchStatus;
    });
  }, [staffList, filters]);

  // Trả về tất cả những gì UI cần
  return {
    staffList,
    filteredStaff,
    loading,
    filters,
    setFilters,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    editingStaff,
    saving,
    deleting,
    actions: {
      openAddModal,
      openEditModal,
      deleteStaff,
      saveStaff,
      refreshStaff: fetchStaff
    }
  };
};
