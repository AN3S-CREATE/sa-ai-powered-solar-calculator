import React, { useState, useRef, useEffect } from 'react';
import { SolarCalculation } from './SolarCalculator';
import { Bot, Send, User, Lightbulb, HelpCircle, Calculator, Zap } from 'lucide-react';

interface AIAssistantProps {
  calculation: SolarCalculation | null;
  compact?: boolean;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  displayContent?: string;
  timestamp: Date;
  isAnimating?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ calculation, compact = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      const welcomeContent = calculation 
        ? `Hello ${calculation.userName}! I'm the local advisor inside AN3S Solar Intelligence. I can explain your estimate, answer technical questions, and help you prepare the next planning step. What would you like to know?`
        : "Hello! I'm the local advisor inside AN3S Solar Intelligence. I can explain solar-planning terms and help you use the offline calculator without inventing supplier, installation, or regulatory facts. Complete a calculation first, or ask a general solar-planning question.";

      const welcomeMessage: Message = {
        id: '1',
        type: 'assistant',
        content: welcomeContent,
        displayContent: '',
        timestamp: new Date(),
        isAnimating: true
      };
      
      setMessages([welcomeMessage]);
      animateMessage(welcomeMessage, 0);
    }
  }, [calculation, messages.length]);

  const animateMessage = (message: Message, messageIndex: number) => {
    const words = message.content.split(' ');
    let currentIndex = 0;
    
    const animateNextWord = () => {
      if (currentIndex < words.length) {
        const displayText = words.slice(0, currentIndex + 1).join(' ');
        
        setMessages(prev => prev.map((msg, idx) => 
          idx === messageIndex 
            ? { ...msg, displayContent: displayText }
            : msg
        ));
        
        currentIndex++;
        setTimeout(animateNextWord, 50); // 50ms delay between words
      } else {
        // Animation complete
        setMessages(prev => prev.map((msg, idx) => 
          idx === messageIndex 
            ? { ...msg, isAnimating: false, displayContent: message.content }
            : msg
        ));
      }
    };
    
    animateNextWord();
  };

  const quickQuestions = [
    {
      icon: Calculator,
      question: "How did you calculate my system size?",
      category: "Calculation"
    },
    {
      icon: Zap,
      question: "Will this system work during load-shedding?",
      category: "Load-shedding"
    },
    {
      icon: HelpCircle,
      question: "What maintenance should I plan for?",
      category: "Maintenance"
    },
    {
      icon: Lightbulb,
      question: "How does this local tool work?",
      category: "Technology"
    }
  ];

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Product information
    if (message.includes('an3s') || message.includes('company') || message.includes('about')) {
      return `AN3S Solar Intelligence is a private, offline-first planning application. Its purpose is to turn locally stored workspace data into a structured solar estimate.

**Our Mission**: To accelerate the adoption of renewable energy through innovative, reliable, and accessible solar solutions.

**Our Impact**:
- 85 MW of solar energy produced annually
- 5 MW operational solar farm
- 123,165 tons of CO₂ emissions prevented annually
- Creating jobs and empowering communities

**Our Services**:
- Residential, commercial, and industrial solar installations
- Custom system design and engineering
- Comprehensive maintenance and support
- High-quality equipment procurement

We're committed to creating a greener, more sustainable future by reducing carbon emissions and empowering communities with clean energy!`;
    }

    // Technology and innovation
    if (message.includes('technology') || message.includes('innovation') || message.includes('ai') || message.includes('monitoring')) {
      return `AN3S Solar Intelligence combines local calculation logic, exported workspace data, and an optional loopback-only language model:

**Advanced AI-Driven Systems**:
- AI-powered monitoring and analytics for system optimization
- Smart diagnostics to predict maintenance needs
- Real-time performance tracking and reporting

**IoT Integration**:
- Internet of Things devices for continuous monitoring
- Remote system diagnostics and troubleshooting
- Automated performance alerts and notifications

**Smart Features**:
- Predictive maintenance to maximize efficiency
- Real-time energy production tracking
- Mobile app integration for system monitoring
- Automated reporting and analytics

Our technology ensures your solar system operates at peak efficiency while providing you with complete visibility into your energy production and savings!`;
    }

    // Maintenance and support
    if (message.includes('maintenance') || message.includes('support') || message.includes('service')) {
      return `Use this checklist when discussing maintenance and support with a qualified installer:

**Routine Maintenance Plans**:
- Scheduled system inspections and cleaning
- Performance optimization checks
- Preventive maintenance to avoid issues

**Smart Diagnostics**:
- AI-powered predictive maintenance
- Early detection of potential problems
- Automated system health monitoring

**Dedicated Support**:
- Transparent communication and personalized service
- Easy-to-access support channels
- Comprehensive FAQs and educational resources
- Professional repair and upgrade services

**Warranty & Protection**:
- Industry-leading warranty coverage
- 24/7 monitoring and support
- Quick response times for issues
- Complete system protection

Our goal is to ensure your solar system operates flawlessly for decades with minimal intervention required from you!`;
    }
    
    if (message.includes('calculate') || message.includes('system size')) {
      return calculation 
        ? `Great question! The local calculator estimated your ${calculation.systemSize}kWp system from these factors:

1. **Energy Consumption**: Your R${calculation.monthlyBill} monthly bill suggests you use about ${Math.round(calculation.monthlyBill / 2.5)} kWh per month.

2. **Location**: ${calculation.location} gets approximately ${getLocationSunHours(calculation.location)} hours of peak sun daily.

3. **Roof Efficiency**: Your ${calculation.roofOrientation} roof orientation provides ${getRoofEfficiencyPercentage(calculation.roofOrientation)}% efficiency.

4. **Load-shedding**: With ${calculation.loadshedding} frequency, I sized your battery at ${calculation.batterySize}kWh for backup power.

The system will generate approximately ${Math.round((calculation.systemSize || 0) * 5.8 * 30)} kWh monthly, covering about 80% of your electricity needs! Our IoT monitoring will track this performance in real-time.`
        : "The local calculator considers South African solar conditions, your location, roof details, and load-shedding pattern. Complete the calculator first so I can explain the resulting estimate.";
    }
    
    if (message.includes('load') || message.includes('shedding')) {
      return `The planning estimate includes battery capacity for South African load-shedding conditions:

**During Load-shedding:**
- Your ${calculation?.batterySize || 'X'}kWh battery provides backup power
- Essential appliances can run for ${Math.round((calculation?.batterySize || 10) / 3)} hours
- Solar panels continue charging batteries during daylight
- IoT monitoring ensures optimal battery management

**Smart Load Management**:
- AI-powered priority system for critical loads
- Automatic switching during outages
- Real-time battery status monitoring
- Predictive power management

**Battery Priority System**:
1. Lights and security (8-12 hours backup)
2. Refrigeration (4-6 hours backup)
3. WiFi/Internet (12+ hours backup)
4. TV and entertainment (3-4 hours backup)

Our advanced monitoring system will send you alerts and optimize your system's performance during load-shedding events!`;
    }
    
    if (message.includes('cost') || message.includes('price') || message.includes('expensive') || message.includes('financing')) {
      return calculation 
        ? `Here is the local planning breakdown for the R${calculation.totalCost?.toLocaleString()} estimate:

**System Breakdown:**
- High-quality solar panels (${calculation.systemSize}kWp): ~R${Math.round((calculation.systemSize || 0) * 12000).toLocaleString()}
- Advanced battery system (${calculation.batterySize}kWh): ~R${Math.round((calculation.batterySize || 0) * 8000).toLocaleString()}
- Professional installation & IoT monitoring: ~R${Math.round((calculation.totalCost || 0) * 0.25).toLocaleString()}

**Financial Benefits:**
- Monthly savings: R${calculation.monthlySavings?.toLocaleString()}
- Payback period: ${calculation.paybackPeriod} years
- 20-year savings: R${((calculation.annualSavings || 0) * 20).toLocaleString()}

**Financing options to verify with a provider:**
- Cash purchase (best ROI)
- Solar loans with partner banks
- Flexible payment plans
- Green energy financing options

Plus, you'll contribute to our mission of preventing CO₂ emissions and supporting renewable energy in South Africa!`
        : "Complete the calculator to produce a local planning estimate. Confirm current equipment pricing, finance terms, and installation scope with qualified providers before making a decision.";
    }
    
    if (message.includes('installation') || message.includes('install')) {
      return `A qualified provider should confirm an installation plan covering these stages:

**Pre-Installation (1-2 weeks):**
- Professional site survey and custom system design
- Regulatory compliance and permit handling
- High-quality equipment procurement from trusted suppliers

**Installation Process (1-3 days):**
- Certified electricians and professional installers
- Roof mounting system and panel installation
- Advanced inverter and battery system setup
- IoT device integration for monitoring

**Post-Installation:**
- Comprehensive system testing and optimization
- AI monitoring system activation
- Customer training and handover
- Warranty registration and support setup

**What Makes Us Different:**
- Adherence to industry standards and regulatory requirements
- Clean-up and debris removal included
- Minimal disruption to your daily routine
- Complete system warranty and ongoing support
- Real-time monitoring from day one

Most installations are completed without any power interruptions to your home!`;
    }

    if (message.includes('environment') || message.includes('impact') || message.includes('carbon') || message.includes('green')) {
      return `Solar can reduce grid electricity demand, but environmental outcomes depend on the installed system and operating conditions:

**Our Environmental Impact:**
- 123,165 tons of CO₂ emissions prevented annually
- 85 MW of clean solar energy produced each year
- Operating a 5 MW solar farm contributing to the grid
- Supporting global renewable energy goals

**Your Environmental Contribution:**
With your ${calculation?.systemSize || 'X'}kWp system, you'll:
- Prevent approximately ${Math.round((calculation?.systemSize || 5) * 1.2)} tons of CO₂ annually
- Generate ${Math.round((calculation?.systemSize || 5) * 1.5 * 365)} kWh of clean energy yearly
- Reduce reliance on fossil fuels
- Contribute to cleaner air and a healthier planet

**Community Benefits:**
- Job creation and economic empowerment
- Local development and skills transfer
- Supporting South Africa's renewable energy transition
- Building a more sustainable future for all

Treat these figures as planning estimates and verify them against the final system design.`;
    }
    
    // Default response
    return `I'm the local AN3S Solar Intelligence advisor. I can explain:

**Technical Information:**
- How your solar calculation was determined using our AI analytics
- Load-shedding solutions with smart technology
- Our advanced IoT monitoring and diagnostics

**Planning workflow:**
- Our comprehensive installation process
- Maintenance plans and smart diagnostics
- Financing options and transparent pricing
- Environmental impact and sustainability

**Company Information:**
- Our 85 MW annual solar energy production
- 123,165 tons of CO₂ emissions prevented
- Our mission to accelerate renewable energy adoption

What specific aspect would you like to know more about?`;
  };

  const getLocationSunHours = (location: string): number => {
    const city = location.toLowerCase();
    if (city.includes('cape town')) return 6.2;
    if (city.includes('johannesburg')) return 5.8;
    if (city.includes('durban')) return 5.5;
    return 5.8;
  };

  const getRoofEfficiencyPercentage = (orientation: string): number => {
    const efficiencies: { [key: string]: number } = {
      'north': 100,
      'north-east': 95,
      'north-west': 95,
      'east': 85,
      'west': 85,
      'south-east': 75,
      'south-west': 75,
      'south': 65
    };
    return efficiencies[orientation.toLowerCase()] || 85;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      displayContent: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const responseContent = generateAIResponse(inputMessage);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent,
        displayContent: '',
        timestamp: new Date(),
        isAnimating: true
      };
      
      setIsTyping(false);
      setMessages(prev => {
        const newMessages = [...prev, aiResponse];
        // Start animation for the new message
        setTimeout(() => animateMessage(aiResponse, newMessages.length - 1), 100);
        return newMessages;
      });
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  if (compact) {
    return (
      <div ref={containerRef} className="h-full flex flex-col bg-[#080A24] overflow-hidden">
        {/* Quick Questions - Compact */}
        {messages.length <= 1 && (
          <div className="p-4 border-b border-[#B2B1B6]/20 flex-shrink-0">
            <p className="text-xs text-[#B2B1B6] mb-3">Quick questions to get started:</p>
            <div className="grid grid-cols-1 gap-2">
              {quickQuestions.map((q, index) => {
                const Icon = q.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(q.question)}
                    className="flex items-center space-x-2 p-2 text-left text-sm bg-[#03041D] hover:bg-[#03041D]/80 rounded-lg transition-colors border border-[#B2B1B6]/20"
                  >
                    <Icon className="w-4 h-4 text-[#48E1FD]" />
                    <span className="text-white">{q.question}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages - Compact */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[85%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-[#48E1FD] text-[#03041D]'
                    : 'bg-[#03041D] text-[#48E1FD] border border-[#B2B1B6]/20'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-[#48E1FD] text-[#03041D]'
                    : 'bg-[#03041D] text-white border border-[#B2B1B6]/20'
                }`}>
                  <p className="text-sm whitespace-pre-line">
                    {message.displayContent || message.content}
                    {message.isAnimating && <span className="animate-pulse">|</span>}
                  </p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-[#03041D]/70' : 'text-[#B2B1B6]'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-7 h-7 bg-[#03041D] rounded-full flex items-center justify-center border border-[#B2B1B6]/20">
                  <Bot className="w-4 h-4 text-[#48E1FD]" />
                </div>
                <div className="bg-[#03041D] p-3 rounded-lg border border-[#B2B1B6]/20">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#48E1FD] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#48E1FD] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#48E1FD] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - Compact */}
        <div className="p-4 border-t border-[#B2B1B6]/20 flex-shrink-0">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about solar..."
              className="flex-1 px-3 py-2 text-sm border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#03041D] text-white placeholder-[#B2B1B6]"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2 bg-[#48E1FD] text-[#03041D] rounded-lg hover:bg-[#48E1FD]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full-size version
  return (
    <div className="bg-[#080A24] rounded-xl shadow-lg h-[600px] flex flex-col border border-[#B2B1B6]/20">
      {/* Header */}
      <div className="p-6 border-b border-[#B2B1B6]/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#03041D] rounded-full flex items-center justify-center border border-[#B2B1B6]/20">
            <Bot className="w-6 h-6 text-[#48E1FD]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Solar Assistant</h2>
            <p className="text-sm text-[#B2B1B6]">Local guidance from AN3S Solar Intelligence</p>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="p-4 border-b border-[#B2B1B6]/20">
          <p className="text-sm text-[#B2B1B6] mb-3">Quick questions to get started:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickQuestions.map((q, index) => {
              const Icon = q.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(q.question)}
                  className="flex items-center space-x-2 p-2 text-left text-sm bg-[#03041D] hover:bg-[#03041D]/80 rounded-lg transition-colors border border-[#B2B1B6]/20"
                >
                  <Icon className="w-4 h-4 text-[#48E1FD]" />
                  <span className="text-white">{q.question}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-[#48E1FD] text-[#03041D]'
                  : 'bg-[#03041D] text-[#48E1FD] border border-[#B2B1B6]/20'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div className={`p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-[#48E1FD] text-[#03041D]'
                  : 'bg-[#03041D] text-white border border-[#B2B1B6]/20'
              }`}>
                <p className="text-sm whitespace-pre-line">
                  {message.displayContent || message.content}
                  {message.isAnimating && <span className="animate-pulse">|</span>}
                </p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-[#03041D]/70' : 'text-[#B2B1B6]'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-[#03041D] rounded-full flex items-center justify-center border border-[#B2B1B6]/20">
                <Bot className="w-4 h-4 text-[#48E1FD]" />
              </div>
              <div className="bg-[#03041D] p-3 rounded-lg border border-[#B2B1B6]/20">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#48E1FD] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#48E1FD] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#48E1FD] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#B2B1B6]/20">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about solar energy..."
            className="flex-1 px-4 py-2 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#03041D] text-white placeholder-[#B2B1B6]"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-2 bg-[#48E1FD] text-[#03041D] rounded-lg hover:bg-[#48E1FD]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
