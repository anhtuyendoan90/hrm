import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { chatWithGemini } from '../../utils/geminiApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, X, Loader2, AlertCircle } from 'lucide-react';

export default function ChatPanel() {
  const { state, dispatch } = useApp();
  const { chatOpen, chatMessages, apiKey, kpis, filteredData, data } = state;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, loading]);

  if (!chatOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || !apiKey || !kpis || !data) return;

    const userMsg = input.trim();
    setInput('');
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: { role: 'user', content: userMsg, timestamp: new Date() },
    });

    setLoading(true);
    try {
      const response = await chatWithGemini(
        apiKey,
        userMsg,
        kpis,
        filteredData,
        data.columnMapping,
        chatMessages
      );
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: { role: 'assistant', content: response, timestamp: new Date() },
      });
    } catch (err: any) {
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: { 
          role: 'assistant', 
          content: `❌ Lỗi: ${err.message || 'Không thể kết nối với Gemini API.'}`, 
          timestamp: new Date() 
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed top-[65px] right-0 bottom-0 w-full sm:w-[380px] z-40 flex flex-col border-l animate-slide-in-right shadow-2xl"
      style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
      
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>AI Assistant</h3>
            <p className="text-xs text-brand-500">Online</p>
          </div>
        </div>
        <button 
          onClick={() => dispatch({ type: 'TOGGLE_CHAT' })}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="text-center mt-10">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
              <Bot className="w-6 h-6 text-brand-500" />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Tôi có thể giúp gì?</p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Hỏi tôi bất kỳ điều gì về dữ liệu nhân sự đang hiển thị.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {['Phòng ban nào có lương cao nhất?', 'Ai có nguy cơ nghỉ việc?', 'Tỷ lệ nam/nữ ra sao?'].map((q, i) => (
                <button key={i} onClick={() => setInput(q)} 
                  className="text-xs text-left p-2 rounded-lg transition-colors border hover:border-brand-500"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-[var(--color-surface-hover)]' : 'gradient-brand'
              }`}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-white" />}
              </div>
              <div className={`p-3 text-sm shadow-sm ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai markdown-body !text-sm'}`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                )}
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-6 h-6 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="p-3 text-sm chat-bubble-ai flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
              Đang phân tích...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        {!apiKey ? (
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Vui lòng nhập API Key trong phần "AI Report" để sử dụng tính năng Chat.
          </div>
        ) : (
          <div className="relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi..."
              className="w-full resize-none p-3 pr-12 rounded-xl text-sm outline-none transition-all duration-200"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              rows={Math.min(4, input.split('\n').length || 1)}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 bottom-2 p-2 rounded-lg bg-brand-500 text-white disabled:opacity-50 hover:bg-brand-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
