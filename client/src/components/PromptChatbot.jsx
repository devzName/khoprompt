import { useState, useEffect } from 'react';
import { recommendationService } from '../services/recommendationService';

const PromptChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  // Load messages from sessionStorage on mount
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('chatbot_messages');
    const savedWelcome = sessionStorage.getItem('chatbot_welcome');
    
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Validate messages structure
        const validMessages = parsed.filter(msg => 
          msg && 
          typeof msg === 'object' && 
          typeof msg.text === 'string' &&
          (msg.type === 'user' || msg.type === 'bot')
        );
        
        if (validMessages.length > 0) {
          setMessages(validMessages);
          setHasShownWelcome(savedWelcome === 'true');
        }
      } catch (e) {
        sessionStorage.removeItem('chatbot_messages');
        sessionStorage.removeItem('chatbot_welcome');
      }
    }
  }, []);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chatbot_messages', JSON.stringify(messages));
      sessionStorage.setItem('chatbot_welcome', hasShownWelcome.toString());
    }
  }, [messages, hasShownWelcome]);

  // Add CSS animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Show welcome message immediately when chatbot opens
  useEffect(() => {
    if (isOpen && !hasShownWelcome) {
      setShowTooltip(false);
      setMessages([{
        type: 'bot',
        text: 'Xin chào! 👋 Mình là AI Prompt Library. Mình có thể giúp bạn tìm prompt phù hợp với nhu cầu của bạn. Hãy cho mình biết bạn đang tìm kiếm gì nhé!',
        prompts: []
      }]);
      setHasShownWelcome(true);
    }
  }, [isOpen, hasShownWelcome]);

  // Auto show tooltip after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowTooltip(false);
  };

  const handleResetChat = () => {
    // Clear sessionStorage
    sessionStorage.removeItem('chatbot_messages');
    sessionStorage.removeItem('chatbot_welcome');
    
    setMessages([]);
    setQuery('');
    setIsTyping(true);
    setHasShownWelcome(false);
    
    // Show welcome message again
    setTimeout(() => {
      setIsTyping(false);
      setMessages([{
        type: 'bot',
        text: 'Xin chào! 👋 Mình là AI Prompt Library. Mình có thể giúp bạn tìm prompt phù hợp với nhu cầu của bạn. Hãy cho mình biết bạn đang tìm kiếm gì nhé!',
        prompts: []
      }]);
      setHasShownWelcome(true);
    }, 1000);
  };

  const handleSend = async (messageText) => {
    const textToSend = messageText || query.trim();
    if (!textToSend || loading) return;

    setQuery('');
    
    const userMessage = { type: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const welcomeMessage = 'Xin chào! 👋 Mình là AI Prompt Library. Mình có thể giúp bạn tìm prompt phù hợp với nhu cầu của bạn. Hãy cho mình biết bạn đang tìm kiếm gì nhé!';
      
      const chatHistory = messages
        .filter(msg => msg.text !== welcomeMessage)
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));
      
      const result = await recommendationService.chatbotSuggest(textToSend, sessionId, chatHistory);
      
      setTimeout(() => {
        setIsTyping(false);
        const botMessage = typeof result === 'string'
          ? result
          : typeof result?.message === 'string' 
            ? result.message 
            : 'Đây là kết quả tìm kiếm của bạn:';
          
        setMessages(prev => [...prev, {
          type: 'bot',
          text: botMessage,
          prompts: Array.isArray(result?.prompts) ? result.prompts : []
        }]);
      }, 800);
    } catch (error) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          type: 'bot',
          text: 'Xin lỗi, có lỗi xảy ra. Bạn thử lại nhé! 😅',
          prompts: []
        }]);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'Tìm prompt về viết content',
    'Prompt lập trình Python',
    'Gợi ý prompt marketing',
    'Prompt phân tích dữ liệu'
  ];

  return (
    <>
      {/* Tooltip Suggestion - appears outside the button - Hidden on mobile */}
      {!isOpen && showTooltip && (
        <div 
          className="hidden lg:block fixed bottom-24 right-6 z-40 transition-all duration-1000 ease-out"
          style={{
            animation: 'fadeInUp 1s ease-out'
          }}
        >
          <div className="relative bg-white rounded-2xl shadow-xl p-4 max-w-xs">
            {/* Close button */}
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Typing animation */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                🤖
              </div>
              <div className="grow">
                <p className="text-sm text-gray-800 font-medium mb-1">AI Prompt Library</p>
                <p className="text-sm text-gray-600">
                  Xin chào! Mình có thể hỗ trợ bạn tìm prompt phù hợp 👋
                </p>
              </div>
            </div>
            
            {/* CTA Button */}
            <button
              onClick={handleOpenChat}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium"
            >
              Bắt đầu chat ngay →
            </button>
            
            {/* Arrow pointing to button */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45"></div>
          </div>
        </div>
      )}

      {/* Floating Button - Show on all devices */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 hover:scale-110"
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chatbot Window - Responsive */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 className="font-semibold">AI Prompt Library</h3>
                <p className="text-xs text-blue-100">Tìm prompt phù hợp</p>
              </div>
            </div>
            
            {/* Reset button */}
            <button
              onClick={handleResetChat}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              title="Làm mới cuộc trò chuyện"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="grow overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'} rounded-2xl p-3 shadow-sm`}>
                  <p className="text-sm">
                    {typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)}
                  </p>
                  
                  {/* Display prompts if available */}
                  {msg.prompts && msg.prompts.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.prompts.map((prompt) => (
                        <a
                          key={prompt.id}
                          href={`/prompt/${prompt.slug}`}
                          className="block bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <h4 className="font-semibold text-sm text-gray-900 mb-1">
                            {prompt.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {prompt.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>⭐ {prompt.rating?.toFixed(1) || '0.0'}</span>
                            <span>👁️ {prompt.view_count || 0}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing indicator - smaller size */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-xl px-3 py-2 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && !isTyping && (
            <div className="px-4 py-2 border-t bg-white">
              <p className="text-xs text-gray-500 mb-2">Gợi ý câu hỏi:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi của bạn..."
                className="grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={loading || isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!query.trim() || loading || isTyping}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PromptChatbot;
