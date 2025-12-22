import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, User, Bot, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';

const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'https://unendowed-placably-aviana.ngrok-free.dev';

interface Message {
  id: string;
  sender: 'user' | 'admin' | 'bot';
  text: string;
  timestamp: Date;
  senderName?: string;
  data?: unknown;
  isStreaming?: boolean;
}

interface ChatBoxProps {
  userRole?: 'admin' | 'staff' | 'customer';
  userName?: string;
}

const ChatBox = ({ userRole = 'admin', userName = 'Admin' }: ChatBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Stream chat with AI using /api/auth-chat/stream endpoint
  const streamChatWithAI = async (userMessage: string) => {
    try {
      const accessToken = authService.getAccessToken();
      const requestBody: { message: string; session_id?: string } = { message: userMessage };
      
      if (sessionId) {
        requestBody.session_id = sessionId;
      }

      const response = await fetch(`${AI_BASE_URL}/api/auth-chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');
      
      const decoder = new TextDecoder();
      let buffer = '';
      const textChunks: string[] = [];
      let newSessionId = sessionId;
      
      const botMessageId = (Date.now() + 1).toString();
      
      // Add initial streaming message
      const initialBotMessage: Message = {
        id: botMessageId,
        sender: 'bot',
        text: '',
        timestamp: new Date(),
        isStreaming: true
      };
      setMessages(prev => [...prev, initialBotMessage]);

      const processLine = (line: string) => {
        if (!line || !line.startsWith('data: ')) return;
        
        try {
          const data = JSON.parse(line.slice(6));
          
          if (data.type === 'metadata') {
            if (data.session_id) {
              newSessionId = data.session_id;
              setSessionId(newSessionId);
            }
          } else if (data.type === 'text') {
            if (data.chunk) {
              textChunks.push(data.chunk);
              setMessages(prev => prev.map(msg => 
                msg.id === botMessageId 
                  ? { ...msg, text: textChunks.join('') }
                  : msg
              ));
            }
          }
        } catch {
          // Silent fail for invalid JSON
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          if (buffer) {
            buffer.split('\n').forEach(processLine);
          }
          
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, text: textChunks.join(''), isStreaming: false }
              : msg
          ));
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        const lastNewline = buffer.lastIndexOf('\n');
        if (lastNewline === -1) continue;
        
        const complete = buffer.slice(0, lastNewline);
        buffer = buffer.slice(lastNewline + 1);
        
        complete.split('\n').forEach(processLine);
      }

      return textChunks.join('');
    } catch (error) {
      console.error('Error streaming chat:', error);
      throw error;
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
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      await streamChatWithAI(currentInput);
    } catch {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Xin lỗi, đã có lỗi xảy ra khi kết nối đến AI. Vui lòng thử lại.',
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
