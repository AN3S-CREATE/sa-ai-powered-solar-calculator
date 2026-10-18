import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, RefreshCw, Database, Bot, Zap, Shield, Wifi, WifiOff } from 'lucide-react';

interface SystemStatus {
  database: 'online' | 'offline' | 'checking';
  pricingValidation: 'online' | 'offline' | 'checking';
  aiAgent: 'online' | 'offline' | 'checking';
  knowledgeBase: 'online' | 'offline' | 'checking';
  realTimeConnection: 'online' | 'offline' | 'checking';
}

interface SystemCheck {
  name: string;
  status: 'online' | 'offline' | 'checking';
  icon: React.ComponentType<any>;
  description: string;
  lastChecked?: Date;
  responseTime?: number;
}

const SystemStatusChecker: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'checking',
    pricingValidation: 'checking',
    aiAgent: 'checking',
    knowledgeBase: 'checking',
    realTimeConnection: 'checking'
  });

  const [isChecking, setIsChecking] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null);

  // Test database connectivity
  const checkDatabase = async (): Promise<{ status: 'online' | 'offline', responseTime: number }> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/taskade/projects/aCGbHMAbWUZzTmna/nodes', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const responseTime = Date.now() - startTime;
      return { status: response.ok ? 'online' : 'offline', responseTime };
    } catch (error) {
      return { status: 'offline', responseTime: Date.now() - startTime };
    }
  };

  // Test pricing validation system
  const checkPricingValidation = async (): Promise<{ status: 'online' | 'offline', responseTime: number }> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/taskade/webhooks/01K4ZV0WPB4T9A65P6T86E98FC/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalCost: 100000,
          systemSize: 5,
          batterySize: 10,
          monthlyBill: 2000,
          inverterSize: 5
        })
      });
      const responseTime = Date.now() - startTime;
      return { status: response.ok ? 'online' : 'offline', responseTime };
    } catch (error) {
      return { status: 'offline', responseTime: Date.now() - startTime };
    }
  };

  // Test AI agent knowledge loading
  const checkAIAgent = async (): Promise<{ status: 'online' | 'offline', responseTime: number }> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/taskade/webhooks/01K50T1N2GV55SCBF0QXY56ZT2/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Solar system status check'
        })
      });
      const responseTime = Date.now() - startTime;
      return { status: response.ok ? 'online' : 'offline', responseTime };
    } catch (error) {
      return { status: 'offline', responseTime: Date.now() - startTime };
    }
  };

  // Test component pricing database
  const checkKnowledgeBase = async (): Promise<{ status: 'online' | 'offline', responseTime: number }> => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/taskade/projects/1q5m78aS38jzufAu/nodes', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const responseTime = Date.now() - startTime;
      return { status: response.ok ? 'online' : 'offline', responseTime };
    } catch (error) {
      return { status: 'offline', responseTime: Date.now() - startTime };
    }
  };

  // Test real-time connection
  const checkRealTimeConnection = async (): Promise<{ status: 'online' | 'offline', responseTime: number }> => {
    const startTime = Date.now();
    try {
      // Test WebSocket or real-time endpoint
      const response = await fetch('/api/taskade/projects/riGaYZx337LNfa2c/nodes', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const responseTime = Date.now() - startTime;
      return { status: response.ok ? 'online' : 'offline', responseTime };
    } catch (error) {
      return { status: 'offline', responseTime: Date.now() - startTime };
    }
  };

  // Run comprehensive system check
  const runSystemCheck = async () => {
    setIsChecking(true);
    
    // Set all to checking state
    setSystemStatus({
      database: 'checking',
      pricingValidation: 'checking',
      aiAgent: 'checking',
      knowledgeBase: 'checking',
      realTimeConnection: 'checking'
    });

    try {
      // Run all checks in parallel
      const [dbResult, pricingResult, aiResult, knowledgeResult, realtimeResult] = await Promise.all([
        checkDatabase(),
        checkPricingValidation(),
        checkAIAgent(),
        checkKnowledgeBase(),
        checkRealTimeConnection()
      ]);

      // Update status
      setSystemStatus({
        database: dbResult.status,
        pricingValidation: pricingResult.status,
        aiAgent: aiResult.status,
        knowledgeBase: knowledgeResult.status,
        realTimeConnection: realtimeResult.status
      });

      setLastFullCheck(new Date());
    } catch (error) {
      console.error('System check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-check on component mount
  useEffect(() => {
    runSystemCheck();
    
    // Set up periodic checks every 30 seconds
    const interval = setInterval(runSystemCheck, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: 'online' | 'offline' | 'checking') => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'offline':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: 'online' | 'offline' | 'checking') => {
    switch (status) {
      case 'online':
        return 'text-green-400';
      case 'offline':
        return 'text-red-400';
      case 'checking':
        return 'text-blue-400';
    }
  };

  const systemChecks: SystemCheck[] = [
    {
      name: 'Solar Calculator Database',
      status: systemStatus.database,
      icon: Database,
      description: 'Customer data and calculations storage'
    },
    {
      name: 'Pricing Validation System',
      status: systemStatus.pricingValidation,
      icon: Shield,
      description: 'Real-time cost verification and validation'
    },
    {
      name: 'AI Solar Agent',
      status: systemStatus.aiAgent,
      icon: Bot,
      description: 'Intelligent solar consultation and recommendations'
    },
    {
      name: 'Component Knowledge Base',
      status: systemStatus.knowledgeBase,
      icon: Zap,
      description: 'Solar component pricing and specifications'
    },
    {
      name: 'Real-time Connection',
      status: systemStatus.realTimeConnection,
      icon: systemStatus.realTimeConnection === 'online' ? Wifi : WifiOff,
      description: 'Live data synchronization and updates'
    }
  ];

  const allSystemsOnline = Object.values(systemStatus).every(status => status === 'online');
  const anySystemOffline = Object.values(systemStatus).some(status => status === 'offline');

  return (
    <div className="bg-[#333333]/80 backdrop-blur-sm rounded-2xl border border-[#D4FF00]/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            allSystemsOnline ? 'bg-green-400' : 
            anySystemOffline ? 'bg-red-400' : 
            'bg-blue-400 animate-pulse'
          }`} />
          <h2 className="text-xl font-bold text-white">System Status Monitor</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastFullCheck && (
            <span className="text-sm text-[#CCCCCC]">
              Last check: {lastFullCheck.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={runSystemCheck}
            disabled={isChecking}
            className="px-4 py-2 bg-[#D4FF00] text-[#1E1E1E] rounded-lg hover:bg-[#D4FF00]/90 disabled:opacity-50 font-medium flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Now'}
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded-lg mb-6 border ${
        allSystemsOnline 
          ? 'bg-green-500/10 border-green-500/30' 
          : anySystemOffline 
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-blue-500/10 border-blue-500/30'
      }`}>
        <div className="flex items-center gap-2">
          {getStatusIcon(allSystemsOnline ? 'online' : anySystemOffline ? 'offline' : 'checking')}
          <span className="text-white font-semibold">
            {allSystemsOnline 
              ? 'All Systems Operational' 
              : anySystemOffline 
                ? 'System Issues Detected'
                : 'System Check in Progress'
            }
          </span>
        </div>
        <p className="text-sm text-[#CCCCCC] mt-1">
          {allSystemsOnline 
            ? 'AI agents, databases, and real-time connections are fully operational'
            : anySystemOffline 
              ? 'Some systems are experiencing issues - check details below'
              : 'Running comprehensive system diagnostics...'
          }
        </p>
      </div>

      {/* Individual System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemChecks.map((check, index) => {
          const Icon = check.icon;
          return (
            <div key={index} className="bg-[#1E1E1E] rounded-lg p-4 border border-[#CCCCCC]/20">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${getStatusColor(check.status)}`} />
                <h3 className="font-semibold text-white text-sm">{check.name}</h3>
              </div>
              <p className="text-xs text-[#CCCCCC] mb-3">{check.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  <span className={`text-sm font-medium ${getStatusColor(check.status)}`}>
                    {check.status === 'online' ? 'Online' : 
                     check.status === 'offline' ? 'Offline' : 'Checking...'}
                  </span>
                </div>
                {check.responseTime && (
                  <span className="text-xs text-[#CCCCCC]">
                    {check.responseTime}ms
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Agent Details */}
      <div className="mt-6 p-4 bg-[#1E1E1E] rounded-lg border border-[#D4FF00]/20">
        <h3 className="font-semibold text-[#D4FF00] mb-2 flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Agent Status Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#CCCCCC] mb-1">Agent Name:</p>
            <p className="text-white font-medium">Solar Knowledge Test Agent</p>
          </div>
          <div>
            <p className="text-[#CCCCCC] mb-1">Agent ID:</p>
            <p className="text-white font-mono text-xs">01K50T1A1F12Z63DDM6SE1HZV9</p>
          </div>
          <div>
            <p className="text-[#CCCCCC] mb-1">Knowledge Access:</p>
            <p className={`font-medium ${systemStatus.knowledgeBase === 'online' ? 'text-green-400' : 'text-red-400'}`}>
              {systemStatus.knowledgeBase === 'online' ? 'Full Access' : 'Limited Access'}
            </p>
          </div>
          <div>
            <p className="text-[#CCCCCC] mb-1">Real-time Updates:</p>
            <p className={`font-medium ${systemStatus.realTimeConnection === 'online' ? 'text-green-400' : 'text-red-400'}`}>
              {systemStatus.realTimeConnection === 'online' ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>

      {/* Connection Quality Indicator */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              systemStatus.database === 'online' ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-[#CCCCCC]">Database</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              systemStatus.pricingValidation === 'online' ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-[#CCCCCC]">Pricing API</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              systemStatus.aiAgent === 'online' ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-[#CCCCCC]">AI Agent</span>
          </div>
        </div>
        <div className="text-[#CCCCCC]">
          Auto-refresh: 30s
        </div>
      </div>
    </div>
  );
};

export default SystemStatusChecker;