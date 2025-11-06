import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, ChevronLeft, ChevronRight, AlertCircle, X } from 'lucide-react';

interface Product {
  id: string;
  image: string;
  name: string;
  category: string;
  price: number;
  piece: number;
  availableColors: string[];
}

// Mock data - Extended with more products
const mockProducts: Product[] = [
  {
    id: '1',
    image: '/images/apple-watch.jpg',
    name: 'Apple Watch Series 4',
    category: 'Digital Product',
    price: 690.00,
    piece: 63,
    availableColors: ['#000000', '#808080', '#FFC0CB']
  },
  {
    id: '2',
    image: '/images/headset.jpg',
    name: 'Microsoft Headsquare',
    category: 'Digital Product',
    price: 190.00,
    piece: 13,
    availableColors: ['#000000', '#FF6B6B', '#4DABF7', '#FFD43B']
  },
  {
    id: '3',
    image: '/images/dress.jpg',
    name: 'Women\'s Dress',
    category: 'Fashion',
    price: 640.00,
    piece: 635,
    availableColors: ['#862E9C', '#E64980', '#1971C2', '#5F3DC4']
  },
  {
    id: '4',
    image: '/images/samsung.jpg',
    name: 'Samsung A50',
    category: 'Mobile',
    price: 400.00,
    piece: 67,
    availableColors: ['#5F3DC4', '#000000', '#C92A2A']
  },
  {
    id: '5',
    image: '/images/camera.jpg',
    name: 'Camera',
    category: 'Electronic',
    price: 420.00,
    piece: 52,
    availableColors: ['#5F3DC4', '#000000', '#C92A2A']
  },
  {
    id: '6',
    image: '/images/headset-2.jpg',
    name: 'Microsoft Headsquare Pro',
    category: 'Digital Product',
    price: 190.00,
    piece: 13,
    availableColors: ['#000000', '#FF6B6B', '#4DABF7', '#FFD43B']
  },
  {
    id: '7',
    image: '/images/dress-2.jpg',
    name: 'Women\'s Evening Dress',
    category: 'Fashion',
    price: 640.00,
    piece: 635,
    availableColors: ['#862E9C', '#E64980', '#1971C2', '#5F3DC4']
  },
  {
    id: '8',
    image: '/images/iphone.jpg',
    name: 'iPhone 13 Pro',
    category: 'Mobile',
    price: 1099.00,
    piece: 89,
    availableColors: ['#000000', '#C0C0C0', '#FFD700', '#87CEEB']
  },
  {
    id: '9',
    image: '/images/laptop.jpg',
    name: 'MacBook Pro 16"',
    category: 'Electronic',
    price: 2499.00,
    piece: 24,
    availableColors: ['#C0C0C0', '#2F4F4F']
  },
  {
    id: '10',
    image: '/images/tablet.jpg',
    name: 'iPad Air',
    category: 'Digital Product',
    price: 599.00,
    piece: 145,
    availableColors: ['#C0C0C0', '#FFC0CB', '#87CEEB', '#9370DB']
  },
  {
    id: '11',
    image: '/images/shoes.jpg',
    name: 'Nike Air Max',
    category: 'Fashion',
    price: 180.00,
    piece: 234,
    availableColors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF']
  },
  {
    id: '12',
    image: '/images/smartwatch.jpg',
    name: 'Samsung Galaxy Watch',
    category: 'Digital Product',
    price: 349.00,
    piece: 78,
    availableColors: ['#000000', '#C0C0C0', '#FFD700']
  },
  {
    id: '13',
    image: '/images/headphones.jpg',
    name: 'Sony WH-1000XM4',
    category: 'Electronic',
    price: 349.00,
    piece: 156,
    availableColors: ['#000000', '#C0C0C0', '#4169E1']
  },
  {
    id: '14',
    image: '/images/keyboard.jpg',
    name: 'Mechanical Keyboard RGB',
    category: 'Electronic',
    price: 129.00,
    piece: 89,
    availableColors: ['#000000', '#FFFFFF', '#FF1493']
  },
  {
    id: '15',
    image: '/images/mouse.jpg',
    name: 'Gaming Mouse Pro',
    category: 'Electronic',
    price: 79.00,
    piece: 267,
    availableColors: ['#000000', '#FF0000', '#00FF00']
  },
  {
    id: '16',
    image: '/images/jacket.jpg',
    name: 'Leather Jacket',
    category: 'Fashion',
    price: 299.00,
    piece: 45,
    availableColors: ['#000000', '#8B4513', '#696969']
  },
  {
    id: '17',
    image: '/images/sunglasses.jpg',
    name: 'Ray-Ban Aviator',
    category: 'Fashion',
    price: 159.00,
    piece: 123,
    availableColors: ['#000000', '#FFD700', '#C0C0C0']
  },
  {
    id: '18',
    image: '/images/backpack.jpg',
    name: 'Travel Backpack',
    category: 'Fashion',
    price: 89.00,
    piece: 198,
    availableColors: ['#000000', '#4169E1', '#808080', '#8B0000']
  },
  {
    id: '19',
    image: '/images/speaker.jpg',
    name: 'Bluetooth Speaker',
    category: 'Electronic',
    price: 129.00,
    piece: 234,
    availableColors: ['#000000', '#FF4500', '#4169E1', '#32CD32']
  },
  {
    id: '20',
    image: '/images/tablet-2.jpg',
    name: 'Samsung Galaxy Tab',
    category: 'Digital Product',
    price: 449.00,
    piece: 67,
    availableColors: ['#000000', '#C0C0C0', '#FFB6C1']
  },
  {
    id: '21',
    image: '/images/earbuds.jpg',
    name: 'AirPods Pro',
    category: 'Electronic',
    price: 249.00,
    piece: 312,
    availableColors: ['#FFFFFF']
  },
  {
    id: '22',
    image: '/images/monitor.jpg',
    name: '4K Gaming Monitor',
    category: 'Electronic',
    price: 599.00,
    piece: 43,
    availableColors: ['#000000', '#C0C0C0']
  },
  {
    id: '23',
    image: '/images/phone-case.jpg',
    name: 'Silicone Phone Case',
    category: 'Mobile',
    price: 29.00,
    piece: 567,
    availableColors: ['#000000', '#FF1493', '#00CED1', '#FFD700', '#9370DB']
  },
  {
    id: '24',
    image: '/images/charger.jpg',
    name: 'Fast Charger 65W',
    category: 'Electronic',
    price: 45.00,
    piece: 423,
    availableColors: ['#FFFFFF', '#000000']
  },
  {
    id: '25',
    image: '/images/webcam.jpg',
    name: 'HD Webcam 1080p',
    category: 'Electronic',
    price: 89.00,
    piece: 178,
    availableColors: ['#000000', '#FFFFFF']
  },
];

const ProductStock: React.FC = () => {
  const [products] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const itemsPerPage = 7;

  // Low stock threshold
  const LOW_STOCK_THRESHOLD = 50;

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase().trim();
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.id.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Get search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase().trim();
    const suggestions: { type: 'product' | 'category'; value: string; match: string }[] = [];
    
    // Get unique categories that match
    const categories = new Set<string>();
    products.forEach(p => {
      if (p.category.toLowerCase().includes(query)) {
        categories.add(p.category);
      }
    });
    
    categories.forEach(cat => {
      suggestions.push({ type: 'category', value: cat, match: cat });
    });
    
    // Get matching products
    products.forEach(p => {
      if (p.name.toLowerCase().includes(query)) {
        suggestions.push({ type: 'product', value: p.name, match: p.name });
      }
    });
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }, [products, searchQuery]);

  // Highlight search term in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Calculate statistics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.piece, 0);
  const lowStockCount = products.filter(p => p.piece < LOW_STOCK_THRESHOLD).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.piece), 0);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleEdit = (productId: string) => {
    const product = products.find(p => p.id === productId);
    console.log('Edit product:', product);
    alert(`Edit product: ${product?.name}\nThis will navigate to edit page or open edit modal.`);
    // TODO: Navigate to edit page
    // navigate(`/products/edit/${productId}`);
  };

  const handleDelete = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (window.confirm(`Are you sure you want to delete "${product?.name}"?\n\nThis action cannot be undone.`)) {
      console.log('Delete product:', productId);
      alert(`Product "${product?.name}" has been deleted.\n\nIn production, this would call the API to delete the product.`);
      // TODO: Call API to delete product
      // await deleteProduct(productId);
      // Refresh product list
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    setShowSuggestions(value.trim().length >= 2);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header with Stats */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Product Stock</h1>
          
          {/* Search Bar */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <input
              type="text"
              placeholder="Search by product name, category, or ID..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <p className="text-xs text-gray-500 px-3 py-2 font-semibold uppercase">
                    Suggestions ({searchSuggestions.length})
                  </p>
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion.value)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-3 group"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        suggestion.type === 'category' 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {suggestion.type === 'category' ? (
                          <span className="text-xs font-bold">CAT</span>
                        ) : (
                          <span className="text-xs font-bold">PRD</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                          {highlightText(suggestion.match, searchQuery)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {suggestion.type === 'category' ? 'Category' : 'Product'}
                        </p>
                      </div>
                      <Search className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {showSuggestions && searchQuery.length >= 2 && searchSuggestions.length === 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
                <div className="text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No suggestions found</p>
                  <p className="text-xs mt-1">Try different keywords</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Stock</p>
            <p className="text-2xl font-bold text-blue-600">{totalStock.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Low Stock Alert</p>
            <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Piece
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Available Color
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Image */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden shadow-md">
                        <div className="w-10 h-10 bg-black/20 rounded transition-transform hover:scale-110"></div>
                      </div>
                    </td>

                    {/* Product Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {searchQuery ? highlightText(product.name, searchQuery) : product.name}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {searchQuery ? highlightText(product.category, searchQuery) : product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                    </td>

                    {/* Piece */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          product.piece < LOW_STOCK_THRESHOLD 
                            ? 'text-red-600' 
                            : 'text-gray-900'
                        }`}>
                          {product.piece}
                        </span>
                        {product.piece < LOW_STOCK_THRESHOLD && (
                          <div title={`Low stock: Only ${product.piece} left!`}>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Available Colors */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {product.availableColors.slice(0, 4).map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-125"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                        {product.availableColors.length > 4 && (
                          <span className="text-xs text-gray-500 ml-1">
                            +{product.availableColors.length - 4}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredProducts.length === 0 ? 0 : startIndex + 1}</span> to{' '}
            <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredProducts.length)}</span> of{' '}
            <span className="font-semibold text-gray-900">{filteredProducts.length}</span> results
            {searchQuery && (
              <span className="ml-2 text-blue-600">
                (filtered from {products.length} total)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border border-gray-200 transition-all ${
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed bg-gray-50'
                  : 'hover:bg-gray-50 hover:border-gray-300 active:scale-95'
              }`}
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-semibold text-sm">
                {currentPage}
              </span>
              <span className="text-sm text-gray-600">
                of {totalPages || 1}
              </span>
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 rounded-lg border border-gray-200 transition-all ${
                currentPage === totalPages || totalPages === 0
                  ? 'opacity-50 cursor-not-allowed bg-gray-50'
                  : 'hover:bg-gray-50 hover:border-gray-300 active:scale-95'
              }`}
              title="Next page"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductStock;
