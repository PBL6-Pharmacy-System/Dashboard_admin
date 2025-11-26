import { Star, MessageSquare, ChevronRight, ChevronUp } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useState } from 'react';

const ReviewsList = () => {
  const { reviews, loading, errors } = useDashboard();
  const [visibleCount, setVisibleCount] = useState(5);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  const handleCollapse = () => {
    setVisibleCount(5);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-purple-600" />
          <h2 className="font-bold text-gray-900">Đánh giá gần đây</h2>
        </div>
        <div className="flex items-center gap-2">
          {reviews.length > visibleCount && (
            <button 
              onClick={handleShowMore}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Xem thêm ({reviews.length - visibleCount})
              <ChevronRight size={16} />
            </button>
          )}
          {visibleCount > 5 && visibleCount >= reviews.length && (
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

      {loading.reviews ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : errors.reviews ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 text-sm">{errors.reviews}</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Chưa có đánh giá nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.slice(0, visibleCount).map((review, index) => {
            // Fallback for different field name formats with type assertion
            const reviewAny = review as unknown as Record<string, unknown>;
            const customerName = review.customerName || (reviewAny.customer_name as string) || 'Khách hàng';
            const productName = review.productName || (reviewAny.product_name as string) || 'Sản phẩm';
            const createdAt = review.createdAt || (reviewAny.created_at as string) || new Date().toISOString();
            const reviewId = review.id || (reviewAny.review_id as number) || index;
            
            return (
            <div 
              key={reviewId} 
              className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {customerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm text-gray-900">{customerName}</h3>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{productName}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(createdAt)}</p>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
