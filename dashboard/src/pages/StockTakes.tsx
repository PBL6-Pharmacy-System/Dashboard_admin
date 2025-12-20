import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { stockTakeService, type StockTake } from '../services/stockTakeService';
import { branchService } from '../services/branchService';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import ConfirmDialog from '../components/ConfirmDialog';

const StockTakes = () => {
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const { confirm, confirmState, handleConfirm, handleCancel: handleConfirmCancel } = useConfirm();
  const [stockTakes, setStockTakes] = useState<StockTake[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadStockTakes();
  }, [selectedBranch, selectedStatus]);

  const loadBranches = async () => {
    try {
      const response = await branchService.getAllBranches({ active: true });
      console.log('Branch API response:', response);
      // Handle both response.data array or response.data.branches array
      let branchesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.branches || []);
      
      // Normalize branch data to ensure consistent field names
      branchesData = branchesData.map((branch: any) => ({
        ...branch,
        branch_name: branch.name || branch.branch_name || `Chi nhánh ${branch.id}`
      }));
      
      setBranches(branchesData);
    } catch (error) {
      console.error('Error loading branches:', error);
      setBranches([]); // Set empty array on error
    }
  };

  const loadStockTakes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedBranch) params.branchId = selectedBranch;
      if (selectedStatus) params.status = selectedStatus;
      
      console.log('🔄 Fetching stock takes with params:', params);
      const response = await stockTakeService.getAllStockTakes(params);
      console.log('✅ Stock takes response:', response);
      
      // Check if backend returned error
      if (response.success === false) {
        console.error('❌ Backend error:', response.error);
        showError(`Lỗi từ server: ${response.error || 'Không thể lấy danh sách kiểm kê'}`);
        setStockTakes([]);
        return;
      }
      
      console.log('📊 Response.data type:', typeof response.data);
      console.log('📊 Response.data:', response.data);
      console.log('📊 Is response.data an array?', Array.isArray(response.data));
      
      // Handle different response structures
      let stockTakesData = [];
      if (Array.isArray(response.data)) {
        stockTakesData = response.data;
      } else if (response.data && Array.isArray(response.data.stockTakes)) {
        stockTakesData = response.data.stockTakes;
      } else if (response.data && Array.isArray(response.data.data)) {
        stockTakesData = response.data.data;
      }
      
      console.log('📦 Final stockTakesData:', stockTakesData);
      setStockTakes(stockTakesData);
    } catch (error) {
      console.error('❌ Error loading stock takes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Xác nhận hoàn thành',
      message: 'Xác nhận hoàn thành kiểm kê? Hệ thống sẽ điều chỉnh tồn kho theo số thực tế.',
      type: 'warning',
      confirmText: 'Hoàn thành',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      try {
        await stockTakeService.completeStockTake(id);
        loadStockTakes();
      } catch (error) {
        console.error('Error completing stock take:', error);
      }
    }
  };

  const handleCancel = async (id: number) => {
    const reason = prompt('Nhập lý do hủy phiếu kiểm kê:');
    if (reason) {
      try {
        await stockTakeService.cancelStockTake(id, reason);
        loadStockTakes();
      } catch (error) {
        console.error('Error cancelling stock take:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kiểm kê kho</h1>
        <p className="text-gray-600 mt-1">Quản lý phiếu kiểm kê tồn kho</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả chi nhánh</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="in_progress">Đang kiểm kê</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            <button
              onClick={() => navigate('/dashboard/stock-takes/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Tạo phiếu kiểm kê
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mã phiếu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Chi nhánh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hoàn thành
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockTakes.map((stockTake) => (
                  <tr key={stockTake.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ClipboardList size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{stockTake.stock_take_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Branch #{stockTake.branch_id}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(stockTake.status)}`}>
                        {getStatusLabel(stockTake.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(stockTake.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {stockTake.completed_at 
                        ? new Date(stockTake.completed_at).toLocaleDateString('vi-VN')
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => window.location.href = `/dashboard/stock-takes/${stockTake.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {['pending', 'in_progress'].includes(stockTake.status) && (
                          <>
                            <button
                              onClick={() => handleComplete(stockTake.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Hoàn thành"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleCancel(stockTake.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Hủy"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {stockTakes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy phiếu kiểm kê nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        {...confirmState.options}
        onConfirm={handleConfirm}
        onCancel={handleConfirmCancel}
      />
    </div>
  );
};

export default StockTakes;
