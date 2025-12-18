import { useState, useEffect } from 'react';
import { Package, Calendar, AlertTriangle, Trash2, Eye } from 'lucide-react';
import { batchService, type ProductBatch } from '../services/batchService';
import { branchService } from '../services/branchService';

const Batches = () => {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
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
      if (selectedBranch) params.branchId = selectedBranch;
      if (selectedStatus) params.status = selectedStatus;
      
      console.log('🔄 Fetching batches with params:', params);
      const response = await batchService.getAllBatches(params);
      console.log('✅ Batches response:', response);
      
      // Check if backend returned error
      if (response.success === false) {
        console.error('❌ Backend error:', response.error);
        alert(`Lỗi từ server: ${response.error || 'Không thể lấy danh sách lô hàng'}`);
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
      alert(`Lỗi: ${errorMessage}`);
      setBatches([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const handleExpire = async (id: number) => {
    if (confirm('Đánh dấu lô hàng này đã hết hạn?')) {
      try {
        await batchService.markExpired(id);
        loadBatches();
      } catch (error) {
        console.error('Error marking batch as expired:', error);
      }
    }
  };

  const handleDispose = async (id: number) => {
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
    </div>
  );
};

export default Batches;
