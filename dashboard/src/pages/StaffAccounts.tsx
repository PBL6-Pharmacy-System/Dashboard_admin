import { Search, Plus, Edit2, Trash2, X, UserCheck } from 'lucide-react';
import { useStaffManagement } from '../hooks/useStaffManagement'; // Import Hook

const StaffAccounts = () => {
  // Lấy logic từ Hook ra dùng
  const { 
    staffList, 
    filteredStaff, 
    loading,
    filters, 
    setFilters, 
    isModalOpen, 
    setIsModalOpen, 
    formData, 
    setFormData, 
    editingStaff,
    saving,
    deleting,
    actions 
  } = useStaffManagement();

  // Hàm phụ trợ UI (Helper UI function) - Giữ lại đây vì nó liên quan trực tiếp đến hiển thị màu sắc
  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'MANAGER': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'STAFF': 
      case 'PHARMACIST': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhân viên</h1>
          <div className="flex gap-4 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <UserCheck size={16} className="text-green-600"/> 
              Hoạt động: <strong className="text-gray-800">{staffList.filter(s => s.users.is_active).length}</strong>
            </span>
          </div>
        </div>
        <button onClick={actions.openAddModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all font-medium">
          <Plus size={18} /> Thêm nhân viên
        </button>
      </div>

      {/* TOOLBAR - Đã dùng state từ Hook */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" placeholder="Tìm nhân viên..." 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <select 
            className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.role}
            onChange={(e) => setFilters({...filters, role: e.target.value})}
          >
            <option value="All">Tất cả chức vụ</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Quản lý</option>
            <option value="Pharmacist">Dược sĩ</option>
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
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Thông tin</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Chức vụ</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Chi nhánh</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Không tìm thấy nhân viên nào
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {staff.users.avatar_url ? (
                            <img src={staff.users.avatar_url} alt="" className="w-10 h-10 rounded-full border border-gray-200 object-cover"/>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200">
                              {getInitials(staff.users.full_name || staff.users.username)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900">{staff.users.full_name || staff.users.username}</div>
                            <div className="text-xs text-gray-500">{staff.users.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadge(staff.users.roles.role_name)}`}>
                          {staff.users.roles.role_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{staff.branches?.name || 'Chưa phân chi nhánh'}</td>
                      <td className="px-6 py-4">
                        {staff.users.is_active ? (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">Hoạt động</span>
                        ) : (
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">Đã khóa</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => actions.openEditModal(staff)} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            disabled={deleting}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => actions.deleteStaff(staff.id)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            disabled={deleting}
                          >
                            <Trash2 size={16} />
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
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">{editingStaff ? 'Chỉnh sửa' : 'Thêm mới'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-500" /></button>
            </div>
            <form onSubmit={actions.saveStaff} className="p-6 grid grid-cols-2 gap-4">
              {/* Các input form giữ nguyên nhưng value và onChange dùng formData và setFormData từ Hook */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Họ tên</label>
                <input required type="text" className="input-standard w-full border p-2 rounded" 
                  value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input required type="email" className="input-standard w-full border p-2 rounded" 
                  value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
               <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">SĐT</label>
                <input type="text" className="input-standard w-full border p-2 rounded" 
                  value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Vị trí</label>
                <input type="text" className="input-standard w-full border p-2 rounded" 
                  value={formData.position || ''} onChange={e => setFormData({...formData, position: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Phòng ban</label>
                <input type="text" className="input-standard w-full border p-2 rounded" 
                  value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">ID Chi nhánh</label>
                <input type="number" className="input-standard w-full border p-2 rounded" 
                  value={formData.branch_id || ''} onChange={e => setFormData({...formData, branch_id: Number(e.target.value)})} />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">ID Vai trò</label>
                <input type="number" className="input-standard w-full border p-2 rounded" 
                  value={formData.role_id || ''} onChange={e => setFormData({...formData, role_id: Number(e.target.value)})} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Trạng thái</label>
                <select className="w-full border p-2 rounded" 
                  value={formData.is_active ? 'true' : 'false'} 
                  onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}>
                  <option value="true">Hoạt động</option>
                  <option value="false">Đã khóa</option>
                </select>
              </div>
              {/* Footer Modal */}
              <div className="col-span-2 pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 border rounded hover:bg-gray-50" 
                  disabled={saving}>
                  Hủy
                </button>
                <button type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAccounts;