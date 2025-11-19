import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Tag, 
  Building2, 
  ClipboardList,
  FileText,
  AlertCircle,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { productService } from '../services/productService';
import type { Product } from '../services/productService';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadProductDetail(id);
    }
  }, [id]);

  const loadProductDetail = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductById(parseInt(productId));
      setProduct(data);
      setSelectedImage(data.images[0] || 'https://via.placeholder.com/600');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải thông tin sản phẩm';
      setError(errorMessage);
      alert('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      setDeleting(true);
      await productService.deleteProduct(product.id);
      setShowDeleteDialog(false);
      
      // Show success message briefly before navigating
      setTimeout(() => {
        navigate('/products', { state: { reload: true } });
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa sản phẩm';
      alert(errorMessage);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg border-2 border-blue-200">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-blue-600 font-bold text-lg">Đang tải thông tin sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-300 rounded-2xl p-8 text-center shadow-lg">
            <span className="text-6xl mb-4 block">⚠️</span>
            <p className="text-red-700 font-bold text-lg mb-4">{error || 'Không tìm thấy sản phẩm'}</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300"
            >
              Quay lại danh sách sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }

  const parsedFAQ = Array.isArray(product.faq) 
    ? product.faq 
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/products')}
              className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-blue-200"
            >
              <ArrowLeft size={20} className="text-blue-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Eye className="text-blue-600" size={32} />
                Chi tiết sản phẩm
              </h1>
              <p className="text-gray-500 mt-1">Xem thông tin chi tiết về sản phẩm</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/dashboard/products/edit/${product.id}`}
              className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Edit size={18} />
              Chỉnh sửa
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Trash2 size={18} />
              Xóa
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 overflow-hidden">
              {/* Main Image */}
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              
              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="p-4 bg-gray-50 border-t-2 border-blue-100">
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(img)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                          selectedImage === img
                            ? 'border-blue-500 shadow-md'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Info Card */}
            <div className="mt-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Package size={24} />
                Thông tin nhanh
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-blue-400">
                  <span className="text-blue-100">Tồn kho:</span>
                  <span className="font-bold text-lg">{product.stock} {product.unittype?.name || 'đơn vị'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-400">
                  <span className="text-blue-100">Giá bán:</span>
                  <span className="font-bold text-xl">{parseInt(product.price).toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-400">
                  <span className="text-blue-100">Thuế:</span>
                  <span className="font-bold">{parseInt(product.tax_fee).toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-blue-100">Đơn thuốc:</span>
                  <span className="flex items-center gap-2">
                    {product.prescription_required ? (
                      <>
                        <CheckCircle size={18} />
                        <span className="font-semibold">Cần đơn</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={18} />
                        <span className="font-semibold">Không cần</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Name & Basic Info */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                  <Tag className="text-blue-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Danh mục</p>
                    <p className="font-semibold text-gray-900">{product.categories?.name || 'Chưa phân loại'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg">
                  <Building2 className="text-purple-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Thương hiệu</p>
                    <p className="font-semibold text-gray-900">{product.brand || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {product.description && (
                <div className="border-t-2 border-gray-100 pt-4">
                  <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    Mô tả sản phẩm
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>

            {/* Manufacturer Info */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="text-blue-600" size={24} />
                Thông tin nhà sản xuất
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Nhà sản xuất" value={product.manufacturer} />
                <InfoRow label="Nhà sản xuất (2)" value={product.manufactor} />
                <InfoRow label="Nhà phân phối" value={product.producer} />
                <InfoRow label="Nhà cung cấp" value={product.suppliers?.name} />
                <InfoRow label="Số đăng ký" value={product.registNum} />
                <InfoRow label="Quy cách" value={product.specification} />
              </div>
            </div>

            {/* Usage & Dosage */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardList className="text-green-600" size={24} />
                Hướng dẫn sử dụng
              </h3>
              <div className="space-y-4">
                {product.usage && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Công dụng:</h4>
                    <p className="text-gray-600 bg-green-50 p-3 rounded-lg">{product.usage}</p>
                  </div>
                )}
                {product.dosage && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Liều lượng:</h4>
                    <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">{product.dosage}</p>
                  </div>
                )}
                {product.adverseEffect && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <AlertCircle className="text-red-600" size={18} />
                      Tác dụng phụ:
                    </h4>
                    <p className="text-gray-600 bg-red-50 p-3 rounded-lg border-l-4 border-red-500">{product.adverseEffect}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Legal Declaration */}
            {product.legalDeclaration && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="text-purple-600" size={24} />
                  Tuyên bố pháp lý
                </h3>
                <p className="text-gray-600 bg-purple-50 p-4 rounded-lg leading-relaxed">{product.legalDeclaration}</p>
              </div>
            )}

            {/* FAQ */}
            {parsedFAQ.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-blue-600" size={24} />
                  Câu hỏi thường gặp
                </h3>
                <div className="space-y-4">
                  {parsedFAQ.map((faqItem: { question: string; answer: string }, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                      <h4 className="font-bold text-gray-900 mb-2">
                        Q{index + 1}: {faqItem.question}
                      </h4>
                      <p className="text-gray-600">
                        <span className="font-semibold text-blue-600">A:</span> {faqItem.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="text-gray-600" size={20} />
                Thông tin thời gian
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Ngày tạo:</p>
                  <p className="font-semibold text-gray-700">{new Date(product.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Cập nhật lần cuối:</p>
                  <p className="font-semibold text-gray-700">{new Date(product.updated_at).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${product?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa sản phẩm"
        cancelText="Hủy"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};

// Helper Component
const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-semibold text-gray-900">{value || 'N/A'}</p>
  </div>
);

export default ProductDetail;
