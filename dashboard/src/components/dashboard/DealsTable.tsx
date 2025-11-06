import { ChevronDown } from 'lucide-react';
import type { DealData } from '../../types/dashboard.types';

const dealsData: DealData[] = [
  {
    id: '1',
    productName: 'Apple Watch',
    productImage: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=100&h=100&fit=crop',
    location: '6096 Marjolaine Landing',
    dateTime: '12.09.2019 - 12:53 PM',
    piece: 423,
    amount: 34295,
    status: 'Delivered',
  },
];

const DealsTable = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm';
      case 'Pending':
        return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-sm';
      case 'Cancelled':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm';
    }
  };

  return (
    <div className="relative h-full bg-gradient-to-br from-white to-purple-50/20 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 p-4 lg:p-6 border border-gray-100 overflow-hidden animate-slide-up flex flex-col">
      {/* Decorative background */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-100 via-pink-50 to-transparent rounded-full -ml-32 -mb-32 opacity-30"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Deals Details
            </h2>
            <p className="text-xs text-gray-500 mt-1">Recent transactions overview</p>
          </div>
          <button className="group flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-200 shadow-sm hover:shadow w-full sm:w-auto">
            <span>October</span>
            <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white custom-scrollbar min-h-0">
          <div className="h-full overflow-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 sticky top-0">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Product
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {dealsData.map((deal) => (
                  <tr 
                    key={deal.id} 
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 transition-all duration-200 group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-[150px]">
                        <div className="relative">
                          <img
                            src={deal.productImage}
                            alt={deal.productName}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow ring-2 ring-gray-100"
                          />
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent to-white/20"></div>
                        </div>
                        <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                          {deal.productName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600 text-xs font-medium">{deal.location}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600 text-xs font-medium whitespace-nowrap">{deal.dateTime}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900 font-bold text-sm whitespace-nowrap">
                        ${deal.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(deal.status)}`}>
                        {deal.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealsTable;