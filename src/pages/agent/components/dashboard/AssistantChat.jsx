import React, { useState } from 'react';
import { Send, Bot, User, Zap } from 'lucide-react';

export default function AssistantChat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'مرحباً أيها القائد! أنا TradeNov Agent. كيف يمكنني مساعدتك في إدارة البوتات أو تحليل السوق اليوم؟' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const botMsg = { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: 'تم استلام طلبك. جاري معالجة البيانات عبر TradeNov AI Engine... سأقوم ببناء الإعدادات اللازمة قريباً (هذه واجهة محاكاة حالياً).' 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="glass-panel flex flex-col h-[600px] max-w-4xl mx-auto rounded-xl overflow-hidden border border-[var(--border-panel)]">
      <div className="p-4 border-b border-white/10 bg-black/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="font-bold text-white">TradeNov Smart Assistant</h2>
          <p className="text-xs text-emerald-400 flex items-center gap-1"><Zap size={10} /> Online & Ready</p>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 custom-scrollbar bg-black/10">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.sender === 'user' 
                ? 'bg-primary/20 border border-primary/30 text-white rounded-tr-none' 
                : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed" dir="auto">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب رسالتك للوكيل الذكي..." 
            className="w-full bg-black/30 border border-white/10 rounded-full py-3 px-6 pr-14 text-white focus:outline-none focus:border-primary/50 transition-colors"
            dir="auto"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/40 text-primary flex items-center justify-center transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
