import React, { useState, useEffect, useCallback } from 'react';
import type {
  FlashSale as FlashSaleType,
  FlashSaleFilter,
  FlashSaleFormData,
  FlashSaleProductInput
} from '../types/flashsale.types';
import {
  getAllFlashSales,
  getFlashSaleById,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
  validateTimeSlot
} from '../services/flashSaleService';
import type { Product } from '../services/productService';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import FlashSaleProductTable from '../components/flashsale/FlashSaleProductTable';
import ProductSelectionModal from '../components/flashsale/ProductSelectionModal';

type ViewMode = 'list' | 'create' | 'edit';

const FlashSale: React.FC = () => {
  const { showToast } = useToast();
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // List view states
  const [flashSales, setFlashSales] = useState<FlashSaleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<FlashSaleFilter>({
    search: '',
    status: 'all',
    start_date: '',
    end_date: ''
  });

  // Form states
  const [saving, setSaving] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [timeSlotError, setTimeSlotError] = useState<string>('');
  const [formData, setFormData] = useState<FlashSaleFormData>({
    name: '',
    description: '',
    start_time: '',
    end_time: '',
    is_active: true,
    products: []
  });

  const getFlashSaleStatus = (flashSale: FlashSaleType) => {
    const now = new Date();
    const startTime = new Date(flashSale.start_time);
    const endTime = new Date(flashSale.end_time);

    if (!flashSale.is_active || now > endTime) {
      return {
        status: 'ended' as const,
        label: 'Đã kết thúc',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    }

    if (now >= startTime && now <= endTime) {
      return {
        status: 'running' as const,
        label: 'Đang diễn ra',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    }

    return {
      status: 'upcoming' as const,
      label: 'Sắp diễn ra',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    };
  };

  const loadFlashSales = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllFlashSales(filters);
      console.log('📊 Flash Sales loaded:', data);
      setFlashSales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error loading flash sales:', error);
      showToast('error', 'Không thể tải danh sách Flash Sale');
      setFlashSales([]);
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    if (viewMode === 'list') {
      loadFlashSales();
    }
  }, [viewMode, loadFlashSales]);

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteFlashSale(deleteId);
      showToast('success', 'Xóa Flash Sale thành công');
      loadFlashSales();
    } catch {
      showToast('error', 'Không thể xóa Flash Sale');
    } finally {
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  // Form functions
  const resetForm = () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000);

    setFormData({
      name: '',
      description: '',
      start_time: tomorrow.toISOString().slice(0, 16),
      end_time: tomorrowEnd.toISOString().slice(0, 16),
      is_active: true,
      products: []
    });
    setTimeSlotError('');
    setEditingId(null);
  };

  const handleCreate = () => {
    resetForm();
    setViewMode('create');
  };

  const handleEdit = async (id: number) => {
    try {
      setLoadingForm(true);
      setViewMode('edit');
      setEditingId(id);
      
      const data = await getFlashSaleById(id);
      
      setFormData({
        name: data.name,
        description: data.description || '',
        start_time: new Date(data.start_time).toISOString().slice(0, 16),
        end_time: new Date(data.end_time).toISOString().slice(0, 16),
        is_active: data.is_active,
        products: Array.isArray(data.products) ? data.products.map(p => {
          // Parse price safely if it's a string
          const priceStr = typeof p.product?.price === 'string' ? p.product?.price : String(p.product?.price || 0);
          const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
          
          return {
            product_id: p.product_id,
            flash_price: p.flash_price,
            stock_limit: p.stock_limit,
            purchase_limit: p.purchase_limit,
            product_name: p.product?.name,
            product_price: price || 0,
            product_stock: p.product?.stock || 0,
            product_image: p.product?.image,
            product_sku: p.product?.sku
          };
        }) : []
      });
    } catch {
      showToast('error', 'Không thể tải thông tin Flash Sale');
      setViewMode('list');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    resetForm();
  };

  const handleInputChange = (field: keyof FlashSaleFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'start_time' || field === 'end_time') {
      setTimeSlotError('');
    }
  };

  const handleProductsChange = (products: FlashSaleProductInput[]) => {
    setFormData(prev => ({ ...prev, products }));
  };

  const handleAddProducts = (selectedProducts: Product[]) => {
    const newProducts: FlashSaleProductInput[] = selectedProducts.map(product => {
      // Parse price safely
      const priceStr = typeof product.price === 'string' ? product.price : String(product.price || 0);
      const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));

      // Get stock safely
      const stock = product.stock ?? product.in_stock ?? 0;

      // Ensure product_image is string or undefined
      let productImage: string | undefined = undefined;
      if (typeof product.image_url === 'string') {
        productImage = product.image_url;
      } else if (Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string') {
        productImage = product.images[0];
      }

      return {
        product_id: product.id,
        flash_price: Math.round(price * 0.8),
        stock_limit: Math.min(stock, 50),
        purchase_limit: 5,
        product_name: product.name,
        product_price: price,
        product_stock: stock,
        product_image: productImage
      };
    });

    const existingIds = new Set(formData.products.map(p => p.product_id));
    const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.product_id));

    if (uniqueNewProducts.length > 0) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, ...uniqueNewProducts]
      }));
      showToast('success', `Đã thêm ${uniqueNewProducts.length} sản phẩm`);
    } else {
      showToast('success', 'Các sản phẩm đã được thêm trước đó');
    }
  };

  const validateForm = async (): Promise<boolean> => {
    if (!formData.name.trim()) {
      showToast('error', 'Vui lòng nhập tên chương trình');
      return false;
    }

    if (!formData.start_time || !formData.end_time) {
      showToast('error', 'Vui lòng chọn thời gian bắt đầu và kết thúc');
      return false;
    }

    if (formData.products.length === 0) {
      showToast('error', 'Vui lòng thêm ít nhất một sản phẩm');
      return false;
    }

    const timeValidation = await validateTimeSlot(
      formData.start_time,
      formData.end_time,
      editingId || undefined
    );

    if (!timeValidation.isValid) {
      setTimeSlotError(timeValidation.message || 'Khung giờ không hợp lệ');
      showToast('error', timeValidation.message || 'Khung giờ không hợp lệ');
      return false;
    }

    for (const product of formData.products) {
      if (product.flash_price >= (product.product_price || 0)) {
        showToast('error', `Giá Flash Sale của "${product.product_name}" phải thấp hơn giá gốc`);
        return false;
      }

      if (product.stock_limit > (product.product_stock || 0)) {
        showToast('error', `Số lượng bán của "${product.product_name}" vượt quá tồn kho`);
        return false;
      }

      if (product.stock_limit <= 0) {
        showToast('error', `Số lượng bán của "${product.product_name}" phải lớn hơn 0`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(await validateForm())) {
      return;
    }

    try {
      setSaving(true);

      const submitData: FlashSaleFormData = {
        name: formData.name.trim(),
        description: formData.description?.trim(),
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        is_active: formData.is_active,
        products: formData.products.map(p => ({
          product_id: p.product_id,
          flash_price: p.flash_price,
          stock_limit: p.stock_limit,
          purchase_limit: p.purchase_limit
        }))
      };

      if (viewMode === 'edit' && editingId) {
        await updateFlashSale(editingId, submitData);
        showToast('success', 'Cập nhật Flash Sale thành công');
      } else {
        await createFlashSale(submitData);
        showToast('success', 'Tạo Flash Sale thành công');
      }

      setViewMode('list');
      resetForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Không thể ${viewMode === 'edit' ? 'cập nhật' : 'tạo'} Flash Sale`;
      showToast('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Render list view
  const renderListView = () => (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Flash Sale</h1>
          <p className="text-gray-600 mt-1">Quản lý các chương trình giảm giá theo thời gian</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo Flash Sale
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tên chương trình..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as 'all' | 'running' | 'upcoming' | 'ended' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="running">Đang diễn ra</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ended">Đã kết thúc</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : flashSales.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">Chưa có Flash Sale nào</p>
            <button
              onClick={handleCreate}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Tạo Flash Sale đầu tiên
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên chương trình
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flashSales.map((flashSale) => {
                const statusInfo = getFlashSaleStatus(flashSale);
                return (
                  <tr key={flashSale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{flashSale.name}</div>
                      {flashSale.description && (
                        <div className="text-sm text-gray-500 mt-1">{flashSale.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(flashSale.start_time)}
                      </div>
                      <div className="text-sm text-gray-500">
                        đến {formatDateTime(flashSale.end_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {flashSale.products?.length || 0} sản phẩm
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(flashSale.id)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                          title="Chỉnh sửa"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => confirmDelete(flashSale.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                          title="Xóa"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa Flash Sale này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeleteId(null);
        }}
        confirmText="Xóa"
      />
    </div>
  );

  // Render form view
  const renderFormView = () => {
    if (loadingForm) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBackToList}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {viewMode === 'edit' ? 'Chỉnh sửa Flash Sale' : 'Tạo Flash Sale mới'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin chung</h2>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên chương trình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="VD: Sale 12.12 Khung giờ vàng"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Mô tả chi tiết về chương trình Flash Sale..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange('start_time', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Time Slot Error */}
              {timeSlotError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-700">{timeSlotError}</span>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                  Kích hoạt Flash Sale
                </label>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Danh sách sản phẩm
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.products.length} sản phẩm được chọn
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm sản phẩm
              </button>
            </div>

            <FlashSaleProductTable
              products={formData.products}
              onChange={handleProductsChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleBackToList}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {saving ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>

        {/* Product Selection Modal */}
        <ProductSelectionModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          onSelect={handleAddProducts}
          selectedProductIds={formData.products.map(p => p.product_id)}
        />
      </div>
    );
  };

  return (
    <div className="p-6">
      {viewMode === 'list' ? renderListView() : renderFormView()}
    </div>
  );
};

export default FlashSale;
