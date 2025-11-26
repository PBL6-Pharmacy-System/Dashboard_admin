import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productService } from '../services/productService';
import Toast from '../components/common/Toast';

interface FAQItem {
  question: string;
  answer: string;
}

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    tax_fee: '0',
    manufacturer: '',
    usage: '',
    dosage: '',
    specification: '',
    adverseEffect: '',
    registNum: '',
    brand: '',
    producer: '',
    manufactor: '',
    legalDeclaration: '',
    category_id: '',
    supplier_id: '',
    base_unit_id: '1',
    image_url: '',
    prescription_required: false
  });

  // Separate state for FAQ items
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    { question: '', answer: '' }
  ]);

  // Load product data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadProductData(id);
    }
  }, [isEditMode, id]);

  const loadProductData = async (productId: string) => {
    try {
      setLoadingProduct(true);
      const product = await productService.getProductById(parseInt(productId));
      
      // Populate form with product data
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        tax_fee: product.tax_fee?.toString() || '0',
        manufacturer: product.manufacturer || '',
        usage: product.usage || '',
        dosage: product.dosage || '',
        specification: product.specification || '',
        adverseEffect: product.adverseEffect || '',
        registNum: product.registNum || '',
        brand: product.brand || '',
        producer: product.producer || '',
        manufactor: product.manufactor || '',
        legalDeclaration: product.legalDeclaration || '',
        category_id: product.category_id?.toString() || '',
        supplier_id: product.supplier_id?.toString() || '',
        base_unit_id: product.base_unit_id?.toString() || '1',
        image_url: product.image_url || '',
        prescription_required: product.prescription_required || false
      });

      // Load FAQ items
      if (Array.isArray(product.faq) && product.faq.length > 0) {
        setFaqItems(product.faq);
      } else {
        setFaqItems([{ question: '', answer: '' }]);
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại!');
    } finally {
      setLoadingProduct(false);
    }
  };

  // FAQ Management Functions
  const addFaqItem = () => {
    setFaqItems([...faqItems, { question: '', answer: '' }]);
  };

  const removeFaqItem = (index: number) => {
    if (faqItems.length > 1) {
      setFaqItems(faqItems.filter((_, i) => i !== index));
    }
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqItems = [...faqItems];
    newFaqItems[index][field] = value;
    setFaqItems(newFaqItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.name || !formData.description || !formData.price) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Mô tả, Giá)!');
      }

      // Filter out empty FAQ items
      const validFaqItems = faqItems.filter(item => item.question.trim() !== '' || item.answer.trim() !== '');

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        tax_fee: formData.tax_fee || '0',
        manufacturer: formData.manufacturer || undefined,
        usage: formData.usage || undefined,
        dosage: formData.dosage || undefined,
        specification: formData.specification || undefined,
        adverseEffect: formData.adverseEffect || undefined,
        registNum: formData.registNum || undefined,
        brand: formData.brand || undefined,
        producer: formData.producer || undefined,
        manufactor: formData.manufactor || undefined,
        legalDeclaration: formData.legalDeclaration || undefined,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
        base_unit_id: parseInt(formData.base_unit_id),
        image_url: formData.image_url || null,
        prescription_required: formData.prescription_required,
        images: [],
        faq: validFaqItems.length > 0 ? validFaqItems : undefined
      };

      if (isEditMode && id) {
        await productService.updateProduct(parseInt(id), productData);
      } else {
        await productService.createProduct(productData);
      }
      
      setSuccess(true);

      setTimeout(() => {
        navigate('/dashboard/products', { replace: true, state: { reload: true } });
      }, 1500);
      
    } catch (err: unknown) {
      console.error('❌ Error creating product:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể thêm sản phẩm. Vui lòng thử lại!';
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Show loading spinner when loading product data
  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {success && (
        <Toast
          type="success"
          message={isEditMode ? "Cập nhật sản phẩm thành công! 🎉" : "Thêm sản phẩm thành công! 🎉"}
          description="Đang chuyển hướng về danh sách sản phẩm..."
        />
      )}

      {error && (
        <Toast
          type="error"
          message="Có lỗi xảy ra! ⚠️"
          description={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/products"
          className="p-2 hover:bg-white rounded-xl transition-all duration-200 border border-gray-200"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            {isEditMode ? 'Update Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {isEditMode ? 'Update the product information' : 'Fill in the product information'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-soft p-6 lg:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter product name"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (VND) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Fee (%)</label>
              <input
                type="number"
                value={formData.tax_fee}
                onChange={(e) => setFormData({ ...formData, tax_fee: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Number</label>
              <input
                type="text"
                value={formData.registNum}
                onChange={(e) => setFormData({ ...formData, registNum: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter registration number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter image URL"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prescription Required? *</label>
              <select
                value={formData.prescription_required ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, prescription_required: e.target.value === 'true' })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="false">Không yêu cầu đơn thuốc</option>
                <option value="true">Yêu cầu đơn thuốc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Manufacturer Information */}
        <div className="bg-gradient-to-br from-white to-green-50/20 rounded-2xl shadow-soft p-6 lg:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
            Manufacturer Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g., Pfizer Consumer Healthcare"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Producer</label>
              <input
                type="text"
                value={formData.producer}
                onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g., Pfizer Inc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Manufactor</label>
              <input
                type="text"
                value={formData.manufactor}
                onChange={(e) => setFormData({ ...formData, manufactor: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter manufactor"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specification</label>
              <input
                type="text"
                value={formData.specification}
                onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g., Lọ 100 viên"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Legal Declaration</label>
              <textarea
                rows={3}
                value={formData.legalDeclaration}
                onChange={(e) => setFormData({ ...formData, legalDeclaration: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="Enter legal declaration"
              />
            </div>
          </div>
        </div>

        {/* Usage & Dosage */}
        <div className="bg-gradient-to-br from-white to-orange-50/20 rounded-2xl shadow-soft p-6 lg:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">3</span>
            Usage & Dosage Information
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Usage Instructions</label>
              <textarea
                rows={3}
                value={formData.usage}
                onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="e.g., Uống 1 viên mỗi ngày sau bữa ăn"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage Information</label>
              <textarea
                rows={3}
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="e.g., 1 viên/ngày"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Adverse Effects</label>
              <textarea
                rows={3}
                value={formData.adverseEffect}
                onChange={(e) => setFormData({ ...formData, adverseEffect: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="e.g., Có thể gây buồn nôn nhẹ"
              />
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                FAQ (Câu hỏi thường gặp)
              </label>
              <button
                type="button"
                onClick={addFaqItem}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Plus size={16} />
                Thêm câu hỏi
              </button>
            </div>

            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl border-2 border-gray-200 p-4 relative">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-bold text-blue-600">FAQ #{index + 1}</span>
                    {faqItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFaqItem(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all duration-200"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Câu hỏi
                      </label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                        placeholder="Nhập câu hỏi..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Trả lời
                      </label>
                      <textarea
                        rows={3}
                        value={faq.answer}
                        onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none text-sm"
                        placeholder="Nhập câu trả lời..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {faqItems.length === 0 && (
              <p className="text-center text-gray-400 py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
              </p>
            )}
          </div>
        </div>

        {/* Category & Supplier */}
        <div className="bg-gradient-to-br from-white to-cyan-50/20 rounded-2xl shadow-soft p-6 lg:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">4</span>
            Category & Supplier
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category ID</label>
              <input
                type="number"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter category ID"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier ID</label>
              <input
                type="number"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter supplier ID"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Base Unit ID</label>
              <input
                type="number"
                value={formData.base_unit_id}
                onChange={(e) => setFormData({ ...formData, base_unit_id: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter base unit ID"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center gap-4 justify-end">
          <Link
            to="/dashboard/products"
            className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center gap-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-blue-500/30 hover:shadow-blue-500/50'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{isEditMode ? 'Đang cập nhật...' : 'Đang thêm...'}</span>
              </>
            ) : (
              <span>{isEditMode ? 'Update Product' : 'Add Product'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
