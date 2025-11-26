import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { DrugItem } from '../../types/dashboard.types';

const expiryData: DrugItem[] = [
  { id: '1', productName: 'Panadol Extra', productImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=50&q=80', batchNo: 'L-2309', expiryDate: '15/12/2025', daysLeft: 25, stock: 450, unit: 'Hộp', status: 'Critical' },
  { id: '2', productName: 'Berberin 100mg', productImage: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=50&q=80', batchNo: 'L-2401', expiryDate: '20/02/2026', daysLeft: 89, stock: 120, unit: 'Lọ', status: 'Warning' },
  { id: '3', productName: 'Vitamin C 500', productImage: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=50&q=80', batchNo: 'L-2410', expiryDate: '10/10/2026', daysLeft: 365, stock: 50, unit: 'Vỉ', status: 'Good' },
];

const ExpiryTable = () => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-100';
      case 'Warning': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-white to-red-50/30">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          <h2 className="font-bold text-gray-900">Cảnh báo Date</h2>
        </div>
        <button className="text-xs font-semibold text-blue-600 flex items-center hover:underline">
          Xem hết <ChevronRight size={14}/>
        </button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Thuốc</th>
              <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Hạn dùng</th>
              <th className="p-3 text-xs font-semibold text-gray-500 uppercase text-right">Tồn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {expiryData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={item.productImage} alt="" className="w-8 h-8 rounded object-cover border border-gray-100"/>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      <div className="text-[10px] text-gray-400">{item.batchNo}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-600 font-medium">{item.expiryDate}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border mt-0.5 font-semibold ${getStatusStyle(item.status)}`}>
                      Còn {item.daysLeft} ngày
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <span className="text-sm font-bold text-gray-900">{item.stock}</span>
                  <span className="text-[10px] text-gray-500 ml-1">{item.unit}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpiryTable;