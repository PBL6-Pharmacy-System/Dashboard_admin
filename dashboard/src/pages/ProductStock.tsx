import { useState, useMemo, useEffect } from 'react';
import { Search, Building2, AlertTriangle, PackageCheck, Calendar, RefreshCcw, Filter } from 'lucide-react';
import { branchService } from '../services/branchService';
import { productBatchService } from '../services/productBatchService';
import type { ProductBatch as ProductBatchType } from '../services/productBatchService';

type Branch = {
  id: number;
  branch_name: string;
};

type InventoryItem = {
  product_id: number;
  product_name: string;
  category: string;
  stock: number;
  min_stock: number;
  max_stock: number;
  nearest_expiry_date?: string;
  batches?: Array<{
    batch_number: string;
    quantity: number;
    expiry_date: string;
  }>;
};

type InventoryItemData = {
  product_id: number;
  product?: { name: string; category?: { name: string } };
  stock?: number;
  quantity?: number;
  min_stock?: number;
  max_stock?: number;
  batches?: Array<{ expiry_date: string }>;
};

// Định nghĩa kiểu lọc
type FilterType = 'ALL' | 'LOW_STOCK' | 'EXPIRING_SOON';

const ProductStock = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // 2. State quản lý thẻ đang được chọn (Mặc định là ALL)
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch]);

  const loadBranches = async () => {
    try {
      const response = await branchService.getAllBranches({ active: true });
      console.log('Branches API response:', response);
      
      let branchesData: Branch[] = [];
      if (Array.isArray(response.data)) {
        branchesData = response.data;
      } else if (response.data?.branches && Array.isArray(response.data.branches)) {
        branchesData = response.data.branches;
      }
      
      // Normalize branch data to ensure consistent field names
      const normalizedBranches = branchesData.map((branch: Branch & { name?: string; branch_id?: number }) => ({
        id: (branch.id || branch.branch_id) as number,
        branch_name: branch.name || branch.branch_name || `Chi nhánh ${branch.id || branch.branch_id}`
      }));
      
      console.log('Normalized branches:', normalizedBranches);
      setBranches(normalizedBranches);
      
      // Auto-select first branch on initial load
      if (initialLoad && normalizedBranches.length > 0) {
        setSelectedBranch(normalizedBranches[0].id);
        setInitialLoad(false);
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadInventory = async () => {
    try {
      setLoading(true);
      let inventoryData: InventoryItem[] = [];

      if (selectedBranch === 'All') {
        // Load tất cả chi nhánh
        const allBatches = await productBatchService.getAllBatches({ status: 'available' });
        console.log('All batches response:', allBatches);
        
        if (allBatches.success) {
          // Handle different response structures
          const batchesArray = (
            Array.isArray(allBatches.data) ? allBatches.data :
            Array.isArray(allBatches.data?.batches) ? allBatches.data.batches :
            Array.isArray(allBatches.data?.data) ? allBatches.data.data :
            []
          ) as ProductBatchType[];
          
          if (batchesArray.length > 0) {
            // Group by product
            const productMap = new Map<number, InventoryItem>();
            
            batchesArray.forEach(batch => {
              const productId = batch.product_id;
              if (!productMap.has(productId)) {
                productMap.set(productId, {
                  product_id: productId,
                  product_name: batch.product?.name || `Product ${productId}`,
                  category: 'Chưa phân loại',
                  stock: 0,
                  min_stock: 50,
                  max_stock: 500,
                  batches: []
                });
              }
              
              const item = productMap.get(productId)!;
              item.stock += batch.quantity;
              item.batches!.push({
                batch_number: batch.batch_number,
                quantity: batch.quantity,
                expiry_date: batch.expiry_date
              });
              
              // Find nearest expiry
              if (!item.nearest_expiry_date || batch.expiry_date < item.nearest_expiry_date) {
                item.nearest_expiry_date = batch.expiry_date;
              }
            });
            
            inventoryData = Array.from(productMap.values());
          } else {
            console.warn('No batches data available');
          }
        }
      } else {
        // Load 1 chi nhánh cụ thể
        const response = await branchService.getBranchInventory(Number(selectedBranch));
        console.log('Branch inventory response:', response);
        
        if (response.success) {
          const dataArray = (
            Array.isArray(response.data) ? response.data :
            Array.isArray(response.data?.inventory) ? response.data.inventory :
            Array.isArray(response.data?.data) ? response.data.data :
            []
          ) as InventoryItemData[];
          
          inventoryData = dataArray.map((item: InventoryItemData): InventoryItem => ({
            product_id: item.product_id,
            product_name: item.product?.name || `Product ${item.product_id}`,
            category: item.product?.category?.name || 'Chưa phân loại',
            stock: item.stock || item.quantity || 0,
            min_stock: item.min_stock || 50,
            max_stock: item.max_stock || 500,
            nearest_expiry_date: item.batches?.[0]?.expiry_date,
            batches: undefined
          }));
        }
      }

      setInventory(inventoryData);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm kiểm tra sắp hết hạn (< 90 ngày)
  const checkIsExpiring = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 90;
  };

  // 3. Logic tính toán số liệu thống kê (Luôn tính trên TẤT CẢ dữ liệu gốc)
  const stockStats = useMemo(() => {
    const lowStockCount = inventory.filter(item => item.stock < item.min_stock).length;
    const expiringCount = inventory.filter(item => checkIsExpiring(item.nearest_expiry_date)).length;
    const totalUnits = inventory.reduce((acc, item) => acc + item.stock, 0);

    return {
      totalItems: inventory.length,
      lowStock: lowStockCount,
      expiring: expiringCount,
      totalUnits: totalUnits
    };
  }, [inventory]);

  // 4. Logic lọc dữ liệu hiển thị bảng
  const filteredProducts = useMemo(() => {
    return inventory.filter(product => {
      // Lọc theo Search
      const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.product_id.toString().includes(searchQuery);

      // Lọc theo Click Card (Quan trọng)
      let matchesCardFilter = true;
      if (activeFilter === 'LOW_STOCK') {
        matchesCardFilter = product.stock < product.min_stock;
      } else if (activeFilter === 'EXPIRING_SOON') {
        matchesCardFilter = checkIsExpiring(product.nearest_expiry_date);
      }

      return matchesSearch && matchesCardFilter;
    });
  }, [searchQuery, activeFilter, inventory]);

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
              onChange={(e) => setSelectedBranch(e.target.value === 'All' ? 'All' : Number(e.target.value))}
            >
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
              ))}
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCcw className="w-5 h-5 animate-spin" />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.product_id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.product_name}</div>
                      <div className="text-xs text-gray-400">ID: {product.product_id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${product.stock < product.min_stock ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stock}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">/{product.min_stock}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                       <div className="flex items-center gap-1">
                          {checkIsExpiring(product.nearest_expiry_date) && <AlertTriangle size={14} className="text-orange-500"/>}
                          <span className={checkIsExpiring(product.nearest_expiry_date) ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                            {product.nearest_expiry_date || 'N/A'}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {product.stock < product.min_stock && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 ml-2">
                          Thiếu hàng
                        </span>
                      )}
                      {checkIsExpiring(product.nearest_expiry_date) && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 ml-2">
                          Cận date
                        </span>
                      )}
                      {!(product.stock < product.min_stock) && !checkIsExpiring(product.nearest_expiry_date) && (
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