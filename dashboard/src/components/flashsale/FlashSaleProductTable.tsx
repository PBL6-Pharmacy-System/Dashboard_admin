import React from 'react';
import type { FlashSaleProductInput } from '../../types/flashsale.types';

interface FlashSaleProductTableProps {
  products: FlashSaleProductInput[];
  onChange: (products: FlashSaleProductInput[]) => void;
  readOnly?: boolean;
}

const FlashSaleProductTable: React.FC<FlashSaleProductTableProps> = ({ products, onChange, readOnly = false }) => {
  const calculateDiscount = (originalPrice: number, flashPrice: number): string => {
    if (!originalPrice || originalPrice === 0) return '0%';
    const discount = ((originalPrice - flashPrice) / originalPrice) * 100;
    return discount.toFixed(0) + '%';
  };

  const hasError = (product: FlashSaleProductInput, field: 'price' | 'stock'): boolean => {
    if (field === 'price') {
      return product.flash_price >= (product.product_price || 0);
    }
    if (field === 'stock') {
      return product.stock_limit > (product.product_stock || 0);
    }
    return false;
  };

  const getErrorMessage = (product: FlashSaleProductInput, field: 'price' | 'stock'): string => {
    if (field === 'price' && hasError(product, 'price')) {
      return 'Giá Sale phải thấp hơn giá gốc';
    }
    if (field === 'stock' && hasError(product, 'stock')) {
      return `Vượt quá tồn kho (${product.product_stock || 0})`;
    }
    return '';
  };

  const updateProduct = (index: number, field: keyof FlashSaleProductInput, value: string | number | undefined) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    onChange(updatedProducts);
  };

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    onChange(updatedProducts);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-500 text-lg">Chưa có sản phẩm nào</p>
        <p className="text-gray-400 text-sm mt-2">Nhấn "Thêm sản phẩm" để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sản phẩm
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giá gốc
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giá Flash Sale
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giảm giá
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              SL bán
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giới hạn mua
            </th>
            {!readOnly && (
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product, index) => {
            const priceError = hasError(product, 'price');
            const stockError = hasError(product, 'stock');
            const discount = calculateDiscount(product.product_price || 0, product.flash_price);

            return (
              <tr key={product.product_id} className="hover:bg-gray-50">
                {/* Product Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {product.product_image && (
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="h-12 w-12 rounded object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.product_name}
                      </div>
                      {product.product_sku && (
                        <div className="text-sm text-gray-500">SKU: {product.product_sku}</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Original Price */}
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(product.product_price || 0)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Kho: {product.product_stock || 0}
                  </div>
                </td>

                {/* Flash Price */}
                <td className="px-6 py-4">
                  {readOnly ? (
                    <div className="text-sm font-medium text-red-600 text-right">
                      {formatCurrency(product.flash_price || 0)}
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        value={product.flash_price || ''}
                        onChange={(e) => updateProduct(index, 'flash_price', Number(e.target.value))}
                        className={`w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right ${
                          priceError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        min="0"
                        step="1000"
                      />
                      {priceError && (
                        <div className="absolute left-0 top-full mt-1 text-xs text-red-600 whitespace-nowrap">
                          {getErrorMessage(product, 'price')}
                        </div>
                      )}
                    </div>
                  )}
                </td>

                {/* Discount */}
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    priceError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {priceError ? '❌' : '-' + discount}
                  </span>
                </td>

                {/* Stock Limit */}
                <td className="px-6 py-4">
                  {readOnly ? (
                    <div className="text-sm text-gray-900 text-center">
                      {product.stock_limit || 0}
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        value={product.stock_limit || ''}
                        onChange={(e) => updateProduct(index, 'stock_limit', Number(e.target.value))}
                        className={`w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center ${
                          stockError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        min="0"
                      />
                      {stockError && (
                        <div className="absolute left-0 top-full mt-1 text-xs text-red-600 whitespace-nowrap">
                          {getErrorMessage(product, 'stock')}
                        </div>
                      )}
                    </div>
                  )}
                </td>

                {/* Purchase Limit */}
                <td className="px-6 py-4">
                  {readOnly ? (
                    <div className="text-sm text-gray-900 text-center">
                      {product.purchase_limit || 'Không giới hạn'}
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={product.purchase_limit || ''}
                      onChange={(e) => updateProduct(index, 'purchase_limit', Number(e.target.value) || undefined)}
                      placeholder="Không giới hạn"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                      min="0"
                    />
                  )}
                </td>

                {/* Actions */}
                {!readOnly && (
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => removeProduct(index)}
                      className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                      title="Xóa sản phẩm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FlashSaleProductTable;
