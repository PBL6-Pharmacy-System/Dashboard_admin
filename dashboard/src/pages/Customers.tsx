import { Search, Edit2, X, Users } from 'lucide-react';
import { useCustomerManagement } from '../hooks/useCustomerManagement';

const Customers = () => {
  const { 
    customers, 
    loading,
    currentPage,
    totalPages,
    totalCustomers,
    searchQuery, 
    setSearchQuery, 
    statusFilter, 
    setStatusFilter,
    isModalOpen, 
    setIsModalOpen, 
    formData, 
    setFormData, 
    editingCustomer,
    saving,
    actions 
  } = useCustomerManagement();

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-gray-50/30 overflow-y-auto relative">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Khách hàng</h1>
          <div className="flex gap-4 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Users size={16} className="text-blue-600"/> 
              Tổng số: <strong className="text-gray-800">{totalCustomers}</strong>
            </span>
            <span className="flex items-center gap-1">
              Hoạt động: <strong className="text-green-600">{customers.filter(c => c.users.is_active).length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, email, SĐT..." 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive')}
        >
          <option value="All">Tất cả trạng thái</option>
          <option value="Active">Hoạt động</option>
          <option value="Inactive">Đã khóa</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Số điện thoại</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Địa chỉ</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ngày đăng ký</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Không tìm thấy khách hàng nào
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {customer.users.avatar_url ? (
                            <img 
                              src={customer.users.avatar_url} 
                              alt="" 
                              className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200">
                              {getInitials(customer.users.full_name || customer.users.username)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900">
                              {customer.users.full_name || customer.users.username}
                            </div>
                            <div className="text-xs text-gray-500">ID: {customer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.users.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.users.phone || <span className="text-gray-400">Chưa có</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.address ? (
                          <div className="max-w-xs truncate">{customer.address}</div>
                        ) : (
                          <span className="text-gray-400">Chưa cập nhật</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(customer.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(customer.users.is_active)}`}>
                          {customer.users.is_active ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => actions.openEditModal(customer)} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {!searchQuery && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4 border-t border-gray-200">
            <button
              onClick={() => actions.handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-200'
              }`}
            >
              ← Trước
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => actions.handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => actions.handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-200'
              }`}
            >
              Tiếp →
            </button>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Chỉnh sửa thông tin khách hàng</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={actions.saveCustomer} className="p-6 grid grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Họ và tên</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.full_name || ''} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                />
              </div>

              {/* Email */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.email || ''} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              {/* Phone */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Số điện thoại</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.phone || ''} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>

              {/* Date of Birth */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Ngày sinh</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.dob || ''} 
                  onChange={e => setFormData({...formData, dob: e.target.value})} 
                />
              </div>

              {/* Gender */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Giới tính</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.gender || ''} 
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              {/* Address */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Địa chỉ</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.address || ''} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                />
              </div>

              {/* City */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Thành phố</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.city || ''} 
                  onChange={e => setFormData({...formData, city: e.target.value})} 
                />
              </div>

              {/* Status */}
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Trạng thái</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={formData.is_active ? 'active' : 'inactive'} 
                  onChange={e => setFormData({...formData, is_active: e.target.value === 'active'})}
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Đã khóa</option>
                </select>
              </div>

              {/* Footer Modal */}
              <div className="col-span-2 pt-4 flex justify-end gap-3 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={saving}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-400"
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
