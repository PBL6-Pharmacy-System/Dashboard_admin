import { useState } from 'react';
import { 
  Search, X, Zap, Trash2, Check, Ban,
  ArrowDownLeft, ArrowUpRight, Calendar, User, AlertTriangle 
} from 'lucide-react';
import { useStockSlips } from '../hooks/useStockSlips';
import { useConfirm } from '../hooks/useConfirm';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../hooks/useToast';

const StockSlips = () => {
  const { 
    slips, inventoryList,
    isCreateOpen, setIsCreateOpen, modalType, newSlipItems, slipReason, setSlipReason,
    selectedBranchId, setSelectedBranchId, destinationBranchId, setDestinationBranchId, branches,
    filterBranchId, setFilterBranchId,
    isReceiveOpen, setIsReceiveOpen, receivingSlip,
    actions 
  } = useStockSlips();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const { success, error } = useToast();

  // ✅ State cho searchable dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Wrapped confirmReceipt with confirm dialog
  const handleConfirmReceipt = async () => {
    const confirmed = await confirm({
      title: 'Xác nhận nhập/xuất kho',
      message: 'Xác nhận nhập/xuất kho theo số lượng thực tế này?',
      type: 'info',
      confirmText: 'Xác nhận',
      cancelText: 'Hủy'
    });
    if (confirmed) {
      try {
        await actions.confirmReceipt();
        success('Xác nhận thành công!');
      } catch (err) {
        error(err instanceof Error ? err.message : 'Lỗi khi xác nhận');
      }
    }
  };

  // Wrapped saveSlip with toast
  const handleSaveSlip = async () => {
    try {
      await actions.saveSlip();
      success('Tạo phiếu thành công!');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Lỗi khi tạo phiếu');
    }
  };

  // Wrapped cancelSlip with confirm dialog and toast
  const handleCancelSlip = async (id: string) => {
    const confirmed = await confirm({
      title: 'Xác nhận hủy phiếu',
      message: 'Bạn có chắc chắn muốn hủy phiếu này?',
      type: 'warning',
      confirmText: 'Hủy phiếu',
      cancelText: 'Không'
    });
    if (confirmed) {
      try {
        await actions.cancelSlip(id);
        success('Đã hủy phiếu thành công!');
      } catch (err) {
        error(err instanceof Error ? err.message : 'Lỗi khi hủy phiếu');
      }
    }
  };

  // Wrapped deleteSlip with confirm dialog and toast
  const handleDeleteSlip = async (id: string) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa phiếu này khỏi danh sách?',
      type: 'danger',
      confirmText: 'Xóa',
      cancelText: 'Hủy'
    });
    if (confirmed) {
      try {
        await actions.deleteSlip(id);
        success('Đã xóa phiếu thành công!');
      } catch (err) {
        error(err instanceof Error ? err.message : 'Lỗi khi xóa phiếu');
      }
    }
  };

  // Helper: Render trạng thái
  const renderStatus = (status: string) => {
    switch (status) {
      case 'Completed': return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Đã hoàn tất</span>;
      case 'Pending': return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">Chờ nhập kho</span>;
      case 'Cancelled': return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold">Đã hủy</span>;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-gray-50/30 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Phiếu Nhập/Xuất</h1>
          <p className="text-sm text-gray-500">Theo dõi và kiểm soát dòng chảy hàng hóa.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => actions.openCreateModal('EXPORT')} className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 text-orange-700 rounded-lg text-sm font-bold hover:bg-orange-50">
            <ArrowUpRight size={18}/> Tạo phiếu Xuất
          </button>
          <button onClick={() => actions.openCreateModal('IMPORT')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">
            <ArrowDownLeft size={18}/> Tạo phiếu Nhập
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-bold text-gray-700">Lọc theo chi nhánh:</label>
          <select 
            value={filterBranchId || ''} 
            onChange={(e) => setFilterBranchId(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-blue-500"
          >
            <option value="">Tất cả chi nhánh</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-500">
            Hiển thị: <span className="font-bold text-gray-900">{slips.length}</span> phiếu
          </div>
        </div>
      </div>

      {/* LIST TABLE */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
             <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
               <tr>
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase">Mã phiếu</th>
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase">Loại</th>
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase">Chi nhánh</th>
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase">Thông tin</th>
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Tổng tiền</th>
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Trạng thái</th>
                 <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Hành động</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {slips.map(s => (
                 <tr key={s.id} className="hover:bg-gray-50 group">
                   <td className="p-4 font-bold text-blue-600 text-sm">{s.code}</td>
                   <td className="p-4">
                     {s.type === 'IMPORT' 
                       ? <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded inline-flex items-center gap-1"><ArrowDownLeft size={12}/> NHẬP</span>
                       : <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded inline-flex items-center gap-1"><ArrowUpRight size={12}/> XUẤT</span>
                     }
                   </td>
                   <td className="p-4">
                     <div className="text-sm font-medium text-gray-700">{s.branchName || 'N/A'}</div>
                   </td>
                   <td className="p-4">
                     <div className="text-sm font-medium text-gray-900">{s.reason}</div>
                     <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                       <span className="flex items-center gap-1"><Calendar size={12}/> {s.date}</span>
                       <span className="flex items-center gap-1"><User size={12}/> {s.creator}</span>
                     </div>
                   </td>
                   <td className="p-4 text-right font-bold text-sm">{s.totalAmount.toLocaleString()} đ</td>
                   <td className="p-4 text-center">{renderStatus(s.status)}</td>
                   
                   {/* ACTIONS COLUMN */}
                   <td className="p-4 text-right">
                     <div className="flex justify-end gap-2">
                        {/* Nút Xác nhận (Chỉ hiện khi Pending) */}
                        {s.status === 'Pending' && (
                          <>
                            <button onClick={() => actions.openReceiveModal(s)} className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-bold transition-colors shadow-sm" title="Kiểm hàng & Nhập kho">
                              <Check size={14} strokeWidth={3}/> Duyệt
                            </button>
                            <button onClick={() => handleCancelSlip(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Hủy bỏ">
                              <Ban size={16}/>
                            </button>
                          </>
                        )}
                        {/* Nút Xóa (Chỉ hiện khi đã Hủy/Hoàn tất) */}
                        {s.status !== 'Pending' && (
                           <button onClick={() => handleDeleteSlip(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Xóa lịch sử">
                             <Trash2 size={16}/>
                           </button>
                        )}
                     </div>
                   </td>
                 </tr>
               ))}
               {slips.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">Chưa có phiếu nào.</td></tr>}
             </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL 1: TẠO PHIẾU (PLANNING) --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className={`p-4 border-b flex justify-between items-center rounded-t-xl ${modalType === 'IMPORT' ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <h2 className={`text-xl font-bold ${modalType === 'IMPORT' ? 'text-blue-800' : 'text-orange-800'}`}>
                {modalType === 'IMPORT' ? 'Tạo Phiếu Nhập (Dự kiến)' : 'Tạo Phiếu Xuất'}
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 hover:bg-white/50 rounded-full"><X size={20}/></button>
            </div>

            <div className="p-4 border-b border-gray-100 flex flex-col gap-4 bg-white">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 block mb-1">
                    {modalType === 'IMPORT' ? 'Chi nhánh' : 'Chi nhánh nguồn'}
                  </label>
                  <select 
                    value={selectedBranchId || ''} 
                    onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-blue-500"
                  >
                    <option value="">-- Chọn chi nhánh --</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
                {modalType === 'EXPORT' && (
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 block mb-1">Chi nhánh đích</label>
                    <select 
                      value={destinationBranchId || ''} 
                      onChange={(e) => setDestinationBranchId(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-blue-500"
                    >
                      <option value="">-- Chọn chi nhánh đích --</option>
                      {branches.filter(b => b.id !== selectedBranchId).map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 block mb-1">Diễn giải</label>
                  <input type="text" value={slipReason} onChange={(e) => setSlipReason(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-blue-500" />
                </div>
                {modalType === 'IMPORT' && (
                  <button onClick={actions.autoFillLowStock} className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-lg font-bold text-sm hover:bg-yellow-200">
                    <Zap size={16} className="fill-yellow-800"/> Gợi ý hàng sắp hết
                  </button>
                )}
              </div>
              {/* ✅ Searchable Dropdown */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Tìm và thêm sản phẩm thủ công..."
                  className="w-full border border-gray-300 rounded pl-9 pr-4 py-2 text-sm focus:outline-blue-500 focus:border-blue-500"
                />
                
                {/* Dropdown menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop để đóng dropdown khi click ra ngoài */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => {
                        setShowDropdown(false);
                        setSearchQuery('');
                      }}
                    />
                    
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-auto z-20">
                      {(() => {
                        // ✅ Lọc sản phẩm: stock > min_stock và match search query
                        const filteredProducts = inventoryList.filter(p => {
                          const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
                          const hasStock = p.totalStock > p.minStock; // ✅ Điều kiện: tồn > min_stock
                          return matchSearch && hasStock;
                        });

                        if (filteredProducts.length === 0) {
                          return (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              {searchQuery 
                                ? 'Không tìm thấy sản phẩm nào có tồn kho > mức tối thiểu'
                                : 'Không có sản phẩm nào có tồn kho > mức tối thiểu'}
                            </div>
                          );
                        }

                        return filteredProducts.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              actions.addItemManual(p.id);
                              setSearchQuery('');
                              setShowDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-900">{p.name}</span>
                              <div className="flex gap-2 text-xs">
                                <span className="text-blue-600 font-semibold">
                                  Tồn: {p.totalStock}
                                </span>
                                <span className="text-gray-500">
                                  | Min: {p.minStock}
                                </span>
                              </div>
                            </div>
                          </button>
                        ));
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-gray-50">
               <table className="w-full text-left text-sm bg-white rounded-lg shadow-sm overflow-hidden">
                 <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-600">
                   <tr>
                     <th className="p-3">Sản phẩm</th>
                     <th className="p-3 text-center">Tồn kho</th>
                     <th className="p-3 text-center bg-blue-50 w-32">SL Dự kiến</th>
                     <th className="p-3 text-right">Đơn giá</th>
                     <th className="p-3 text-right">Thành tiền</th>
                     <th className="p-3 w-10"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {newSlipItems.map((item, idx) => (
                     <tr key={idx} className="hover:bg-gray-50">
                       <td className="p-3 font-bold text-gray-700">{item.productName}</td>
                       <td className="p-3 text-center text-gray-500">{item.currentStock}</td>
                       <td className="p-3 text-center bg-blue-50/30">
                         <input type="number" value={item.requestQuantity} onChange={(e) => actions.updateRequestQty(idx, Number(e.target.value))} className="w-20 text-center border border-blue-300 rounded py-1 font-bold text-blue-700 outline-none"/>
                       </td>
                       <td className="p-3 text-right">{item.unitPrice.toLocaleString()}</td>
                       <td className="p-3 text-right font-bold">{(item.requestQuantity * item.unitPrice).toLocaleString()}</td>
                       <td className="p-3 text-center"><button onClick={() => actions.removeItem(idx)}><Trash2 size={18} className="text-gray-300 hover:text-red-500"/></button></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>

            <div className="p-4 border-t bg-white flex justify-between rounded-b-xl">
               <div className="text-sm font-bold text-blue-600">Tổng tiền: {newSlipItems.reduce((sum, item) => sum + (item.requestQuantity * item.unitPrice), 0).toLocaleString()} đ</div>
               <div className="flex gap-2">
                  <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                  <button onClick={handleSaveSlip} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">Tạo phiếu</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: XÁC NHẬN THỰC TẾ (ACTUAL RECEIPT) --- */}
      {isReceiveOpen && receivingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="p-4 border-b bg-green-50 rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-green-800">Kiểm hàng & Xác nhận Nhập kho</h2>
                <p className="text-xs text-green-600">Phiếu: {receivingSlip.code} - Vui lòng kiểm đếm kỹ trước khi nhập vào hệ thống.</p>
              </div>
              <button onClick={() => setIsReceiveOpen(false)} className="p-1 hover:bg-white/50 rounded-full"><X size={20}/></button>
            </div>

            <div className="p-4 overflow-auto max-h-[60vh]">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-500">
                  <tr>
                    <th className="p-3">Sản phẩm</th>
                    <th className="p-3 text-center w-32">SL Đặt (Dự kiến)</th>
                    <th className="p-3 text-center w-32 bg-yellow-50 border-x border-yellow-100">SL Thực nhận</th>
                    <th className="p-3 text-center w-32">Chênh lệch</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {receivingSlip.items.map((item, idx) => {
                    const diff = item.actualQuantity - item.requestQuantity;
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">{item.productName}</td>
                        <td className="p-3 text-center text-gray-500">{item.requestQuantity}</td>
                        <td className="p-3 text-center bg-yellow-50/30 border-x border-yellow-100">
                          <input 
                            type="number" 
                            value={item.actualQuantity}
                            onChange={(e) => actions.updateActualQty(idx, Number(e.target.value))}
                            className="w-20 text-center font-bold text-blue-600 border border-gray-300 rounded py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </td>
                        <td className="p-3 text-center">
                          {diff !== 0 ? (
                            <span className={`text-xs font-bold flex items-center justify-center gap-1 ${diff < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {diff > 0 ? `+${diff}` : diff}
                              <AlertTriangle size={12}/>
                            </span>
                          ) : <span className="text-xs text-gray-400">Khớp</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button onClick={() => setIsReceiveOpen(false)} className="px-4 py-2 border rounded hover:bg-white">Để sau</button>
              <button 
                onClick={handleConfirmReceipt}
                className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow-md flex items-center gap-2"
              >
                <Check size={18}/> Xác nhận Nhập kho
              </button>
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

export default StockSlips;