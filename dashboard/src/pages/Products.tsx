import { useState } from 'react';
import { Search, Plus, Grid, List, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: string;
  images: string[];
  category: {
    name: string;
  };
}

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sample products data
  const products: Product[] = [
    {
      id: 1,
      name: 'Apple Watch Series 4',
      price: '120.00',
      images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400'],
      category: { name: 'Wearables' }
    },
    {
      id: 2,
      name: 'Air-Max-270',
      price: '60.00',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
      category: { name: 'Footwear' }
    },
    {
      id: 3,
      name: 'Minimal Chair Tool',
      price: '24.59',
      images: ['https://images.unsplash.com/photo-1503602642458-232111445657?w=400'],
      category: { name: 'Furniture' }
    },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage your product inventory</p>
        </div>
        <Link
          to="/products/add"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
        >
          <Plus size={20} />
          Add New Product
        </Link>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-soft p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors z-10" size={20} />
              <input
                type="text"
                placeholder="Search products by name, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* View Mode & Filter */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition-all duration-200 shadow-sm hover:shadow">
              <Filter size={18} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 overflow-hidden border border-gray-100 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 bg-white hover:bg-blue-50 rounded-lg shadow-md transition-all duration-200">
                    <Eye size={16} className="text-gray-700" />
                  </button>
                  <button className="p-2 bg-white hover:bg-red-50 rounded-lg shadow-md transition-all duration-200">
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">{product.category.name}</p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-sm">★</span>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">(131)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xl font-bold text-blue-600">${product.price}</span>
                  <Link
                    to={`/products/edit/${product.id}`}
                    className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-blue-50 hover:to-purple-50 text-gray-700 hover:text-blue-600 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <Edit size={14} />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Product</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 transition-all duration-200">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover shadow-sm"
                      />
                      <span className="font-semibold text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{product.category.name}</td>
                  <td className="py-4 px-6">
                    <span className="text-lg font-bold text-blue-600">${product.price}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={18} className="text-gray-600" />
                      </button>
                      <Link to={`/products/edit/${product.id}`} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18} className="text-blue-600" />
                      </Link>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Products;
