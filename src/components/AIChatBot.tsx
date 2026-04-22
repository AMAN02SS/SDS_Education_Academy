import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    let key = process.env.GEMINI_API_KEY;
    console.log("GEMINI_API_KEY value:", typeof key, `"${key}"`);
    
    // Clean up key if it exists
    if (typeof key === 'string') {
      key = key.trim();
      // Remove accidental quotes if stringified twice
      if (key.startsWith('"') && key.endsWith('"')) {
        key = key.slice(1, -1);
      }
    }

    if (!key || key === "undefined" || key === '""') {
      throw new Error(`Invalid API key value. Please check your environment variables.`);
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

interface Message {
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

export const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi! I'm your SDS Academy AI Assistant. How can I help you find study materials, notes, or answer any questions?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { text: userMsg, sender: 'user', timestamp: new Date() }]);
    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => `${msg.sender === 'ai' ? 'Assistant' : 'User'}: ${msg.text}`).join('\n');
      
      const prompt = `Conversation history:
${conversationHistory}
User: ${userMsg}

Please respond as the helpful SDS Academy AI Assistant. You should be encouraging, concise, and helpful to a student. You can recommend them to look at our website sections:
- Subject Videos (/videos)
- Concept Quizzes (/quizzes)
- Study Notes (/notes)
- NCERT Solutions (/ncert)
- Study Forum (/forum)
Answer their academic question accurately if they asked one.`;

      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          systemInstruction: "You are the official AI tutor and guide for SDS Education Academy. Be concise, friendly, and helpful. Format text clearly.",
        }
      });

      const text = response.text || "I'm sorry, I couldn't generate a response. Please try again later.";
      
      setMessages(prev => [...prev, { text, sender: 'ai', timestamp: new Date() }]);
      
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      const errorMsg = error?.message || "Unknown error";
      setMessages(prev => [...prev, { 
        text: `Error connecting to AI: ${errorMsg}\n\nNote: If you are running locally without an environment variable, be sure to set GEMINI_API_KEY.`, 
        sender: 'ai', 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[100]"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
              aria-label="Open AI Chat"
            >
              <MessageCircle size={28} className="group-hover:animate-pulse" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-[90vw] max-w-[400px] h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-premium border border-slate-100 flex flex-col z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-secondary p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-xl text-primary">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">AI Assistant</h3>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-medium uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-primary/10 text-primary' : 'bg-secondary text-white'}`}>
                      {msg.sender === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                    </div>
                    <div 
                      className={`p-3.5 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-sm'}`}
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start w-full">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-secondary text-white">
                      <Bot size={16} />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm rounded-tl-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 placeholder:text-slate-400"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 p-1.5 rounded-xl bg-primary text-white disabled:opacity-50 disabled:bg-slate-200 transition-all active:scale-95"
                >
                  <Send size={18} className={inputValue.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                </button>
              </div>
              <div className="text-center mt-2">
                <p className="text-[10px] text-slate-400 font-medium">AI generated content. Verify important academic facts.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
