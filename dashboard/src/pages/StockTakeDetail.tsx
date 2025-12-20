import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ClipboardList, Package, Calendar, AlertCircle,
  CheckCircle, XCircle, Clock, AlertTriangle, Save, X
} from 'lucide-react';
import { stockTakeService, type StockTake, type StockTakeItem } from '../services/stockTakeService';

const StockTakeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stockTake, setStockTake] = useState<StockTake | null>(null);
  const [items, setItems] = useState<StockTakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (id) {
      loadStockTakeDetail(id);
    }
  }, [id]);

  const loadStockTakeDetail = async (stockTakeId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Load stock take info
      const stockTakeResponse = await stockTakeService.getStockTakeById(parseInt(stockTakeId));
      console.log('📦 Stock take detail response:', stockTakeResponse);
      
      if (stockTakeResponse.success && stockTakeResponse.data) {
        setStockTake(stockTakeResponse.data);
      } else {
        setError('Không tìm thấy phiếu kiểm kê');
      }

      // Load stock take items
      try {
        const itemsResponse = await stockTakeService.getStockTakeItems(parseInt(stockTakeId));
        console.log('📦 Stock take items response:', itemsResponse);
        
        if (itemsResponse.success && itemsResponse.data) {
          const itemsData = Array.isArray(itemsResponse.data) 
            ? itemsResponse.data 
            : itemsResponse.data.items || [];
          setItems(itemsData);
        }
      } catch (err) {
        console.error('Error loading items:', err);
      }
      
    } catch (err) {
      console.error('Error loading stock take detail:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin phiếu kiểm kê');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (itemId: number, actualQuantity: number) => {
    if (!stockTake) return;
    
    try {
      await stockTakeService.updateStockTakeItem(stockTake.id, itemId, {
        actual_quantity: actualQuantity
      });
      
      // Reload data
      loadStockTakeDetail(id!);
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Không thể cập nhật số lượng');
    }
  };

  const handleComplete = async () => {
    if (!stockTake) return;
    
    if (!confirm('Xác nhận hoàn thành kiểm kê? Hành động này không thể hoàn tác.')) {
      return;
    }
    
    try {
      await stockTakeService.completeStockTake(stockTake.id);
      loadStockTakeDetail(id!);
      alert('Đã hoàn thành kiểm kê');
    } catch (err) {
      console.error('Error completing stock take:', err);
      alert('Không thể hoàn thành kiểm kê');
    }
  };

  const handleCancel = async () => {
    if (!stockTake) return;
    
    const reason = prompt('Nhập lý do hủy:');
    if (!reason) return;
    
    try {
      await stockTakeService.cancelStockTake(stockTake.id, reason);
      loadStockTakeDetail(id!);
      alert('Đã hủy phiếu kiểm kê');
    } catch (err) {
      console.error('Error cancelling stock take:', err);
      alert('Không thể hủy phiếu kiểm kê');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Chờ xử lý',
      in_progress: 'Đang kiểm kê',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'in_progress': return <ClipboardList className="w-5 h-5" />;
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin phiếu kiểm kê...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stockTake) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <p className="text-red-700 font-bold text-lg mb-4">{error || 'Không tìm thấy phiếu kiểm kê'}</p>
            <button
              onClick={() => navigate('/dashboard/stock-takes')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalDifference = items.reduce((sum, item) => {
    const actualQty = item.actual_qty ?? item.actual_quantity;
    const expectedQty = item.system_qty ?? item.expected_quantity ?? 0;
    if (actualQty !== null && actualQty !== undefined) {
      return sum + (actualQty - expectedQty);
    }
    return sum;
  }, 0);

  const completedItems = items.filter(item => {
    const actualQty = item.actual_qty ?? item.actual_quantity;
    return actualQty !== null && actualQty !== undefined;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/stock-takes')}
              className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-md transition-all border-2 border-blue-200"
            >
              <ArrowLeft size={20} className="text-blue-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ClipboardList className="text-blue-600" size={32} />
                Phiếu kiểm kê #{stockTake.id}
              </h1>
              <p className="text-gray-500 mt-1">
                {stockTake.stock_take_number || `STK-${stockTake.id}`}
              </p>
            </div>
          </div>
          
          <div className={`px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-2 border-2 ${getStatusColor(stockTake.status)}`}>
            {getStatusIcon(stockTake.status)}
            {getStatusLabel(stockTake.status)}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Items */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="text-blue-600" />
                Thông tin phiếu kiểm kê
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <InfoItem 
                  label="Chi nhánh"
                  value={stockTake.branches?.branch_name || stockTake.branches?.name || `Branch #${stockTake.branch_id}`}
                />
                <InfoItem 
                  label="Ngày tạo"
                  value={new Date(stockTake.created_at).toLocaleString('vi-VN')}
                />
                <InfoItem 
                  label="Người tạo"
                  value={stockTake.users_stockTake_started_byTousers?.full_name || stockTake.users_stockTake_started_byTousers?.username || 'N/A'}
                />
                <InfoItem 
                  label="Cập nhật lần cuối"
                  value={new Date(stockTake.updated_at).toLocaleString('vi-VN')}
                />
              </div>

              {stockTake.notes && (
                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">Ghi chú:</p>
                  <p className="text-yellow-700">{stockTake.notes}</p>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="text-blue-600" />
                  Danh sách sản phẩm ({stockTake.stockTakeItem?.length || items.length})
                </h2>
                
                {stockTake.status === 'in_progress' && (
                  <button
                    onClick={() => setEditing(!editing)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      editing 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {editing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}
                  </button>
                )}
              </div>
              
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-bold text-gray-700">Sản phẩm</th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">Dự kiến</th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">Thực tế</th>
                      <th className="text-center py-4 px-6 text-sm font-bold text-gray-700">Chênh lệch</th>
                      <th className="text-right py-4 px-6 text-sm font-bold text-gray-700">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.length > 0 ? (
                      items.map((item: StockTakeItem) => {
                        const actualQty = item.actual_qty ?? item.actual_quantity;
                        const expectedQty = item.system_qty ?? item.expected_quantity ?? 0;
                        const difference = actualQty !== null && actualQty !== undefined
                          ? actualQty - expectedQty
                          : null;
                        
                        return (
                          <ItemRow
                            key={item.id}
                            item={item}
                            difference={difference}
                            editing={editing && stockTake.status === 'in_progress'}
                            onUpdate={handleUpdateItem}
                          />
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          Chưa có sản phẩm nào trong phiếu kiểm kê
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            
            {/* Progress */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <ClipboardList className="w-8 h-8" />
                <h3 className="text-xl font-bold">Tiến độ</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Đã kiểm</span>
                    <span>{completedItems} / {items.length}</span>
                  </div>
                  <div className="w-full bg-blue-400 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${items.length > 0 ? (completedItems / items.length * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-blue-400">
                  <p className="text-blue-100 text-sm mb-1">Tỷ lệ hoàn thành</p>
                  <p className="text-4xl font-bold">
                    {items.length > 0 ? Math.round((completedItems / items.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Difference Summary */}
            <div className={`rounded-2xl shadow-lg p-6 text-white ${
              totalDifference === 0 
                ? 'bg-gradient-to-br from-green-600 to-green-700'
                : totalDifference > 0
                ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                : 'bg-gradient-to-br from-orange-600 to-orange-700'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="text-xl font-bold">Chênh lệch</h3>
              </div>
              
              <div>
                <p className="text-white/80 text-sm mb-2">Tổng chênh lệch</p>
                <p className="text-4xl font-bold">
                  {totalDifference > 0 ? '+' : ''}{totalDifference}
                </p>
                <p className="text-sm mt-2 text-white/80">
                  {totalDifference === 0 
                    ? 'Khớp đúng'
                    : totalDifference > 0
                    ? 'Thừa hàng'
                    : 'Thiếu hàng'}
                </p>
              </div>
            </div>

            {/* Actions */}
            {stockTake.status !== 'completed' && stockTake.status !== 'cancelled' && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Hành động</h3>
                
                <div className="space-y-2">
                  {completedItems === items.length && items.length > 0 && (
                    <button
                      onClick={handleComplete}
                      className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-semibold transition-all border border-green-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Hoàn thành kiểm kê
                    </button>
                  )}
                  <button
                    onClick={handleCancel}
                    className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-semibold transition-all border border-red-200 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Hủy phiếu kiểm kê
                  </button>
                </div>
              </div>
            )}

            {/* Timestamp Info */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="text-blue-600" />
                Lịch sử
              </h3>
              
              <div className="space-y-3">
                <TimelineItem 
                  label="Tạo phiếu"
                  date={stockTake.created_at}
                />
                {stockTake.status !== 'pending' && (
                  <TimelineItem 
                    label="Cập nhật"
                    date={stockTake.updated_at}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
);

const ItemRow = ({ 
  item, 
  difference, 
  editing, 
  onUpdate 
}: { 
  item: StockTakeItem; 
  difference: number | null; 
  editing: boolean;
  onUpdate: (itemId: number, actualQuantity: number) => void;
}) => {
  const actualQty = item.actual_qty ?? item.actual_quantity;
  const expectedQty = item.system_qty ?? item.expected_quantity ?? 0;
  const [inputValue, setInputValue] = useState(actualQty?.toString() || '');

  const handleSave = () => {
    const qty = parseInt(inputValue);
    if (!isNaN(qty)) {
      onUpdate(item.id, qty);
    }
  };

  return (
    <tr className="hover:bg-blue-50 transition-colors">
      <td className="py-4 px-6">
        <div>
          <p className="font-semibold text-gray-900">
            {item.products?.name || `Product #${item.product_id}`}
          </p>
          <p className="text-sm text-gray-500">ID: {item.product_id}</p>
        </div>
      </td>
      <td className="py-4 px-6 text-center">
        <span className="font-bold text-gray-700">{expectedQty}</span>
      </td>
      <td className="py-4 px-6 text-center">
        {editing ? (
          <div className="flex items-center gap-2 justify-center">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
            />
            <button
              onClick={handleSave}
              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Save size={16} />
            </button>
          </div>
        ) : (
          <span className="font-bold text-blue-600">
            {actualQty ?? '-'}
          </span>
        )}
      </td>
      <td className="py-4 px-6 text-center">
        {difference !== null ? (
          <span className={`font-bold ${
            difference === 0 ? 'text-green-600' :
            difference > 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            {difference > 0 ? '+' : ''}{difference}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="py-4 px-6 text-right">
        {actualQty !== null && actualQty !== undefined ? (
          difference === 0 ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
              Khớp
            </span>
          ) : (
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold">
              Chênh lệch
            </span>
          )
        ) : (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold">
            Chưa kiểm
          </span>
        )}
      </td>
    </tr>
  );
};

const TimelineItem = ({ label, date }: { label: string; date: string }) => (
  <div className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
    <div className="flex-1">
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-sm text-gray-500">{new Date(date).toLocaleString('vi-VN')}</p>
    </div>
  </div>
);

export default StockTakeDetail;
