import { Activity, Package, Users, ShoppingCart, Settings, ChevronRight, ChevronUp } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useState } from 'react';

const RecentActivities = () => {
  const { activities, loading, errors } = useDashboard();
  const [visibleCount, setVisibleCount] = useState(5);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  const handleCollapse = () => {
    setVisibleCount(5);
  };

  const getActivityIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    const lowerType = type?.toLowerCase() || '';
    
    if (lowerType.includes('order') || lowerType.includes('đơn hàng')) {
      return <ShoppingCart className={iconClass} />;
    }
    if (lowerType.includes('product') || lowerType.includes('sản phẩm')) {
      return <Package className={iconClass} />;
    }
    if (lowerType.includes('customer') || lowerType.includes('khách hàng')) {
      return <Users className={iconClass} />;
    }
    if (lowerType.includes('system') || lowerType.includes('hệ thống')) {
      return <Settings className={iconClass} />;
    }
    return <Activity className={iconClass} />;
  };

  const getActivityColor = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    
    if (lowerType.includes('order') || lowerType.includes('đơn hàng')) {
      return 'bg-blue-100 text-blue-600';
    }
    if (lowerType.includes('product') || lowerType.includes('sản phẩm')) {
      return 'bg-green-100 text-green-600';
    }
    if (lowerType.includes('customer') || lowerType.includes('khách hàng')) {
      return 'bg-purple-100 text-purple-600';
    }
    if (lowerType.includes('system') || lowerType.includes('hệ thống')) {
      return 'bg-gray-100 text-gray-600';
    }
    return 'bg-orange-100 text-orange-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-orange-600" />
          <h2 className="font-bold text-gray-900">Hoạt động gần đây</h2>
        </div>
        <div className="flex items-center gap-2">
          {activities.length > visibleCount && (
            <button 
              onClick={handleShowMore}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Xem thêm ({activities.length - visibleCount})
              <ChevronRight size={16} />
            </button>
          )}
          {visibleCount > 5 && visibleCount >= activities.length && (
            <button 
              onClick={handleCollapse}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors"
            >
              Thu gọn
              <ChevronUp size={16} />
            </button>
          )}
        </div>
      </div>

      {loading.activities ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : errors.activities ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 text-sm">{errors.activities}</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Không có hoạt động nào</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {activities.slice(0, visibleCount).map((activity, index) => {
            // Fallback field extraction with type assertion
            const activityAny = activity as unknown as Record<string, unknown>;
            const activityId = (activityAny.activity_id as number) || activity.orderId || activity.customerId || index;
            const activityType = (activityAny.activity_type as string) || activity.type || '';
            const description = (activityAny.description as string) || activity.message || 'Không có mô tả';
            const userName = (activityAny.user_name as string) || activity.customer || activity.name || 'N/A';
            const createdAt = (activityAny.created_at as string) || activity.timestamp || new Date().toISOString();

            return (
              <div 
                key={activityId} 
                className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${getActivityColor(activityType)}`}>
                  {getActivityIcon(activityType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 mb-1">{description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium">{userName}</span>
                    <span>•</span>
                    <span>{formatDate(createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivities;
