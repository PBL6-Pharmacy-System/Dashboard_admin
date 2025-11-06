import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, RotateCcw } from 'lucide-react';

interface Order {
  id: string;
  name: string;
  address: string;
  date: string;
  type: string;
  status: 'Completed' | 'Processing' | 'Rejected' | 'On Hold' | 'In Transit';
}

// Mock data
const mockOrders: Order[] = [
  { id: '00001', name: 'Christine Brooks', address: '089 Kutch Green Apt. 448', date: '04 Sep 2019', type: 'Electronics', status: 'Completed' },
  { id: '00002', name: 'Rosie Pearson', address: '979 Immanuel Ferry Suite 526', date: '28 May 2019', type: 'Book & Stationary', status: 'Processing' },
  { id: '00003', name: 'Darrell Caldwell', address: '8587 Frida Ports', date: '23 Nov 2019', type: 'Health & Medicine', status: 'Rejected' },
  { id: '00004', name: 'Gilbert Johnston', address: '768 Destiny Lake Suite 600', date: '05 Feb 2019', type: 'Mobile & Phone', status: 'Completed' },
  { id: '00005', name: 'Alan Cain', address: '042 Mylene Throughway', date: '29 Jul 2019', type: 'Accessories', status: 'Processing' },
  { id: '00006', name: 'Alfred Murray', address: '543 Weimann Mountain', date: '15 Aug 2019', type: 'Health & Medicine', status: 'Completed' },
  { id: '00007', name: 'Maggie Sullivan', address: 'New Scottieberg', date: '21 Dec 2019', type: 'Accessories', status: 'Processing' },
  { id: '00008', name: 'Rosie Todd', address: 'New Jon', date: '30 Apr 2019', type: 'Health & Medicine', status: 'On Hold' },
  { id: '00009', name: 'Dollie Hines', address: '124 Lyla Forge Suite 975', date: '09 Jan 2019', type: 'Book & Stationary', status: 'In Transit' },
];

const orderTypes = [
  'Health & Medicine',
  'Book & Stationary', 
  'Services & Industry',
  'Fashion & Beauty',
  'Home & Living',
  'Electronics',
  'Mobile & Phone',
  'Accessories'
];

const orderStatuses = [
  'Completed',
  'Processing',
  'Rejected',
  'On Hold',
  'In Transit'
];

const OrderList: React.FC = () => {
  const [orders] = useState<Order[]>(mockOrders);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2019, 1)); // February 2019
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const getStatusColor = (status: string) => {
    const colors = {
      'Completed': 'bg-teal-100 text-teal-600',
      'Processing': 'bg-purple-100 text-purple-600',
      'Rejected': 'bg-red-100 text-red-600',
      'On Hold': 'bg-orange-100 text-orange-600',
      'In Transit': 'bg-pink-100 text-pink-600'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const resetFilters = () => {
    setSelectedDates([]);
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setCurrentPage(1);
  };

  // Filter logic
  const filteredOrders = orders.filter(order => {
    // Filter by date
    if (selectedDates.length > 0) {
      const orderDate = order.date;
      if (!selectedDates.includes(orderDate)) {
        return false;
      }
    }

    // Filter by type
    if (selectedTypes.length > 0) {
      if (!selectedTypes.includes(order.type)) {
        return false;
      }
    }

    // Filter by status
    if (selectedStatuses.length > 0) {
      if (!selectedStatuses.includes(order.status)) {
        return false;
      }
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const selectDate = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Format to match mock data: "05 Feb 2019"
    const formattedDate = selected.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).replace(/,/g, '');
    
    // Toggle date selection (allow multiple dates)
    setSelectedDates(prev => 
      prev.includes(formattedDate)
        ? prev.filter(d => d !== formattedDate)
        : [...prev, formattedDate]
    );
  };

  const applyDateFilter = () => {
    setShowDatePicker(false);
    setCurrentPage(1);
  };

  const isDateSelected = (day: number): boolean => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Format to match mock data: "05 Feb 2019"
    const formattedDate = checkDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).replace(/,/g, '');
    return selectedDates.includes(formattedDate);
  };

  const applyTypeFilter = () => {
    setShowTypePicker(false);
    setCurrentPage(1);
  };

  const applyStatusFilter = () => {
    setShowStatusPicker(false);
    setCurrentPage(1);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Previous month's days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
      const day = prevMonth.getDate() - startingDayOfWeek + i + 1;
      days.push(
        <button
          key={`prev-${i}`}
          className="w-10 h-10 text-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {day}
        </button>
      );
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isDateSelected(day);
      days.push(
        <button
          key={day}
          onClick={() => selectDate(day)}
          className={`w-10 h-10 rounded-lg transition-colors ${
            isSelected
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Lists</h1>
      </div>

      {/* Filters Bar */}
      <div className="flex-shrink-0 flex items-center gap-3 mb-6 flex-wrap">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Filter className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Filter By</span>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              setShowTypePicker(false);
              setShowStatusPicker(false);
            }}
            className={`px-4 py-2 bg-white border rounded-lg transition-colors flex items-center gap-2 text-sm ${
              selectedDates.length > 0 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className={selectedDates.length > 0 ? 'text-blue-700 font-medium' : 'text-gray-700'}>
              {selectedDates.length > 0 ? `Date (${selectedDates.length})` : 'Date'}
            </span>
            <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90" />
          </button>

          {showDatePicker && (
            <div className="absolute top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 w-80">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={previousMonth}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="font-semibold text-gray-800">
                  {formatMonthYear(currentMonth)}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="w-10 h-10 flex items-center justify-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>

              <p className="text-xs text-gray-500 mt-4 mb-3">
                *You can choose multiple date
                {selectedDates.length > 0 && (
                  <span className="ml-2 font-semibold text-blue-600">
                    ({selectedDates.length} selected)
                  </span>
                )}
              </p>

              <button
                onClick={applyDateFilter}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Apply Now
              </button>
            </div>
          )}
        </div>

        {/* Order Type Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTypePicker(!showTypePicker);
              setShowDatePicker(false);
              setShowStatusPicker(false);
            }}
            className={`px-4 py-2 bg-white border rounded-lg transition-colors flex items-center gap-2 text-sm ${
              selectedTypes.length > 0 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className={selectedTypes.length > 0 ? 'text-blue-700 font-medium' : 'text-gray-700'}>
              {selectedTypes.length > 0 ? `Order Type (${selectedTypes.length})` : 'Order Type'}
            </span>
            <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90" />
          </button>

          {showTypePicker && (
            <div className="absolute top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-6 z-50 w-96">
              <h3 className="font-semibold text-gray-800 mb-4">Select Order Type</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {orderTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      selectedTypes.includes(type)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 mb-4">
                *You can choose multiple Order type
                {selectedTypes.length > 0 && (
                  <span className="ml-2 font-semibold text-blue-600">
                    ({selectedTypes.length} selected)
                  </span>
                )}
              </p>

              <button
                onClick={applyTypeFilter}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Apply Now
              </button>
            </div>
          )}
        </div>

        {/* Order Status Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStatusPicker(!showStatusPicker);
              setShowDatePicker(false);
              setShowTypePicker(false);
            }}
            className={`px-4 py-2 bg-white border rounded-lg transition-colors flex items-center gap-2 text-sm ${
              selectedStatuses.length > 0 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className={selectedStatuses.length > 0 ? 'text-blue-700 font-medium' : 'text-gray-700'}>
              {selectedStatuses.length > 0 ? `Order Status (${selectedStatuses.length})` : 'Order Status'}
            </span>
            <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90" />
          </button>

          {showStatusPicker && (
            <div className="absolute top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-6 z-50 w-96">
              <h3 className="font-semibold text-gray-800 mb-4">Select Order Status</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {orderStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      selectedStatuses.includes(status)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-500 mb-4">
                *You can choose multiple Order status
                {selectedStatuses.length > 0 && (
                  <span className="ml-2 font-semibold text-blue-600">
                    ({selectedStatuses.length} selected)
                  </span>
                )}
              </p>

              <button
                onClick={applyStatusFilter}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Apply Now
              </button>
            </div>
          )}
        </div>

        {/* Reset Filter Button */}
        <button
          onClick={resetFilters}
          className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Filter
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium">No orders found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredOrders.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border border-gray-200 transition-colors ${
                currentPage === 1 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 px-3">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button 
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`p-2 rounded-lg border border-gray-200 transition-colors ${
                currentPage === totalPages || totalPages === 0
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
