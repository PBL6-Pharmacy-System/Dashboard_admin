import { useState, useMemo } from 'react';
import { Search, Building2, AlertTriangle, PackageCheck, Calendar, RefreshCcw, Filter } from 'lucide-react';
import type { Product } from '../types/dashboard.types';

// 1. Mock Data (Đã thêm expiryDate để lọc hạn sử dụng)
const mockProducts: Product[] = [
  {
    id: '1', image: '', name: 'Panadol Extra', category: 'Thuốc giảm đau', price: 150000,
    totalStock: 500, minStock: 50, availableColors: [],
    expiryDate: '2026-12-01', // Còn xa
    branches: [{ name: 'Kho Tổng', stock: 300 }]
  },
  {
    id: '2', image: '', name: 'Berberin 100mg', category: 'Tiêu hóa', price: 25000,
    totalStock: 30, minStock: 50, availableColors: [], // Dưới định mức
    expiryDate: '2026-05-20',
    branches: [{ name: 'Kho Tổng', stock: 30 }]
  },
  {
    id: '3', image: '', name: 'Vitamin C 500mg', category: 'Vitamin', price: 80000,
    totalStock: 120, minStock: 20, availableColors: [],
    expiryDate: '2026-01-15', // Sắp hết hạn (Giả sử hiện tại là tháng 11/2025)
    branches: [{ name: 'Kho Tổng', stock: 120 }]
  },
  {
    id: '4', image: '', name: 'Khẩu trang Y tế', category: 'Vật tư', price: 35000,
    totalStock: 1000, minStock: 200, availableColors: [],
    expiryDate: '2028-01-01',
    branches: [{ name: 'Kho Tổng', stock: 1000 }]
  },
  {
    id: '5', image: '', name: 'Siro Ho Prospan', category: 'Thuốc Ho', price: 110000,
    totalStock: 15, minStock: 20, availableColors: [], // Dưới định mức + Sắp hết hạn
    expiryDate: '2026-02-01', 
    branches: [{ name: 'Kho Tổng', stock: 15 }]
  },
];

// Định nghĩa kiểu lọc
type FilterType = 'ALL' | 'LOW_STOCK' | 'EXPIRING_SOON';

const ProductStock = () => {
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 2. State quản lý thẻ đang được chọn (Mặc định là ALL)
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  // Hàm kiểm tra sắp hết hạn (Ví dụ: < 90 ngày tính từ giả định hôm nay là 2025-11-20)
  const checkIsExpiring = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date('2025-11-20'); // Giả lập ngày hiện tại
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 90;
  };

  // 3. Logic tính toán số liệu thống kê (Luôn tính trên TẤT CẢ dữ liệu gốc)
  const stockStats = useMemo(() => {
    const lowStockCount = mockProducts.filter(item => item.totalStock < item.minStock).length;
    const expiringCount = mockProducts.filter(item => checkIsExpiring(item.expiryDate)).length;
    const totalUnits = mockProducts.reduce((acc, item) => acc + item.totalStock, 0);

    return {
      totalItems: mockProducts.length,
      lowStock: lowStockCount,
      expiring: expiringCount,
      totalUnits: totalUnits
    };
  }, []);

  // 4. Logic lọc dữ liệu hiển thị bảng
  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      // Lọc theo Search
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.id.includes(searchQuery);
      
      // Lọc theo Chi nhánh (Logic giả lập)
      const matchesBranch = selectedBranch === 'All' ? true : 
                            product.branches.some(b => b.name === selectedBranch && b.stock > 0);

      // Lọc theo Click Card (Quan trọng)
      let matchesCardFilter = true;
      if (activeFilter === 'LOW_STOCK') {
        matchesCardFilter = product.totalStock < product.minStock;
      } else if (activeFilter === 'EXPIRING_SOON') {
        matchesCardFilter = checkIsExpiring(product.expiryDate);
      }

      return matchesSearch && matchesBranch && matchesCardFilter;
    });
  }, [searchQuery, selectedBranch, activeFilter]);

  // Component Card nhỏ để tái sử dụng
  const FilterCard = ({ 
    type, 
    title, 
    value, 
    icon, 
    subText, 
    colorClass 
  }: { 
    type: FilterType, title: string, value: number | string, icon: React.ReactNode, subText?: string, colorClass: string 
  }) => {
    const isActive = activeFilter === type;
    return (
      <div 
        onClick={() => setActiveFilter(type)}
        className={`
          relative p-4 rounded-xl border cursor-pointer transition-all duration-200
          ${isActive 
            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-md transform scale-[1.02]' 
            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
          }
        `}
      >
        <div className="text-gray-500 text-xs font-bold uppercase mb-1">{title}</div>
        <div className={`text-2xl font-bold flex items-center gap-2 ${colorClass}`}>
          {value} {icon}
        </div>
        {subText && <p className={`text-xs mt-1 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{subText}</p>}
        
        {/* Dấu check khi Active */}
        {isActive && (
          <div className="absolute top-2 right-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full p-4 gap-4 bg-gray-50/30 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Kho hàng</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span>Trạng thái lọc:</span>
            <span className={`font-bold px-2 py-0.5 rounded text-xs ${
              activeFilter === 'ALL' ? 'bg-gray-200 text-gray-700' :
              activeFilter === 'LOW_STOCK' ? 'bg-red-100 text-red-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {activeFilter === 'ALL' ? 'Tất cả' : 
               activeFilter === 'LOW_STOCK' ? 'Sản phẩm thiếu hàng' : 'Sản phẩm sắp hết hạn'}
            </span>
            {activeFilter !== 'ALL' && (
              <button 
                onClick={() => setActiveFilter('ALL')}
                className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
              >
                <RefreshCcw size={12}/> Đặt lại
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm thuốc, mã lô..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="All">Toàn bộ kho</option>
              <option value="Kho Tổng">Kho Tổng</option>
              <option value="CN Quận 1">CN Quận 1</option>
            </select>
            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* INTERACTIVE STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Tổng quan (Reset Filter) */}
        <FilterCard 
          type="ALL"
          title="Tổng đơn vị thuốc"
          value={stockStats.totalUnits.toLocaleString()}
          icon={<PackageCheck size={20} />}
          colorClass="text-gray-900"
          subText="Nhấn để xem tất cả"
        />

        {/* Card 2: Cảnh báo Dưới định mức */}
        <FilterCard 
          type="LOW_STOCK"
          title="Sản phẩm dưới định mức"
          value={stockStats.lowStock}
          icon={<AlertTriangle size={20} />}
          colorClass="text-red-600"
          subText="Cần nhập hàng ngay"
        />

        {/* Card 3: Cảnh báo Sắp hết hạn */}
        <FilterCard 
          type="EXPIRING_SOON"
          title="Sắp hết hạn (3 tháng)"
          value={stockStats.expiring}
          icon={<Calendar size={20} />}
          colorClass="text-orange-500"
          subText="Cần đẩy bán gấp"
        />
      </div>

      {/* MAIN TABLE */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Danh mục</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Tồn kho</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Hạn dùng</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-400">ID: {product.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${product.totalStock < product.minStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.totalStock}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">/{product.minStock}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                       <div className="flex items-center gap-1">
                          {checkIsExpiring(product.expiryDate) && <AlertTriangle size={14} className="text-orange-500"/>}
                          <span className={checkIsExpiring(product.expiryDate) ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                            {product.expiryDate}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {product.totalStock < product.minStock && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 ml-2">
                          Thiếu hàng
                        </span>
                      )}
                      {checkIsExpiring(product.expiryDate) && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 ml-2">
                          Cận date
                        </span>
                      )}
                      {!(product.totalStock < product.minStock) && !checkIsExpiring(product.expiryDate) && (
                         <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                          Ổn định
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="w-8 h-8 text-gray-300" />
                      <p>Không tìm thấy sản phẩm nào theo bộ lọc này.</p>
                      <button 
                        onClick={() => setActiveFilter('ALL')}
                        className="text-blue-600 text-sm font-medium hover:underline"
                      >
                        Xem tất cả sản phẩm
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductStock;