import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Loader2, AlertTriangle } from 'lucide-react';
import { Message, User } from '../types';
import { initializeChat, sendMessageToGemini, AcademicContext } from '../services/geminiService';
import { backend } from '../services/backend';
// @ts-ignore
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  user: User;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      setIsInitializing(true);
      try {
        // Gather context with a timeout. If backend is slow, we proceed without context.
        const getContextWithTimeout = async () => {
          const timeout = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Backend timeout')), 2000)
          );
          
          const fetchData = async () => {
            const d = await backend.data.getDashboard(user.regNumber);
            const t = await backend.data.getTasks(user.regNumber);
            return { d, t };
          };

          return Promise.race([fetchData(), timeout]);
        };

        let context: AcademicContext | undefined;
        try {
            // @ts-ignore
            const { d: dashboardData, t: tasksData } = await getContextWithTimeout();
            context = {
                cgpa: user.cgpa,
                attendance: dashboardData.courses?.map((c: any) => ({ course: c.name, percentage: c.attendance })) || [],
                pendingTasks: tasksData.filter((t: any) => !t.completed).map((t: any) => ({ title: t.title, due: t.deadline }))
            };
        } catch (e) {
            console.warn("Failed to load context for chat, proceeding without it:", e);
        }

        initializeChat(user.name, user.branch, context);

        // Trigger proactive greeting
        const greetingStream = await sendMessageToGemini("Review my academic context. Greet me briefly, and if I have low attendance or pending tasks, give me a short, specific tip about it. Otherwise, ask how you can help.");
        
        const botMsgId = 'welcome';
        setMessages([{
            id: botMsgId,
            role: 'model',
            text: '',
            timestamp: new Date()
        }]);

        let fullText = '';
        for await (const chunk of greetingStream) {
            fullText += chunk;
            setMessages(prev => {
                if (prev.length === 0) return [{ id: botMsgId, role: 'model', text: chunk, timestamp: new Date() }];
                return prev.map(msg => msg.id === botMsgId ? { ...msg, text: fullText } : msg);
            });
        }

      } catch (error: any) {
        console.error("Chat init error", error);
        
        let fallbackText = `Hi ${user.name}! I'm your SLPA assistant. I can help you with study plans and attendance tracking.`;
        
        if (error.message === 'MISSING_API_KEY') {
            fallbackText = "⚠️ SYSTEM ALERT: API Key is missing. Please ask the developer to configure the 'API_KEY' environment variable in the deployment settings.";
        }

        // Initialize blindly as fallback
        initializeChat(user.name, user.branch);
        
        setMessages([{
          id: 'welcome',
          role: 'model',
          text: fallbackText,
          timestamp: new Date()
        }]);
      } finally {
        setIsInitializing(false);
      }
    };

    initChat();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || isInitializing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const stream = await sendMessageToGemini(userMsg.text);
      
      const botMsgId = (Date.now() + 1).toString();
      const initialBotMsg: Message = {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, initialBotMsg]);

      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { ...msg, text: fullText } : msg
        ));
      }
      
    } catch (error: any) {
      console.error("Chat Message Error:", error);
      
      let errorMessage = "I'm having trouble connecting to the network right now.";
      const detail = error.message || error.toString();
      
      if (detail === 'MISSING_API_KEY' || detail === 'AI_NOT_INITIALIZED') {
          errorMessage = "⚠️ Configuration Error: The AI API Key is missing. Please add the `API_KEY` environment variable in your Vercel/Deployment settings and redeploy.";
      } else if (detail.includes('403')) {
          errorMessage = "⚠️ Access Denied: The provided API Key is invalid or expired.";
      } else if (detail.includes('404')) {
          errorMessage = "⚠️ Model Not Found: The AI model is currently unavailable or your API key doesn't have access to it.";
      } else if (detail.includes('429')) {
          errorMessage = "⚠️ Quota Exceeded: You have sent too many requests. Please wait a moment.";
      } else if (detail.includes('503')) {
          errorMessage = "⚠️ Service Unavailable: Google AI services are temporarily down.";
      } else if (detail.includes('fetch') || detail.includes('network')) {
          errorMessage = "⚠️ Network Error: Unable to reach Google AI. Please check your internet connection.";
      } else {
          errorMessage = `⚠️ Error: ${detail}. Please check your connection.`;
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: errorMessage,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'model' ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {msg.role === 'model' ? <Bot size={18} /> : <UserIcon size={18} />}
            </div>
            
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm overflow-hidden ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              {msg.role === 'user' ? (
                <div>{msg.text}</div>
              ) : (
                <ReactMarkdown
                  className="prose prose-sm max-w-none"
                  components={{
                    ul: (props: any) => <ul className="list-disc pl-4 my-2" {...props} />,
                    ol: (props: any) => <ol className="list-decimal pl-4 my-2" {...props} />,
                    h1: (props: any) => <h1 className="text-lg font-bold my-2" {...props} />,
                    h2: (props: any) => <h2 className="text-base font-bold my-2" {...props} />,
                    h3: (props: any) => <h3 className="text-sm font-bold my-1" {...props} />,
                    code: (props: any) => (
                      props.className?.includes('language') 
                        ? <code className="block bg-gray-800 text-gray-100 p-2 rounded-lg my-2 overflow-x-auto font-mono text-xs whitespace-pre" {...props} />
                        : <code className="bg-gray-100 text-red-500 rounded px-1 py-0.5 font-mono text-xs" {...props} />
                    ),
                    pre: (props: any) => <div {...props} />,
                    p: (props: any) => <p className="mb-2 last:mb-0" {...props} />,
                    strong: (props: any) => <strong className="font-semibold" {...props} />,
                    a: (props: any) => <a className="text-blue-600 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {(isLoading || isInitializing) && (
          <div className="flex items-center gap-2 text-gray-400 text-xs ml-12">
            <Loader2 className="animate-spin" size={14} />
            <span>{isInitializing ? 'Analyzing your profile...' : 'Thinking...'}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about studies, attendance..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder:text-gray-400"
            disabled={isLoading || isInitializing}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading || isInitializing}
            className="text-blue-600 disabled:text-gray-400 transition-colors p-1"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};