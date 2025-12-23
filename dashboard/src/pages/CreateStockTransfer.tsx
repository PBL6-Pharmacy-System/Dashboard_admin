import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Search, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { branchService } from '../services/branchService';
import { productService } from '../services/productService';
import { branchInventoryService } from '../services/branchInventoryService';
import { inventoryTransferService } from '../services/inventoryTransferService';
import { useToast } from '../hooks/useToast';

type Branch = {
  id: number;
  branch_name?: string;
  name?: string;
};

import type { Product as ProductType } from '../services/productService';
type Product = ProductType & {
  min_stock?: number;
  current_stock?: number;
};

interface TransferItem {
  product_id: number;
  product_name: string;
  quantity: number;
}

const CreateStockTransfer = () => {
  const navigate = useNavigate();
  const { success, error: showError, warning } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    from_branch_id: '',
    to_branch_id: '',
    notes: ''
  });
  
  const [items, setItems] = useState<TransferItem[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // Cache inventory data để tránh load lại nhiều lần
  const [inventoryCache, setInventoryCache] = useState<Map<number, any>>(new Map());

  // Chỉ load branches khi mount, products sẽ load khi mở modal
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const response = await branchService.getAllBranches({ active: true });
      const branchesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.branches || []);
      setBranches(branchesData);
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadProducts = async (forceReload = false) => {
    // Kiểm tra phải chọn chi nhánh trước
    if (!formData.from_branch_id) {
      warning('Vui lòng chọn chi nhánh nguồn trước');
      return;
    }
    
    const branchId = parseInt(formData.from_branch_id);
    
    // Sử dụng cache nếu đã load trước đó
    if (!forceReload && inventoryCache.has(branchId)) {
      console.log('✅ Using cached inventory for branch', branchId);
      const cachedData = inventoryCache.get(branchId);
      setProducts(cachedData);
      return;
    }
    
    try {
      setLoadingProducts(true);
      
      // Load song song products và inventory để nhanh hơn
      const [productsResponse, inventoryItems] = await Promise.all([
        productService.getAllProducts(1, 1000),
        branchInventoryService.getAllProductsAtBranch(branchId)
      ]);
      
      const productsData = productsResponse.products || [];
      
      // Tạo map để lookup nhanh
      const stockMap = new Map(
        inventoryItems.map(item => [item.product_id, item])
      );
      
      // Gán stock vào products
      const productsWithStock = productsData
        .map((product: Product) => {
          const inventory = stockMap.get(product.id);
          return {
            ...product,
            current_stock: inventory?.stock || 0,
            min_stock: inventory?.min_stock || 0
          };
        })
        // Chỉ hiển thị sản phẩm có stock > min_stock
        .filter((p: Product) => (p.current_stock || 0) > (p.min_stock || 0));
      
      // Lưu vào cache
      setInventoryCache(new Map(inventoryCache.set(branchId, productsWithStock)));
      setProducts(productsWithStock);
      
      console.log(`✅ Loaded ${productsWithStock.length} products with stock for branch ${branchId}`);
    } catch (error) {
      console.error('Error loading products:', error);
      showError('Không thể tải danh sách sản phẩm');
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddProduct = (product: Product) => {
    // Check if product already exists
    if (items.find(item => item.product_id === product.id)) {
      warning('Sản phẩm đã có trong danh sách');
      return;
    }
    
    setItems([...items, {
      product_id: product.id,
      product_name: product.name || '',
      quantity: 1
    }]);
    setShowProductModal(false);
  };

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter(item => item.product_id !== productId));
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    setItems(items.map(item => 
      item.product_id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.from_branch_id || !formData.to_branch_id) {
      warning('Vui lòng chọn chi nhánh nguồn và đích');
      return;
    }
    
    if (formData.from_branch_id === formData.to_branch_id) {
      warning('Chi nhánh nguồn và đích không được trùng nhau');
      return;
    }
    
    if (items.length === 0) {
      warning('Vui lòng thêm ít nhất 1 sản phẩm');
      return;
    }

    try {
      setLoading(true);
      
      // Backend API chỉ nhận 1 sản phẩm/phiếu
      // Tạo nhiều phiếu nếu có nhiều sản phẩm
      const promises = items.map(item => 
        inventoryTransferService.createTransfer({
          from_branch_id: parseInt(formData.from_branch_id),
          to_branch_id: parseInt(formData.to_branch_id),
          product_id: item.product_id,
          quantity: item.quantity,
          note: formData.notes
        })
      );
      
      await Promise.all(promises);
      
      if (items.length === 1) {
        success('Tạo phiếu chuyển kho thành công!');
      } else {
        success(`Đã tạo ${items.length} phiếu chuyển kho thành công!`);
      }
      
      navigate('/dashboard/stock-transfer');
    } catch (error) {
      console.error('Error creating transfer:', error);
      showError('Lỗi khi tạo phiếu: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/dashboard/stock-transfer')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo phiếu chuyển kho</h1>
          <p className="text-gray-600">Tạo yêu cầu chuyển hàng giữa các chi nhánh</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branch Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin chi nhánh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chi nhánh nguồn (Xuất) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.from_branch_id}
                onChange={(e) => {
                  setFormData({ ...formData, from_branch_id: e.target.value });
                  setItems([]); // Clear items khi đổi chi nhánh
                  setProducts([]); // Clear products hiện tại
                  // Cache sẽ được sử dụng khi mở modal lần sau
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn chi nhánh --</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name || branch.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Danh sách sản phẩm sẽ được lọc theo chi nhánh này
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chi nhánh đích (Nhận)
              </label>
              <select
                value={formData.to_branch_id}
                onChange={(e) => setFormData({ ...formData, to_branch_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn chi nhánh --</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name || branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Nhập ghi chú cho phiếu chuyển kho..."
            />
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Danh sách sản phẩm</h2>
            <button
              type="button"
              onClick={() => {
                if (!formData.from_branch_id) {
                  warning('Vui lòng chọn chi nhánh nguồn trước');
                  return;
                }
                setShowProductModal(true);
                // Load products ngay khi mở modal (sử dụng cache nếu có)
                loadProducts();
              }}
              disabled={!formData.from_branch_id}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Thêm sản phẩm
            </button>
          </div>

          {!formData.from_branch_id && (
            <p className="text-sm text-amber-600 mb-4">
              ⚠️ Vui lòng chọn chi nhánh nguồn trước khi thêm sản phẩm
            </p>
          )}

          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>Chưa có sản phẩm nào</p>
              <p className="text-sm">Nhấn "Thêm sản phẩm" để bắt đầu</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map(item => (
                  <tr key={item.product_id}>
                    <td className="px-4 py-3 font-medium">{item.product_name}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value) || 1)}
                        className="w-24 mx-auto block px-3 py-1 border rounded text-center"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.product_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/stock-transfer')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Tạo phiếu chuyển kho'}
          </button>
        </div>
      </form>

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Chọn sản phẩm</h3>
              <button onClick={() => setShowProductModal(false)} className="p-1 hover:bg-gray-100 rounded">
                ✕
              </button>
            </div>
            
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {loadingProducts ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Đang tải danh sách sản phẩm...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {formData.from_branch_id 
                        ? 'Không có sản phẩm nào có tồn kho > mức tối thiểu'
                        : 'Vui lòng chọn chi nhánh nguồn trước'}
                    </div>
                  ) : (
                    filteredProducts.map(product => (
                      <div 
                        key={product.id}
                        onClick={() => handleAddProduct(product)}
                        className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer flex items-center gap-3"
                      >
                        {product.image_url && (
                          <img src={product.image_url} alt="" className="w-12 h-12 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            Tồn kho: {product.current_stock || 0} | Tối thiểu: {product.min_stock || 0}
                          </p>
                        </div>
                        <Plus size={20} className="text-blue-600" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateStockTransfer;
