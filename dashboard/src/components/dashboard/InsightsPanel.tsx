import { type FC } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { AnalyticsInsight } from '../../types/dashboard.types';

interface InsightsPanelProps {
  insights: AnalyticsInsight[];
  loading?: boolean;
  error?: string | null;
  title?: string;
  selectedBranch?: number | null;
}

const InsightsPanel: FC<InsightsPanelProps> = ({ 
  insights, 
  loading = false, 
  error = null,
  title = "Insights & Đề xuất",
  selectedBranch
}) => {
  const getIcon = (severity?: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-yellow-600" />;
      case 'error':
        return <AlertTriangle size={18} className="text-red-600" />;
      default:
        return <Info size={18} className="text-blue-600" />;
    }
  };

  const getBgColor = (severity?: string) => {
    switch (severity) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = (severity?: string) => {
    switch (severity) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        {/* Lightbulb icon with glowing effect */}
        <div className="relative">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-amber-500"
          >
            {/* Glowing effect */}
            <circle cx="12" cy="10" r="8" fill="currentColor" opacity="0.1" />
            <circle cx="12" cy="10" r="6" fill="currentColor" opacity="0.2" />
            
            {/* Bulb */}
            <path 
              d="M9 18h6M10 21h4M12 3v1M4.22 4.22l.7.7M1 12h1M21 12h1M18.36 5.64l.71-.71M12 8a4 4 0 0 1 2 7.5V18H10v-2.5A4 4 0 0 1 12 8z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="currentColor"
            />
          </svg>
          {/* Animated glow */}
          <div className="absolute inset-0 animate-pulse">
            <svg width="20" height="20" viewBox="0 0 24 24" className="text-amber-400" opacity="0.3">
              <circle cx="12" cy="10" r="10" fill="currentColor" />
            </svg>
          </div>
        </div>
        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          {/* Animated thinking lightbulb */}
          <div className="relative">
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              className="text-amber-500 animate-pulse"
            >
              <circle cx="12" cy="10" r="10" fill="currentColor" opacity="0.1" />
              <path 
                d="M9 18h6M10 21h4M12 3v1M4.22 4.22l.7.7M1 12h1M21 12h1M18.36 5.64l.71-.71M12 8a4 4 0 0 1 2 7.5V18H10v-2.5A4 4 0 0 1 12 8z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill="currentColor"
              />
            </svg>
            {/* Rotating rays */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" className="text-amber-400" opacity="0.5">
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          
          {/* Thinking text with dots animation */}
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-600">AI đang suy nghĩ</span>
            <span className="flex gap-1">
              <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          </div>
          
          <p className="text-xs text-gray-400">Đang phân tích dữ liệu chi nhánh...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm py-4 text-center">{error}</div>
      ) : insights.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          {/* Lightbulb SVG icon */}
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            className="text-amber-500 mx-auto mb-2"
          >
            <circle cx="12" cy="10" r="8" fill="currentColor" opacity="0.1" />
            <path 
              d="M9 18h6M10 21h4M12 3v1M4.22 4.22l.7.7M1 12h1M21 12h1M18.36 5.64l.71-.71M12 8a4 4 0 0 1 2 7.5V18H10v-2.5A4 4 0 0 1 12 8z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="currentColor"
            />
          </svg>
          <p className="text-sm font-medium text-amber-800 mb-1">
            {selectedBranch === null 
              ? 'Insights chỉ khả dụng cho từng chi nhánh' 
              : 'Không có insights cho chi nhánh này'}
          </p>
          <p className="text-xs text-amber-600">
            {selectedBranch === null 
              ? 'Vui lòng chọn một chi nhánh cụ thể để xem phân tích AI' 
              : 'AI sẽ phân tích khi có đủ dữ liệu'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getBgColor(insight.severity)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(insight.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${getTextColor(insight.severity)} leading-relaxed`}>
                    {insight.message}
                  </p>
                  {insight.type && (
                    <span className="inline-block mt-2 text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded">
                      {insight.type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <TrendingUp size={14} />
          <span>Được phân tích bởi AI dựa trên dữ liệu thực tế</span>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
