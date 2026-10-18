import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your IO Green solar consultant. I can help you with:\n\n• Solar system sizing and recommendations\n• Load-shedding solutions\n• Cost estimates and financing options\n• Installation process and timelines\n• Maintenance and warranty information\n\nHow can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('cost') || input.includes('price') || input.includes('quote')) {
      return 'Solar system costs vary based on your specific needs. For a typical South African home:\n\n• 5kW system: R80,000 - R120,000\n• 10kW system: R150,000 - R200,000\n• 15kW system: R220,000 - R300,000\n\nThese include panels, inverters, and installation. We offer flexible financing options and can help you access government incentives. Would you like me to calculate a personalized quote using our solar calculator?';
    }
    
    if (input.includes('load') || input.includes('shedding') || input.includes('outage')) {
      return 'Load-shedding is a major concern for South African businesses! Our hybrid solar systems with battery storage provide:\n\n• Uninterrupted power during outages\n• Automatic switching between grid and solar\n• Battery backup for essential loads\n• Smart energy management\n\nA typical business can achieve 80-100% uptime during load-shedding with our solutions. What\'s your current monthly electricity bill? This helps me recommend the right system size.';
    }
    
    if (input.includes('install') || input.includes('process') || input.includes('how long')) {
      return 'Our installation process is streamlined and professional:\n\n**Timeline: 2-4 weeks total**\n\n1. **Site Assessment** (1-2 days)\n2. **System Design & Permits** (1 week)\n3. **Equipment Procurement** (1-2 weeks)\n4. **Installation** (1-3 days)\n5. **Testing & Commissioning** (1 day)\n\nWe handle all permits, grid connections, and compliance. Our certified technicians ensure minimal disruption to your operations. Would you like to schedule a free site assessment?';
    }
    
    if (input.includes('maintenance') || input.includes('warranty') || input.includes('service')) {
      return 'IO Green provides comprehensive support:\n\n**Warranties:**\n• Solar panels: 25 years performance\n• Inverters: 5-10 years\n• Installation: 5 years\n\n**Maintenance:**\n• Annual system health checks\n• Panel cleaning and inspection\n• Performance monitoring\n• 24/7 remote monitoring\n\nOur maintenance plans ensure optimal performance and maximize your ROI. Most systems require minimal maintenance - solar panels are very reliable! Any specific concerns about system maintenance?';
    }
    
    if (input.includes('business') || input.includes('commercial') || input.includes('company')) {
      return 'IO Green specializes in commercial solar solutions! We\'ve helped numerous South African businesses:\n\n**Benefits for businesses:**\n• Reduce electricity costs by 40-70%\n• Achieve energy independence\n• Improve sustainability credentials\n• Protect against rising electricity tariffs\n\n**Our commercial services:**\n• Custom system design\n• Energy audits\n• Flexible financing\n• Maintenance contracts\n\nWhat type of business do you have? This helps me recommend the most suitable solution for your energy needs.';
    }
    
    return 'Thank you for your question! I\'d be happy to help you with solar energy solutions. Could you provide more details about:\n\n• Your location (for solar irradiance calculations)\n• Current monthly electricity bill\n• Property type (residential/commercial)\n• Specific concerns (load-shedding, costs, etc.)\n\nThis information helps me provide more targeted advice. You can also use our solar calculator for a quick estimate!';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'bot' && (
              <div className="w-8 h-8 bg-[#D4FF00]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[#D4FF00]" />
              </div>
            )}
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-[#D4FF00] text-[#1E1E1E] rounded-br-md font-medium'
                  : 'bg-[#333333] text-white rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.content}</p>
              <p className={`text-xs opacity-70 mt-2 ${message.type === 'user' ? 'text-[#1E1E1E]' : 'text-[#CCCCCC]'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.type === 'user' && (
              <div className="w-8 h-8 bg-[#333333] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-[#CCCCCC]" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-[#D4FF00]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-[#D4FF00]" />
            </div>
            <div className="bg-[#333333] text-white px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#D4FF00]" />
                <span className="text-sm">Typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#D4FF00]/20 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about solar solutions, costs, installation..."
            className="flex-1 bg-[#333333] border border-[#333333] rounded-full px-4 py-2 text-white placeholder-[#CCCCCC] focus:outline-none focus:border-[#D4FF00]/50 focus:ring-1 focus:ring-[#D4FF00]/50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="w-10 h-10 bg-[#D4FF00] hover:bg-[#D4FF00]/90 disabled:bg-[#333333] disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4 text-[#1E1E1E]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;