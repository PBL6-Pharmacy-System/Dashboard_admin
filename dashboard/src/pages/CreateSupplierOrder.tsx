import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Search, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { branchService } from '../services/branchService';
import { productService } from '../services/productService';
import { supplierOrderService } from '../services/supplierOrderService';
import { api } from '../services/api';

type Branch = {
  id: number;
  branch_name?: string;
  name?: string;
};

type Supplier = {
  id: number;
  name?: string;
};

type Product = {
  id: number;
  name?: string | null;
  price?: number | string | null;
  image_url?: string | null;
};

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_cost: number;
  manufacturing_date?: string;
  expiry_date?: string;
}

const CreateSupplierOrder = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    supplier_id: '',
    branch_id: '',
    notes: '',
    expected_delivery_date: ''
  });
  
  const [items, setItems] = useState<OrderItem[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load branches
      const branchRes = await branchService.getAllBranches({ active: true });
      const branchesData = Array.isArray(branchRes.data) 
        ? branchRes.data 
        : (branchRes.data?.branches || []);
      setBranches(branchesData);

      // Load suppliers
      try {
        const supplierRes = await api.get('/suppliers');
        const suppliersData = Array.isArray(supplierRes.data) 
          ? supplierRes.data 
          : (supplierRes.data?.suppliers || supplierRes || []);
        setSuppliers(suppliersData);
      } catch (e) {
        console.error('Error loading suppliers:', e);
        setSuppliers([]);
      }

      // Load products
      const productRes = await productService.getAllProducts(1, 100);
      setProducts(productRes.products || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddProduct = (product: Product) => {
    if (items.find(item => item.product_id === product.id)) {
      alert('Sản phẩm đã có trong danh sách');
      return;
    }
    
    setItems([...items, {
      product_id: product.id,
      product_name: product.name || '',
      quantity: 1,
      unit_cost: Number(product.price) || 0
    }]);
    setShowProductModal(false);
  };

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter(item => item.product_id !== productId));
  };

  const handleItemChange = (productId: number, field: string, value: string | number) => {
    setItems(items.map(item => 
      item.product_id === productId ? { ...item, [field]: value } : item
    ));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplier_id || !formData.branch_id) {
      alert('Vui lòng chọn nhà cung cấp và chi nhánh');
      return;
    }
    
    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm');
      return;
    }

    try {
      setLoading(true);
      
      const totalAmount = calculateTotal();
      console.log('📦 Creating supplier order with total:', totalAmount);
      
      if (isNaN(totalAmount) || totalAmount <= 0) {
        alert('❌ Tổng tiền không hợp lệ. Vui lòng kiểm tra số lượng và giá!');
        return;
      }
      
      await supplierOrderService.createOrder({
        supplier_id: parseInt(formData.supplier_id),
        branch_id: parseInt(formData.branch_id),
        notes: formData.notes,
        total_amount: totalAmount,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          manufacturing_date: item.manufacturing_date,
          expiry_date: item.expiry_date
        }))
      });
      
      alert('✅ Tạo đơn đặt hàng thành công!');
      navigate('/dashboard/supplier-orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('❌ Lỗi khi tạo đơn: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/dashboard/supplier-orders')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo đơn đặt hàng NCC</h1>
          <p className="text-gray-600">Đặt hàng từ nhà cung cấp</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map((supplier: Supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chi nhánh nhận hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày giao dự kiến
              </label>
              <input
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ghi chú cho đơn hàng..."
              />
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Chi tiết đơn hàng</h2>
            <button
              type="button"
              onClick={() => setShowProductModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Thêm sản phẩm
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>Chưa có sản phẩm nào</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">NSX</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">HSD</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                    <th className="px-4 py-3"></th>
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
                          onChange={(e) => handleItemChange(item.product_id, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-20 mx-auto block px-2 py-1 border rounded text-center"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={item.unit_cost}
                          onChange={(e) => handleItemChange(item.product_id, 'unit_cost', parseFloat(e.target.value) || 0)}
                          className="w-28 mx-auto block px-2 py-1 border rounded text-right"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={item.manufacturing_date || ''}
                          onChange={(e) => handleItemChange(item.product_id, 'manufacturing_date', e.target.value)}
                          className="w-36 mx-auto block px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={item.expiry_date || ''}
                          onChange={(e) => handleItemChange(item.product_id, 'expiry_date', e.target.value)}
                          className="w-36 mx-auto block px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(item.quantity * item.unit_cost)}đ
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
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-right font-semibold">Tổng cộng:</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600 text-lg">
                      {formatCurrency(calculateTotal())}đ
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/supplier-orders')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Tạo đơn đặt hàng'}
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
              <div className="space-y-2">
                {filteredProducts.map(product => (
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
                        {formatCurrency(Number(product.price) || 0)}đ
                      </p>
                    </div>
                    <Plus size={20} className="text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSupplierOrder;
