import React, { useState, useEffect } from 'react';
import type { Product } from '../../services/productService';
import { branchInventoryService } from '../../services/branchInventoryService';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (products: Product[]) => void;
  selectedProductIds: number[];
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedProductIds
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(selectedProductIds));
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      setSelectedIds(new Set(selectedProductIds));
    }
  }, [isOpen, selectedProductIds]);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredProducts(products);
    } else {
      const searchLower = search.toLowerCase();
      setFilteredProducts(
        products.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.id.toString().includes(searchLower) ||
          (p.sku && p.sku.toLowerCase().includes(searchLower))
        )
      );
    }
  }, [search, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // ✅ Sử dụng service mới để lấy tất cả inventory
      const inventoryResponse = await branchInventoryService.getBranchInventory({ limit: 10000 });
      const inventoryData = inventoryResponse.data?.inventory || [];
      
      console.log('📦 Loaded inventory records:', inventoryData.length);
      
      // Group by product_id và tính tổng stock từ tất cả chi nhánh
      const productStockMap = new Map<number, { product: any, totalStock: number, branches: any[] }>();
      
      inventoryData.forEach((inv: any) => {
        const productId = inv.product_id;
        const stock = inv.stock ?? 0;
        
        if (productStockMap.has(productId)) {
          const existing = productStockMap.get(productId)!;
          existing.totalStock += stock;
          existing.branches.push({
            branch_id: inv.branch_id,
            branch_name: inv.branches?.name,
            stock: stock
          });
        } else {
          productStockMap.set(productId, {
            product: inv.products,
            totalStock: stock,
            branches: [{
              branch_id: inv.branch_id,
              branch_name: inv.branches?.name,
              stock: stock
            }]
          });
        }
      });
      
      // Chuyển đổi sang array và thêm totalStock vào product
      const productsWithStock = Array.from(productStockMap.values())
        .map(item => ({
          ...item.product,
          stock: item.totalStock, // Tổng tồn kho từ tất cả chi nhánh
          branchinventory: item.branches
        }))
        .filter(p => p.id); // Lọc bỏ records không có product
      
      // Lọc chỉ sản phẩm có tồn kho > 0
      const filteredByStock = productsWithStock.filter((p: Product) => {
        const stock = p.stock ?? 0;
        return stock > 0;
      });
      
      console.log('✅ Total unique products:', productsWithStock.length);
      console.log('✅ Products with stock > 0:', filteredByStock.length);
      console.log('📊 Sample products:', filteredByStock.slice(0, 3).map((p: any) => ({
        id: p.id,
        name: p.name,
        total_stock: p.stock,
        branches: p.branchinventory?.map((bi: any) => ({
          branch: bi.branch_name,
          stock: bi.stock
        }))
      })));
      
      setProducts(filteredByStock);
      setFilteredProducts(filteredByStock);
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (productId: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedIds(newSelected);
  };

  // const toggleAll = () => {
  //   if (selectedIds.size === filteredProducts.length) {
  //     setSelectedIds(new Set());
  //   } else {
  //     setSelectedIds(new Set(filteredProducts.map(p => p.id)));
  //   }
  // };

  const handleConfirm = () => {
    const selected = products.filter(p => selectedIds.has(p.id));
    onSelect(selected);
    onClose();
  };

  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop - Làm mờ nền, không đổi màu */}
      <div className="fixed inset-0 bg-black/5 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chọn sản phẩm</h2>
              <p className="text-sm text-gray-600 mt-1">
                Đã chọn: <span className="font-medium text-blue-600">{selectedIds.size}</span> sản phẩm
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b bg-gray-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập để tìm kiếm sản phẩm (tên, ID, mã SKU)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <svg
                className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Chỉ hiển thị sản phẩm còn hàng (stock &gt; 0)
            </p>
          </div>

          {/* Product List */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500">Không tìm thấy sản phẩm</p>
              </div>
            ) : (
              <>
                {/* Select All */}
                <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-3">
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Chọn tất cả ({filteredProducts.length} sản phẩm)
                  </label>
                </div>

                {/* Product Items */}
                <div className="space-y-2">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedIds.has(product.id);
                    const isAlreadySelected = selectedProductIds.includes(product.id);
                    // Backend trả về 'stock' = tổng tồn từ tất cả chi nhánh
                    const stock = product.stock ?? 0;

                    return (
                      <div
                        key={product.id}
                        onClick={() => !isAlreadySelected && toggleProduct(product.id)}
                        className={`flex items-center p-3 border rounded-lg transition ${
                          isAlreadySelected
                            ? 'bg-gray-50 border-gray-300 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'border-blue-500 bg-blue-50 cursor-pointer hover:bg-blue-100'
                            : 'border-gray-200 cursor-pointer hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isAlreadySelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="ml-3 h-12 w-12 rounded object-cover"
                          />
                        )}
                        
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {product.name}
                                {isAlreadySelected && (
                                  <span className="ml-2 text-xs text-gray-500">(Đã chọn)</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">ID: {product.id}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(product.price)}
                              </p>
                              <p className="text-xs text-gray-500">Tồn: {stock}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Xác nhận ({selectedIds.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;
