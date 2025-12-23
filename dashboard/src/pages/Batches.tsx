import { useState, useEffect } from 'react';
import { Package, Calendar, AlertTriangle, Trash2, Eye } from 'lucide-react';
import { batchService, type ProductBatch } from '../services/batchService';
import { branchService } from '../services/branchService';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import ConfirmDialog from '../components/ConfirmDialog';

const Batches = () => {
  const { error: showError } = useToast();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  // const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadBatches();
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

  const loadBatches = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedBranch) params.branch_id = selectedBranch;
      if (selectedStatus) params.status = selectedStatus;
      
      console.log('🔄 Fetching batches with params:', params);
      const response = await batchService.getAllBatches(params);
      console.log('✅ Batches response:', response);
      
      // Check if backend returned error
      if (response.success === false) {
        console.error('❌ Backend error:', response.error);
        showError(`Lỗi từ server: ${response.error || 'Không thể lấy danh sách lô hàng'}`);
        setBatches([]);
        return;
      }
      
      console.log('📊 Response.data type:', typeof response.data);
      console.log('📊 Is response.data an array?', Array.isArray(response.data));
      
      // Handle different response structures
      let batchesData = [];
      if (Array.isArray(response.data)) {
        batchesData = response.data;
      } else if (response.data && Array.isArray(response.data.batches)) {
        batchesData = response.data.batches;
      } else if (response.data && Array.isArray(response.data.data)) {
        batchesData = response.data.data;
      }
      
      console.log('📦 Final batchesData:', batchesData);
      setBatches(batchesData);
    } catch (error) {
      console.error('❌ Error loading batches:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể kết nối đến server';
      showError(`Lỗi: ${errorMessage}`);
      setBatches([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const handleExpire = async (id: number) => {
    const confirmed = await confirm({
      title: 'Xác nhận hết hạn',
      message: 'Đánh dấu lô hàng này đã hết hạn?',
      type: 'warning',
      confirmText: 'Xác nhận',
      cancelText: 'Hủy'
    });

    if (confirmed) {
      try {
        await batchService.markExpired(id);
        loadBatches();
      } catch (error) {
        console.error('Error marking batch as expired:', error);
      }
    }
  };

  const handleDispose = async (id: number) => {
    // TODO: Create a custom input dialog component for reason
    const reason = prompt('Nhập lý do tiêu hủy:');
    if (reason) {
      try {
        await batchService.disposeBatch(id, reason);
        loadBatches();
      } catch (error) {
        console.error('Error disposing batch:', error);
      }
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      setLoading(true);
      const response = await batchService.getBatchById(id);
      console.log('📦 Batch detail:', response);
      
      if (response.success && response.data) {
        setSelectedBatch(response.data);
        setShowDetailModal(true);
      } else {
        showError('Không thể tải thông tin chi tiết lô hàng');
      }
    } catch (error) {
      console.error('Error loading batch detail:', error);
      showError('Lỗi khi tải chi tiết lô hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      disposed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Sẵn có',
      reserved: 'Đã đặt',
      expired: 'Hết hạn',
      disposed: 'Đã tiêu hủy'
    };
    return labels[status] || status;
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days <= 30 && days > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Lô hàng</h1>
        <p className="text-gray-600 mt-1">Theo dõi và quản lý các lô hàng trong kho</p>
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
                <option value="available">Sẵn có</option>
                <option value="reserved">Đã đặt</option>
                <option value="expired">Hết hạn</option>
                <option value="disposed">Đã tiêu hủy</option>
              </select>
            </div>
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
                    Mã lô
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Chi nhánh
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Sẵn có
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    NSX/HSD
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batches.map((batch) => (
                  <tr 
                    key={batch.id} 
                    className={`hover:bg-gray-50 ${
                      isExpired(batch.expiry_date) ? 'bg-red-50' : 
                      isExpiringSoon(batch.expiry_date) ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{batch.batch_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Branch #{batch.branch_id}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {batch.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-green-600 font-medium">
                      {batch.available_quantity}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          NSX: {batch.manufacturing_date ? new Date(batch.manufacturing_date).toLocaleDateString('vi-VN') : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar size={14} />
                          HSD: {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString('vi-VN') : 'N/A'}
                          {isExpiringSoon(batch.expiry_date) && (
                            <AlertTriangle size={14} className="text-yellow-600 ml-1" />
                          )}
                          {isExpired(batch.expiry_date) && (
                            <AlertTriangle size={14} className="text-red-600 ml-1" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(batch.status)}`}>
                        {getStatusLabel(batch.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {batch.status === 'available' && isExpired(batch.expiry_date) && (
                          <button
                            onClick={() => handleExpire(batch.id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                            title="Đánh dấu hết hạn"
                          >
                            <AlertTriangle size={18} />
                          </button>
                        )}
                        {batch.status === 'expired' && (
                          <button
                            onClick={() => handleDispose(batch.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Tiêu hủy"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetail(batch.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {batches.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Không tìm thấy lô hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBatch && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Chi tiết Lô hàng</h2>
                  <p className="text-gray-600 mt-1">Mã lô: {selectedBatch.batch_number}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Thông tin sản phẩm */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Thông tin sản phẩm</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tên sản phẩm</p>
                      <p className="font-medium">{selectedBatch.products?.name || selectedBatch.products?.product_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Đơn vị tính</p>
                      <p className="font-medium">{selectedBatch.products?.unit_of_measure || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Thông tin lô hàng */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Thông tin lô hàng</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Mã lô</p>
                      <p className="font-medium">{selectedBatch.batch_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Chi nhánh</p>
                      <p className="font-medium">{selectedBatch.branches?.name || selectedBatch.branches?.branch_name || `Branch #${selectedBatch.branch_id}`}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(selectedBatch.status)}`}>
                        {getStatusLabel(selectedBatch.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Giá nhập</p>
                      <p className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedBatch.cost_price || 0)}</p>
                    </div>
                  </div>
                </div>

                {/* Số lượng */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Số lượng</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded">
                      <p className="text-sm text-gray-600">Tổng số lượng</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedBatch.quantity}</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="text-sm text-gray-600">Đã đặt trước</p>
                      <p className="text-2xl font-bold text-yellow-600">{selectedBatch.reserved_quantity || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="text-sm text-gray-600">Sẵn có</p>
                      <p className="text-2xl font-bold text-green-600">{selectedBatch.available_quantity}</p>
                    </div>
                  </div>
                </div>

                {/* Ngày tháng */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Ngày sản xuất & Hạn sử dụng</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Ngày sản xuất</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar size={16} />
                        {selectedBatch.manufacturing_date ? new Date(selectedBatch.manufacturing_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hạn sử dụng</p>
                      <p className={`font-medium flex items-center gap-2 ${
                        isExpired(selectedBatch.expiry_date) ? 'text-red-600' : 
                        isExpiringSoon(selectedBatch.expiry_date) ? 'text-yellow-600' : ''
                      }`}>
                        <Calendar size={16} />
                        {selectedBatch.expiry_date ? new Date(selectedBatch.expiry_date).toLocaleDateString('vi-VN') : 'N/A'}
                        {isExpired(selectedBatch.expiry_date) && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Đã hết hạn</span>
                        )}
                        {isExpiringSoon(selectedBatch.expiry_date) && !isExpired(selectedBatch.expiry_date) && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Sắp hết hạn</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Thông tin hệ thống</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Ngày tạo</p>
                      <p className="font-medium">{new Date(selectedBatch.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cập nhật lần cuối</p>
                      <p className="font-medium">{new Date(selectedBatch.updated_at).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        {...confirmState.options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Batches;
