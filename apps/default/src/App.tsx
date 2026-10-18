import React, { useState } from 'react';
import { MessageCircle, Calculator, Sun, Zap, Shield, TrendingUp, Settings, Activity, FileText } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import EnhancedSolarCalculator from './components/EnhancedSolarCalculator';
import QuoteRequestManager from './components/QuoteRequestManager';
import ProductRecommendations from './components/ProductRecommendations';
import StatsBar from './components/StatsBar';
import SystemStatusChecker from './components/SystemStatusChecker';

export interface CalculatorResults {
  systemSize: number;
  monthlySavings: number;
  annualSavings: number;
  systemCost: number;
  paybackPeriod: number;
  roi: number;
  batterySize: number;
  inverterSize: number;
}

export interface CalculatorData {
  monthlyBill: number;
  location: string;
  roofSize: number;
  roofOrientation: string;
  loadshedding: string;
  propertyType: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'main' | 'products' | 'admin' | 'status'>('main');
  const [calculatorResults, setCalculatorResults] = useState<CalculatorResults | null>(null);
  const [calculatorData, setCalculatorData] = useState<CalculatorData | null>(null);
  const [showQuoteManager, setShowQuoteManager] = useState(false);

  const handleViewProducts = (results: CalculatorResults, data: CalculatorData) => {
    setCalculatorResults(results);
    setCalculatorData(data);
    setCurrentView('products');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  const handleDataSaved = (success: boolean) => {
    if (success) {
      console.log('Quote request saved successfully');
    } else {
      console.log('Quote request save failed - data preserved locally');
    }
  };

  if (currentView === 'products' && calculatorResults && calculatorData) {
    return (
      <ProductRecommendations 
        results={calculatorResults}
        calculatorData={calculatorData}
        onBack={handleBackToMain}
      />
    );
  }

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-[#1E1E1E]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,255,0,0.05),transparent_50%)]"></div>
        
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={handleBackToMain}
                className="w-10 h-10 bg-[#333333]/80 hover:bg-[#333333] rounded-full flex items-center justify-center transition-colors"
              >
                ←
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">System Administration</h1>
                <p className="text-[#CCCCCC]">Quote request protection and data management</p>
              </div>
            </div>
            
            <QuoteRequestManager onDataSaved={handleDataSaved} />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'status') {
    return (
      <div className="min-h-screen bg-[#1E1E1E]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,255,0,0.05),transparent_50%)]"></div>
        
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={handleBackToMain}
                className="w-10 h-10 bg-[#333333]/80 hover:bg-[#333333] rounded-full flex items-center justify-center transition-colors"
              >
                ←
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">System Status Monitor</h1>
                <p className="text-[#CCCCCC]">Real-time AI agent and system connectivity status</p>
              </div>
            </div>
            
            <SystemStatusChecker />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,255,0,0.05),transparent_50%)]"></div>
      
      <div className="relative z-10">
        <StatsBar />
        
        {/* Admin Access Buttons */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setCurrentView('status')}
            className="w-10 h-10 bg-[#333333]/80 hover:bg-[#333333] rounded-full flex items-center justify-center transition-colors border border-[#D4FF00]/20"
            title="System Status Monitor"
          >
            <Activity className="w-5 h-5 text-[#D4FF00]" />
          </button>
          <button
            onClick={() => setCurrentView('admin')}
            className="w-10 h-10 bg-[#333333]/80 hover:bg-[#333333] rounded-full flex items-center justify-center transition-colors border border-[#D4FF00]/20"
            title="System Administration"
          >
            <Settings className="w-5 h-5 text-[#D4FF00]" />
          </button>
        </div>
        
        <main className="container mx-auto px-4 py-6">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <img 
                src="https://iili.io/KCmL5yg.png" 
                alt="IO Green Logo" 
                className="h-32 mx-auto object-contain"
              />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              AI <span className="text-[#D4FF00]">Solar Calculator</span>
            </h1>
            <p className="text-xl text-[#CCCCCC] max-w-2xl mx-auto mb-6">
              Powering South Africa's Future with Sustainable Solar Solutions
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[#CCCCCC]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D4FF00]" />
                <span>85 MW Annual Output</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D4FF00]" />
                <span>20+ Years Experience</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D4FF00]" />
                <span>123,165 Tons CO₂ Reduced</span>
              </div>
            </div>
          </div>

          {/* Data Protection Notice - Aligned with reference blocks */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-[#333333]/50 backdrop-blur-sm rounded-2xl border border-[#D4FF00]/20 p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#D4FF00]" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">AI Systems & Data Protection Enabled</h3>
                  <p className="text-xs text-[#CCCCCC]">
                    AI agents are operational with full knowledge access. Real-time pricing validation and auto-save protection active.
                  </p>
                </div>
                <button
                  onClick={() => setShowQuoteManager(!showQuoteManager)}
                  className="text-xs text-[#D4FF00] hover:text-[#D4FF00]/80 font-medium"
                >
                  {showQuoteManager ? 'Hide' : 'Show'} Details
                </button>
              </div>
            </div>
          </div>

          {/* Quote Request Manager (Collapsible) - Aligned with reference blocks */}
          {showQuoteManager && (
            <div className="max-w-6xl mx-auto mb-8">
              <QuoteRequestManager onDataSaved={handleDataSaved} />
            </div>
          )}

          {/* Main Interface - Increased height and reduced width to align with reference blocks */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Chat Interface - Left Side - Increased height */}
            <div className="flex flex-col">
              <div className="bg-[#333333]/80 backdrop-blur-sm rounded-3xl border border-[#D4FF00]/20 shadow-2xl shadow-[#D4FF00]/10 overflow-hidden h-[800px] flex flex-col">
                <div className="border-b border-[#D4FF00]/20 p-6 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#D4FF00] rounded-full animate-pulse"></div>
                    <h2 className="text-xl font-semibold text-white">AI Solar Consultant</h2>
                    <span className="text-sm text-[#1E1E1E] bg-[#D4FF00] px-3 py-1 rounded-full font-medium">Online</span>
                  </div>
                  <p className="text-[#CCCCCC] mt-2">Get expert advice with full knowledge base access</p>
                </div>
                <div className="flex-1 min-h-0">
                  <ChatInterface />
                </div>
              </div>
              
              {/* Get Quote Button */}
              <div className="mt-6">
                <button className="w-full bg-[#D4FF00] text-[#1E1E1E] px-8 py-4 rounded-2xl hover:bg-[#D4FF00]/90 transition-all duration-300 shadow-lg shadow-[#D4FF00]/25 text-lg font-bold">
                  Get Professional Quote
                </button>
              </div>
            </div>

            {/* Enhanced Solar Calculator - Right Side - Increased height and renamed */}
            <div className="flex flex-col">
              <div className="bg-[#333333]/80 backdrop-blur-sm rounded-3xl border border-[#D4FF00]/20 shadow-2xl shadow-[#D4FF00]/10 overflow-hidden h-[800px] flex flex-col">
                <div className="border-b border-[#D4FF00]/20 p-6 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#D4FF00]" />
                    <h2 className="text-xl font-semibold text-white">Solar Calculator Form</h2>
                  </div>
                  <p className="text-[#CCCCCC] mt-2">AI-powered with real-time pricing validation</p>
                </div>
                <div className="flex-1 min-h-0">
                  <EnhancedSolarCalculator onViewProducts={handleViewProducts} />
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid - Reference blocks for alignment */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
            <div className="bg-[#333333]/50 backdrop-blur-sm rounded-2xl border border-[#D4FF00]/10 p-6 hover:border-[#D4FF00]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-[#D4FF00]/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#D4FF00]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Solutions</h3>
              <p className="text-[#CCCCCC] text-sm">Intelligent recommendations with real-time knowledge base access and pricing validation.</p>
            </div>
            
            <div className="bg-[#333333]/50 backdrop-blur-sm rounded-2xl border border-[#D4FF00]/10 p-6 hover:border-[#D4FF00]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-[#D4FF00]/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-[#D4FF00]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Validation</h3>
              <p className="text-[#CCCCCC] text-sm">Live pricing checks and system validation ensure accurate quotes every time.</p>
            </div>
            
            <div className="bg-[#333333]/50 backdrop-blur-sm rounded-2xl border border-[#D4FF00]/10 p-6 hover:border-[#D4FF00]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-[#D4FF00]/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#D4FF00]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Data Protection</h3>
              <p className="text-[#CCCCCC] text-sm">Advanced auto-save and recovery system with full operational monitoring.</p>
            </div>
          </div>

          {/* System Status Footer - Increased width to match reference blocks */}
          <div className="mt-12 max-w-6xl mx-auto">
            <div className="bg-[#333333]/30 backdrop-blur-sm rounded-xl border border-[#D4FF00]/10 p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-[#CCCCCC]">AI Agent Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-[#CCCCCC]">Knowledge Base Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-[#CCCCCC]">Pricing Validation Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-[#CCCCCC]">Real-time Sync</span>
                  </div>
                </div>
                <div className="text-[#CCCCCC]">
                  System Status: <span className="text-[#D4FF00] font-medium">All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;