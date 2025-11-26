import { 
  ArrowRight, Check, X, Split, Package, 
  Calendar, User, AlertOctagon 
} from 'lucide-react';
import { useStockTransfer } from '../hooks/useStockTransfer';

const StockTransfer = () => {
  const { requests, selectedRequest, isDetailOpen, actions } = useStockTransfer();

  // Kiểm tra xem phiếu đang xem có bị thiếu hàng không
  const hasShortage = selectedRequest?.items.some(i => Number(i.missingQty) > 0);

  return (
    <div className="h-full flex flex-col gap-4 p-4 bg-gray-50/30 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Điều chuyển kho (Inter-branch)</h1>
          <p className="text-sm text-gray-500">Xử lý yêu cầu nhập hàng từ các chi nhánh khác.</p>
        </div>
      </div>

      {/* DANH SÁCH YÊU CẦU (Mục 2: Kho B nhìn thấy list request) */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b sticky top-0">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Mã phiếu</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Từ kho</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Đến kho</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Thông tin</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Trạng thái</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-blue-600">{req.code}</td>
                <td className="p-4 font-medium">{req.sourceBranch}</td>
                <td className="p-4 text-gray-500 flex items-center gap-2">
                  <ArrowRight size={14}/> {req.targetBranch}
                </td>
                <td className="p-4 text-xs text-gray-500">
                  <div><Calendar size={12} className="inline mr-1"/> {req.createdDate}</div>
                  <div><User size={12} className="inline mr-1"/> {req.createdBy}</div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    req.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {req.status === 'Pending' ? 'Chờ xử lý' : req.status === 'Approved' ? 'Đã duyệt' : 'Đã hủy'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {req.status === 'Pending' && (
                    <button 
                      onClick={() => actions.openRequestDetail(req)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm"
                    >
                      Xử lý
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL CHI TIẾT XỬ LÝ (Mục 3, 4, 5) --- */}
      {isDetailOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b bg-gray-50 rounded-t-xl flex justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Xử lý Yêu cầu: {selectedRequest.code}</h2>
                <p className="text-xs text-gray-500">Yêu cầu từ: <strong>{selectedRequest.sourceBranch}</strong></p>
              </div>
              <button onClick={actions.closeDetail} className="hover:bg-gray-200 p-1 rounded-full"><X size={20}/></button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4 space-y-6">
              
              {/* Lặp qua từng sản phẩm (Mục 3: Giao diện minh họa như ảnh) */}
              {selectedRequest.items.map((item) => (
                <div key={item.id} className="border border-gray-300 rounded-lg overflow-hidden">
                  {/* Header Sản phẩm */}
                  <div className="bg-gray-100 p-3 flex justify-between items-center border-b border-gray-300">
                    <div className="font-bold text-gray-800 flex items-center gap-2">
                      <Package size={18}/> {item.name}
                    </div>
                    <div className="text-sm">
                      Số lượng cần lấy: <strong className="text-blue-600 text-lg">{item.requestedQty}</strong>
                    </div>
                  </div>

                  {/* Bảng Lô (Batch Table) */}
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="p-2 pl-4">Lô hàng</th>
                        <th className="p-2">Vị trí</th>
                        <th className="p-2">HSD</th>
                        <th className="p-2 text-center">SL Lấy được (Transferable)</th>
                        <th className="p-2 text-right pr-4">SL Dự kiến lấy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {/* Danh sách các lô có hàng */}
                      {item.batches.length > 0 ? (
                        item.batches.map((batch) => {
                          // Tìm xem lô này được hệ thống auto-allocate bao nhiêu
                          const allocated = item.allocationDetails.find(a => a.batchId === batch.id)?.takeQty || 0;
                          return (
                            <tr key={batch.id}>
                              <td className="p-2 pl-4 font-medium">{batch.batchCode}</td>
                              <td className="p-2 text-gray-500">{batch.location}</td>
                              <td className="p-2 text-gray-500">{batch.expiryDate}</td>
                              <td className="p-2 text-center font-medium text-gray-700">
                                {'transferable' in batch && typeof batch.transferable === 'number' ? batch.transferable : 0}
                              </td>
                              <td className="p-2 text-right pr-4 font-bold text-blue-600">
                                {allocated}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-red-500 italic">
                            Không có lô hàng khả dụng trong kho.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* Cảnh báo Thiếu hàng (Mục 3 cuối: Hiện cảnh báo) */}
              {hasShortage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
                  <AlertOctagon className="text-red-600 shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h4 className="font-bold text-red-800 mb-1">Cảnh báo thiếu hàng</h4>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                      {selectedRequest.items.filter(i => i.missingQty > 0).map(i => (
                        <li key={i.id}>
                          <strong>{i.name}:</strong> 
                          {i.allocatedQty === 0 
                            ? " Không có hàng (Hết hàng)." 
                            : ` Đã lấy ${i.allocatedQty}, nhưng còn thiếu ${i.missingQty}.`
                          }
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer (Mục 4, 5: Các nút hành động) */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button onClick={actions.rejectRequest} className="px-4 py-2 text-red-600 font-bold hover:bg-red-100 rounded-lg border border-transparent hover:border-red-200 transition-all">
                Hủy bỏ yêu cầu
              </button>

              {/* Logic hiển thị nút dựa trên việc có thiếu hàng hay không */}
              {hasShortage ? (
                <button 
                  onClick={actions.splitAndApprove}
                  className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 shadow-md transition-all"
                >
                  <Split size={18} /> Tách Phiếu & Duyệt phần có
                </button>
              ) : (
                <button 
                  onClick={actions.approveFull}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all"
                >
                  <Check size={18} /> Xác nhận Xuất kho (Đủ hàng)
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StockTransfer;