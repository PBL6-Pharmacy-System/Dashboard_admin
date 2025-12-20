import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { branchService } from '../services/branchService';
import { stockTakeService } from '../services/stockTakeService';
import { useToast } from '../hooks/useToast';

type Branch = {
  id: number;
  branch_name?: string;
  name?: string;
};
const CreateStockTake = () => {
  const navigate = useNavigate();
  const { success, error: showError, warning } = useToast();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    branch_id: '',
    notes: ''
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const response = await branchService.getAllBranches({ active: true });
      const branchesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.branches || []);
      setBranches(branchesData);
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.branch_id) {
      warning('Vui lòng chọn chi nhánh');
      return;
    }

    try {
      setLoading(true);
      const response = await stockTakeService.createStockTake({
        branch_id: parseInt(formData.branch_id),
        notes: formData.notes
      });
      
      console.log('Stock take created:', response);
      success('Tạo phiếu kiểm kê thành công!');
      navigate('/dashboard/stock-takes');
    } catch (error) {
      console.error('Error creating stock take:', error);
      showError('Lỗi khi tạo phiếu: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/dashboard/stock-takes')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo phiếu kiểm kê</h1>
          <p className="text-gray-600">Tạo đợt kiểm kê tồn kho mới</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chi nhánh <span className="text-red-500">*</span>
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
            <p className="mt-1 text-sm text-gray-500">
              Hệ thống sẽ tự động tạo danh sách tất cả sản phẩm tại chi nhánh này để kiểm kê
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Nhập ghi chú cho đợt kiểm kê (VD: Kiểm kê cuối tháng 12/2025)..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Lưu ý khi kiểm kê:</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Sau khi tạo phiếu, bạn cần nhập số lượng thực tế cho từng sản phẩm</li>
              <li>Hệ thống sẽ tự động so sánh với số lượng trong hệ thống</li>
              <li>Khi hoàn thành, tồn kho sẽ được điều chỉnh theo số thực tế</li>
              <li>Phiếu có thể hủy nếu chưa hoàn thành</li>
            </ul>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/dashboard/stock-takes')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Tạo phiếu kiểm kê'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateStockTake;
