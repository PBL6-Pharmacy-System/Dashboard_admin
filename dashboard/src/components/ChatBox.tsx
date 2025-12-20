import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, User, Bot, Loader2 } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { branchService } from '../services/branchService';

interface Message {
  id: string;
  sender: 'user' | 'admin' | 'bot';
  text: string;
  timestamp: Date;
  senderName?: string;
  data?: any;
}

interface ChatBoxProps {
  userRole?: 'admin' | 'staff' | 'customer';
  userName?: string;
}

const ChatBox = ({ userRole = 'admin', userName = 'Admin' }: ChatBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Xin chào! Tôi là trợ lý ảo của hệ thống. Bạn có thể hỏi tôi về:\n\n- Tổng quan hệ thống (overview, thống kê)\n- Sản phẩm (products, inventory)\nĐơn hàng (orders, sales)\nChi nhánh (branches)\nDoanh thu (revenue)\n\nVí dụ: "Cho tôi xem tổng quan hệ thống", "Có bao nhiêu sản phẩm?", "Danh sách đơn hàng"',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI Response Handler
  const processUserMessage = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    try {
      // Overview / Tổng quan
      if (lowerMessage.includes('tổng quan') || lowerMessage.includes('overview') || 
          lowerMessage.includes('thống kê') || lowerMessage.includes('dashboard')) {
        const data = await dashboardService.getOverview();
        if (data.success && data.data) {
          const stats = data.data;
          return `**Tổng quan hệ thống:**\n\n` +
                 `Doanh thu hôm nay: ${stats.revenue.today?.toLocaleString('vi-VN')}₫\n` +
                 `Doanh thu tháng này: ${stats.revenue.thisMonth?.toLocaleString('vi-VN')}₫\n` +
                 `Sản phẩm: ${stats.products.total} sản phẩm\n` +
                 `Đơn hàng: ${stats.orders.total} đơn\n` +
                 `Khách hàng: ${stats.customers.total} khách\n` +
                 `Sản phẩm sắp hết hạn: ${stats.products.expiringNext30} sản phẩm`;
        }
      }

      // Products / Sản phẩm
      if (lowerMessage.includes('sản phẩm') || lowerMessage.includes('product') || 
          lowerMessage.includes('hàng hóa')) {
        const data = await productService.getAllProducts(1, 5);
        if (data.products && data.products.length > 0) {
          let response = `📦 **Danh sách sản phẩm (${data.pagination?.total || data.products.length} sản phẩm):**\n\n`;
          data.products.slice(0, 5).forEach((p: any, i: number) => {
            response += `${i + 1}. ${p.name}\n   Giá: ${Number(p.price || 0).toLocaleString('vi-VN')}₫\n`;
          });
          if (data.products.length > 5) {
            response += `\n... và ${data.products.length - 5} sản phẩm khác`;
          }
          return response;
        }
      }

      // Orders / Đơn hàng
      if (lowerMessage.includes('đơn hàng') || lowerMessage.includes('order') || 
          lowerMessage.includes('đơn đặt')) {
        const data = await orderService.getAllOrders(1, 5);
        const orders = (data as any).orders || [];
        if (orders && orders.length > 0) {
          let response = `🛒 **Đơn hàng gần đây (${(data as any).pagination?.total || orders.length} đơn):**\n\n`;
          orders.slice(0, 5).forEach((o: any, i: number) => {
            response += `${i + 1}. Đơn #${o.id} - ${o.status}\n   Tổng: ${Number(o.total_amount || 0).toLocaleString('vi-VN')}₫\n`;
          });
          return response;
        }
      }

      // Branches / Chi nhánh
      if (lowerMessage.includes('chi nhánh') || lowerMessage.includes('branch') || 
          lowerMessage.includes('cửa hàng')) {
        const data = await branchService.getAllBranches({});
        const branches = Array.isArray(data.data) ? data.data : (data.data?.branches || []);
        if (branches.length > 0) {
          let response = `🏢 **Danh sách chi nhánh (${branches.length} chi nhánh):**\n\n`;
          branches.forEach((b: any, i: number) => {
            response += `${i + 1}. ${b.branch_name || b.name || `Chi nhánh ${b.id}`}\n`;
            if (b.address) response += `   📍 ${b.address}\n`;
          });
          return response;
        }
      }

      // Revenue / Doanh thu
      if (lowerMessage.includes('doanh thu') || lowerMessage.includes('revenue') || 
          lowerMessage.includes('sales')) {
        const data = await dashboardService.getRevenue();
        if (data.success && data.data) {
          return `**Thông tin doanh thu:**\n\n` +
                 `Tổng doanh thu: ${data.data.current.totalRevenue?.toLocaleString('vi-VN')}₫\n` +
                 `Tổng đơn hàng: ${data.data.current.totalOrders}\n` +
                 `Giá trị TB/đơn: ${data.data.current.averageOrderValue?.toLocaleString('vi-VN')}₫\n` +
                 `(Dữ liệu được cập nhật theo thời gian thực)`;
        }
      }

      // Inventory / Kho hàng
      if (lowerMessage.includes('kho') || lowerMessage.includes('inventory') || 
          lowerMessage.includes('tồn kho')) {
        const data = await dashboardService.getInventoryStats();
        if (data.success && data.data) {
          return `**Thống kê kho hàng:**\n\n` +
                 `Tổng sản phẩm: ${data.data.totalProducts || 'N/A'}\n` +
                 `Sản phẩm sắp hết: ${data.data.lowStockProducts || 0}\n` +
                 `Hết hàng: ${data.data.outOfStockProducts || 0}\n` +
                 `Sắp hết hạn: ${data.data.expiringProducts || 0}`;
        }
      }

      // Default response
      return 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi về:\n\n' +
             '• Tổng quan hệ thống\n' +
             '• Sản phẩm\n' +
             '• Đơn hàng\n' +
             '• Chi nhánh\n' +
             '• Doanh thu\n' +
             '• Kho hàng';
    } catch (error) {
      console.error('Error processing message:', error);
      return '❌ Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.';
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date(),
      senderName: userName,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Process message and get AI response
    try {
      const responseText = await processUserMessage(inputMessage);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageStyle = (sender: string) => {
    if (sender === 'user') {
      return 'bg-blue-600 text-white ml-auto';
    } else if (sender === 'admin') {
      return 'bg-green-600 text-white ml-auto';
    } else {
      return 'bg-gray-200 text-gray-800';
    }
  };

  const getMessageIcon = (sender: string) => {
    if (sender === 'bot') {
      return <Bot className="w-4 h-4" />;
    } else {
      return <User className="w-4 h-4" />;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-5 shadow-2xl transition-all duration-300 hover:scale-110 flex items-center gap-3 group"
        aria-label="Open chat"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-base font-semibold">
          Trợ lý AI
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border-2 border-blue-200 transition-all duration-300 ${
        isMinimized ? 'h-16 w-[500px]' : 'h-[700px] w-[550px]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2.5">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Trợ lý AI - Hệ thống</h3>
            <p className="text-xs text-blue-100">
              {userRole === 'admin' ? '🔧 Quản trị viên' : '👤 Nhân viên'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 rounded-lg p-2 transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 rounded-lg p-2 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      {!isMinimized && (
        <>
          <div className="h-[560px] overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-blue-50/30 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' || message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-md ${getMessageStyle(message.sender)}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {getMessageIcon(message.sender)}
                    <span className="text-xs opacity-75 font-medium">
                      {message.senderName || (message.sender === 'bot' ? 'Trợ lý AI' : 'Bạn')}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1.5">
                    {message.timestamp.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 rounded-2xl px-5 py-3 shadow-md flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Đang xử lý...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-2 border-blue-100 p-4 bg-white rounded-b-2xl">
            <div className="flex gap-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi về tổng quan, sản phẩm, đơn hàng, chi nhánh..."
                className="flex-1 border-2 border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={inputMessage.trim() === '' || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl px-5 transition-colors flex items-center justify-center"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;
