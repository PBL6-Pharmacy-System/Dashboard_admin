import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { FlashSaleFormData, FlashSaleProductInput } from '../types/flashsale.types';
import {
  createFlashSale,
  updateFlashSale,
  getFlashSaleById,
  validateTimeSlot
} from '../services/flashSaleService';
import type { Product } from '../services/productService';
import { useToast } from '../hooks/useToast';
import FlashSaleProductTable from '../components/flashsale/FlashSaleProductTable';
import ProductSelectionModal from '../components/flashsale/ProductSelectionModal';

const FlashSaleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    const loadFlashSale = async (flashSaleId: number) => {
      try {
        setLoading(true);
        const data = await getFlashSaleById(flashSaleId);
        
        setFormData({
          name: data.name,
          description: data.description || '',
          start_time: new Date(data.start_time).toISOString().slice(0, 16),
          end_time: new Date(data.end_time).toISOString().slice(0, 16),
          is_active: data.is_active,
          products: data.products?.map(p => ({
            product_id: p.product_id,
            flash_price: p.flash_price,
            stock_limit: p.stock_limit,
            purchase_limit: p.purchase_limit,
            product_name: p.product?.name,
            product_price: p.product?.price,
            product_stock: p.product?.stock,
            product_image: p.product?.image,
            product_sku: p.product?.sku
          })) || []
        });
      } catch {
        showToast('error', 'Không thể tải thông tin Flash Sale');
        navigate('/flash-sales');
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode && id) {
      loadFlashSale(Number(id));
    } else {
      // Set default dates for new flash sale
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowEnd = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000); // +2 hours

      setFormData(prev => ({
        ...prev,
        start_time: tomorrow.toISOString().slice(0, 16),
        end_time: tomorrowEnd.toISOString().slice(0, 16)
      }));
    }
  }, [id, isEditMode, showToast, navigate]);

  const handleInputChange = (field: keyof FlashSaleFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear time slot error when dates change
    if (field === 'start_time' || field === 'end_time') {
      setTimeSlotError('');
    }
  };

  const handleProductsChange = (products: FlashSaleProductInput[]) => {
    setFormData(prev => ({ ...prev, products }));
  };

  const handleAddProducts = (selectedProducts: Product[]) => {
    const newProducts: FlashSaleProductInput[] = selectedProducts.map(product => ({
      product_id: product.id,
      flash_price: Math.round(parseFloat(product.price) * 0.8), // Default 20% discount
      stock_limit: Math.min(product.stock ?? 0, 50), // Default max 50 (stock = tổng từ tất cả chi nhánh)
      purchase_limit: 5,
      product_name: product.name,
      product_price: parseFloat(product.price),
      product_stock: product.total_stock ?? product.stock ?? 0,
      product_image: product.image_url || undefined,
      product_sku: product.id.toString()
    }));

    // Filter out duplicates
    const existingIds = new Set(formData.products.map(p => p.product_id));
    const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.product_id));

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, ...uniqueNewProducts]
    }));
  };

  const validateForm = async (): Promise<boolean> => {
    // Basic validation
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

    // Validate time slot
    const timeValidation = await validateTimeSlot(
      formData.start_time,
      formData.end_time,
      isEditMode ? Number(id) : undefined
    );

    if (!timeValidation.isValid) {
      setTimeSlotError(timeValidation.message || 'Khung giờ không hợp lệ');
      showToast('error', timeValidation.message || 'Khung giờ không hợp lệ');
      return false;
    }

    // Validate products
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

      // Prepare data for API
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

      if (isEditMode) {
        await updateFlashSale(Number(id), submitData);
        showToast('success', 'Cập nhật Flash Sale thành công');
      } else {
        await createFlashSale(submitData);
        showToast('success', 'Tạo Flash Sale thành công');
      }

      navigate('/flash-sales');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} Flash Sale`;
      showToast('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/flash-sales')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Chỉnh sửa Flash Sale' : 'Tạo Flash Sale mới'}
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
            onClick={() => navigate('/flash-sales')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover: transition"
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

export default FlashSaleForm;
