import { useState, useEffect } from 'react';
import { Search, Plus, Grid, List, Edit, Trash2, Eye, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { productService, type Product } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { CATEGORY_MENU, type MainMenuKey, type Subcategory } from '../constants/categoryMenu';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Products = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedMainMenu, setSelectedMainMenu] = useState<MainMenuKey | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const PRODUCTS_PER_PAGE = 10;

  // Trigger refresh when navigating back with reload state
  useEffect(() => {
    if (location.state?.reload) {
      setRefreshKey(prev => prev + 1);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch products with pagination
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts(currentPage, PRODUCTS_PER_PAGE);
        console.log('Products response:', response);
        
        const productsData = (response?.products || []).map((product: Product) => ({
          ...product,
          // Ensure images is always an array
          images: Array.isArray(product.images) ? product.images : (product.image_url ? [product.image_url] : [])
        }));
        setProducts(productsData);
        setTotalProducts(response?.pagination?.total || productsData.length);
        setTotalPages(response?.pagination?.totalPages || Math.ceil((response?.pagination?.total || productsData.length) / PRODUCTS_PER_PAGE));
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, refreshKey]);

  // Fetch products when subcategory changes
  useEffect(() => {
    if (selectedSubcategory) {
      const fetchCategoryProducts = async () => {
        try {
          setLoading(true);
          const response = await categoryService.getProductsByCategoryId(selectedSubcategory.id);
          const productsData = (response?.products || []).map((product: Product) => ({
            ...product,
            // Ensure images is always an array
            images: Array.isArray(product.images) ? product.images : (product.image_url ? [product.image_url] : [])
          }));
          setProducts(productsData);
          setCurrentPage(1);
          setTotalProducts(productsData.length);
          setTotalPages(1);
          setError(null);
        } catch (err) {
          console.error('Error fetching category products:', err);
          setProducts([]);
        } finally {
          setLoading(false);
        }
      };
      fetchCategoryProducts();
    } else {
      // Reset page and refresh
      setCurrentPage(1);
      setRefreshKey(prev => prev + 1);
    }
  }, [selectedSubcategory]);

  // Handle main menu click
  const handleMainMenuClick = (key: MainMenuKey) => {
    if (selectedMainMenu === key) {
      setSelectedMainMenu('');
      setSelectedCategory('');
      setSelectedSubcategory(null);
    } else {
      setSelectedMainMenu(key);
      setSelectedCategory('');
      setSelectedSubcategory(null);
    }
  };

  // Handle category click
  const handleCategoryClick = (categoryTitle: string) => {
    setSelectedCategory(categoryTitle === selectedCategory ? '' : categoryTitle);
    setSelectedSubcategory(null);
  };

  // Handle subcategory click
  const handleSubcategoryClick = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
  };

  // Handle delete product
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      await productService.deleteProduct(productToDelete.id);
      
      // Refresh current page
      setRefreshKey(prev => prev + 1);
      
      setShowDeleteDialog(false);
      setProductToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa sản phẩm';
      alert(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filter products by search (client-side)
  const filteredProducts = (products || []).filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected menu data
  const selectedMenuData = selectedMainMenu ? CATEGORY_MENU[selectedMainMenu] : null;
  const selectedCategoryData = selectedMenuData?.categories.find(cat => cat.title === selectedCategory);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {loading ? 'Đang tải...' : `Trang ${currentPage}/${totalPages} - ${totalProducts} sản phẩm`}
          </p>
        </div>
        <Link
          to="/dashboard/products/add"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
        >
          <Plus size={20} />
          Add New Product
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/50 rounded-2xl shadow-lg p-5 border-2 border-blue-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400 group-hover:text-blue-600 transition-colors z-10" size={22} />
              <input
                type="text"
                placeholder="🔍 Tìm kiếm sản phẩm theo tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-5 py-4 bg-white border-2 border-blue-200 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-blue-300"
              />
            </div>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-2 bg-white border-2 border-blue-200 rounded-xl p-1.5 shadow-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg scale-105'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg scale-105'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Menu Categories */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/50 rounded-2xl shadow-lg p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📂</span>
          Danh mục sản phẩm
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(CATEGORY_MENU).map(([key, menu]) => (
            <button
              key={key}
              onClick={() => handleMainMenuClick(key as MainMenuKey)}
              className={`px-5 py-4 rounded-xl text-base font-bold transition-all duration-300 flex flex-col items-center gap-2 ${
                selectedMainMenu === key
                  ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 text-white shadow-xl scale-105 border-2 border-blue-400'
                  : 'bg-white text-blue-900 hover:bg-blue-50 hover:scale-102 shadow-md border-2 border-blue-200 hover:border-blue-400'
              }`}
            >
              <span className="text-3xl">{menu.icon}</span>
              <span className="text-center text-sm leading-tight">{menu.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories & Subcategories - Compact Layout */}
      {selectedMainMenu && selectedMenuData && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 overflow-hidden">
          {/* Categories as horizontal tabs */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 border-b-2 border-blue-200">
            <h3 className="text-base font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-lg">📑</span>
              Chọn danh mục:
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedMenuData.categories.map((category, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCategoryClick(category.title)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === category.title
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border-2 border-blue-400'
                      : 'bg-white text-blue-900 hover:bg-blue-100 shadow-md border-2 border-blue-200'
                  }`}
                >
                  <span className="text-base">{category.icon}</span>
                  <span>{category.title}</span>
                  {selectedCategory === category.title && (
                    <ChevronDown size={16} className="rotate-180" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories - Only show when category is selected */}
          {selectedCategory && selectedCategoryData && (
            <div className="p-4 bg-gradient-to-br from-white to-blue-50/20">
              <h3 className="text-base font-bold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-lg">🏷️</span>
                {selectedCategoryData.title} - Chọn danh mục con:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {selectedCategoryData.subcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    onClick={() => handleSubcategoryClick(subcategory)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 text-center ${
                      selectedSubcategory?.id === subcategory.id
                        ? 'bg-gradient-to-br from-blue-700 via-blue-600 to-blue-700 text-white shadow-xl border-2 border-blue-500'
                        : 'bg-white text-blue-800 hover:bg-blue-100 shadow-md border-2 border-blue-200 hover:border-blue-400'
                    }`}
                  >
                    {subcategory.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}


      {/* Error State */}
      {error && (
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-300 rounded-2xl p-8 text-center shadow-lg">
          <span className="text-6xl mb-4 block">⚠️</span>
          <p className="text-red-700 font-bold text-lg">{error}</p>
        </div>
      )}

      {/* Products Grid/List */}
      {!loading && !error && viewMode === 'grid' ? (
        <div className="bg-gradient-to-br from-blue-50/30 to-white rounded-2xl p-4 border-2 border-blue-100">
          <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2 pb-2 border-b-2 border-blue-200">
            <span className="text-xl">📦</span>
            Danh sách sản phẩm
            <span className="ml-auto text-sm text-blue-600">({filteredProducts.length} sản phẩm)</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100 hover:border-blue-400 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      to={`/dashboard/products/detail/${product.id}`}
                      className="p-1.5 bg-white hover:bg-blue-50 rounded-lg shadow-md transition-all duration-200"
                    >
                      <Eye size={14} className="text-blue-600" />
                    </Link>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteClick(product);
                      }}
                      className="p-1.5 bg-white hover:bg-red-50 rounded-lg shadow-md transition-all duration-200"
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <div className="mb-2">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded inline-block">
                      {product.categories?.name || 'Chưa phân loại'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                      Kho: {product.total_stock ?? product.stock ?? 0}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold">
                      {product.brand || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                    <span className="text-base font-bold text-blue-600">
                      {parseInt(product.price).toLocaleString('vi-VN')}₫
                    </span>
                    <Link
                      to={`/dashboard/products/edit/${product.id}`}
                      className="px-2 py-1 bg-gradient-to-r from-blue-100 to-blue-50 hover:from-blue-500 hover:to-blue-600 text-blue-700 hover:text-white rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1 border border-blue-200 hover:border-blue-500"
                    >
                      <Edit size={12} />
                      Sửa
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination for Grid View */}
          {!searchQuery && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 bg-white border-2 border-blue-200 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Trước
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                          : 'bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 bg-white border-2 border-blue-200 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Tiếp →
              </button>
            </div>
          )}
        </div>
      ) : !loading && !error ? (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-4 border-b-2 border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Danh sách sản phẩm
              <span className="ml-auto text-base text-blue-600">({filteredProducts.length} sản phẩm)</span>
            </h2>
          </div>
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 border-b-2 border-blue-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-bold text-blue-900 uppercase tracking-wider">Sản phẩm</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-blue-900 uppercase tracking-wider">Danh mục</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-blue-900 uppercase tracking-wider">Kho</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-blue-900 uppercase tracking-wider">Giá</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-blue-900 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-blue-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-100/30 transition-all duration-300">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/64'}
                        alt={product.name}
                        className="w-20 h-20 rounded-xl object-cover shadow-md border-2 border-blue-200"
                      />
                      <div className="max-w-xs">
                        <p className="font-bold text-base text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-blue-600 font-semibold">{product.brand || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                      {product.categories?.name || 'Chưa phân loại'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                      (product.total_stock ?? product.stock ?? 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.total_stock ?? product.stock ?? 0}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-lg font-bold text-blue-600">
                      {parseInt(product.price).toLocaleString('vi-VN')}₫
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/dashboard/products/detail/${product.id}`}
                        className="p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-blue-300"
                      >
                        <Eye size={20} className="text-blue-600" />
                      </Link>
                      <Link to={`/dashboard/products/edit/${product.id}`} className="p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-blue-300">
                        <Edit size={20} className="text-blue-600" />
                      </Link>
                      <button 
                        onClick={() => handleDeleteClick(product)}
                        className="p-2.5 hover:bg-red-50 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-red-300"
                      >
                        <Trash2 size={20} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination for List View */}
          {!searchQuery && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 pb-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-200'
                }`}
              >
                ← Trước
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-200'
                }`}
              >
                Tiếp →
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa sản phẩm"
        cancelText="Hủy"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Products;
