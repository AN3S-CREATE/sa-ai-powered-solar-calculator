import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, RefreshCw, Database, Bot, Zap, Shield, Wifi, WifiOff } from 'lucide-react';
import agents from '../data/agents.json';
import { dataReady, getProjectRows, getWorkspaceSnapshot } from '../lib/genesis-data/client';
import { runFlow } from '../lib/genesis-flows/client';

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
      await dataReady;
      getWorkspaceSnapshot();
      const responseTime = Date.now() - startTime;
      return { status: 'online', responseTime };
    } catch (error) {
      return { status: 'offline', responseTime: Date.now() - startTime };
    }
  };

  // Test pricing validation system
  const checkPricingValidation = async (): Promise<{ status: 'online' | 'offline', responseTime: number }> => {
    const startTime = Date.now();
    try {
      await runFlow('01K4ZV0WPB4T9A65P6T86E98FC', {
        totalCost: 100000,
        systemSize: 5,
        batterySize: 10,
        monthlyBill: 2000,
        inverterSize: 5,
      });
      const responseTime = Date.now() - startTime;
      return { status: 'online', responseTime };
    } catch (error) {
      return { status: 'offline', responseTime: Date.now() - startTime };
    }
  };

  // Test AI agent knowledge loading
  const checkAIAgent = async (): Promise<{ status: 'online' | 'offline', responseTime: number }> => {
    const startTime = Date.now();
    try {
      if (!Array.isArray(agents) || agents.length === 0) throw new Error('No local agents.');
      const responseTime = Date.now() - startTime;
      return { status: 'online', responseTime };
    } catch (error) {
      return { status: 'offline', responseTime: Date.now() - startTime };
    }
  };

  // Test component pricing database
  const checkKnowledgeBase = async (): Promise<{ status: 'online' | 'offline', responseTime: number }> => {
    const startTime = Date.now();
    try {
      const rows = getProjectRows('1q5m78aS38jzufAu');
      if (rows.length === 0) throw new Error('Pricing seed is empty.');
      const responseTime = Date.now() - startTime;
      return { status: 'online', responseTime };
    } catch (error) {
      return { status: 'offline', responseTime: Date.now() - startTime };
    }
  };

  // Test real-time connection
  const checkRealTimeConnection = async (): Promise<{ status: 'online' | 'offline', responseTime: number }> => {
    const startTime = Date.now();
    try {
      let observed = false;
      const listener = () => {
        observed = true;
      };
      window.addEventListener('genesis-data-updated', listener, { once: true });
      window.dispatchEvent(new CustomEvent('genesis-data-updated', { detail: { projectId: 'status-check' } }));
      window.removeEventListener('genesis-data-updated', listener);
      const responseTime = Date.now() - startTime;
      return { status: observed ? 'online' : 'offline', responseTime };
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
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'offline':
        return <AlertTriangle className="h-5 w-5 text-danger" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 animate-spin text-cyan" />;
    }
  };

  const getStatusColor = (status: 'online' | 'offline' | 'checking') => {
    switch (status) {
      case 'online':
        return 'text-success';
      case 'offline':
        return 'text-danger';
      case 'checking':
        return 'text-cyan';
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
      description: 'Deterministic local cost verification and validation'
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
      name: 'Local Update Bus',
      status: systemStatus.realTimeConnection,
      icon: systemStatus.realTimeConnection === 'online' ? Wifi : WifiOff,
      description: 'In-browser data-change notifications'
    }
  ];

  const allSystemsOnline = Object.values(systemStatus).every(status => status === 'online');
  const anySystemOffline = Object.values(systemStatus).some(status => status === 'offline');

  return (
    <section className="an3s-panel p-5 sm:p-6" data-tone="blue">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${
            allSystemsOnline ? 'bg-success' :
            anySystemOffline ? 'bg-danger' :
            'animate-pulse bg-cyan'
          }`} />
          <h2 className="text-xl font-bold text-ink">Local system status</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastFullCheck && (
            <span className="text-sm text-ink-muted">
              Last check: {lastFullCheck.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={runSystemCheck}
            disabled={isChecking}
            className="an3s-action-primary flex items-center gap-2 px-4 py-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Now'}
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`mb-6 border-y p-4 ${
        allSystemsOnline 
          ? 'border-success/30 bg-success/10'
          : anySystemOffline 
            ? 'border-danger/30 bg-danger/10'
            : 'border-cyan/30 bg-cyan/10'
      }`}>
        <div className="flex items-center gap-2">
          {getStatusIcon(allSystemsOnline ? 'online' : anySystemOffline ? 'offline' : 'checking')}
          <span className="font-semibold text-ink">
            {allSystemsOnline 
              ? 'All Systems Operational' 
              : anySystemOffline 
                ? 'System Issues Detected'
                : 'System Check in Progress'
            }
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          {allSystemsOnline 
            ? 'Local agents, storage, pricing data, and update events are operational'
            : anySystemOffline 
              ? 'Some systems are experiencing issues - check details below'
              : 'Running comprehensive system diagnostics...'
          }
        </p>
      </div>

      {/* Individual System Status */}
      <div className="divide-y divide-line border-y border-line md:grid md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-3">
        {systemChecks.map((check, index) => {
          const Icon = check.icon;
          return (
            <div key={index} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-5 h-5 ${getStatusColor(check.status)}`} />
                <h3 className="text-sm font-semibold text-ink">{check.name}</h3>
              </div>
              <p className="mb-3 text-xs text-ink-muted">{check.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  <span className={`text-sm font-medium ${getStatusColor(check.status)}`}>
                    {check.status === 'online' ? 'Online' : 
                     check.status === 'offline' ? 'Offline' : 'Checking...'}
                  </span>
                </div>
                {check.responseTime && (
                  <span className="text-xs text-ink-muted">
                    {check.responseTime}ms
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Agent Details */}
      <div className="mt-6 border-t border-line pt-5">
        <h3 className="mb-2 flex items-center gap-2 font-semibold text-cyan-glow">
          <Bot className="w-5 h-5" />
          AI Agent Status Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="mb-1 text-ink-muted">Agent name:</p>
            <p className="font-medium text-ink">Solar Knowledge Test Agent</p>
          </div>
          <div>
            <p className="mb-1 text-ink-muted">Agent ID:</p>
            <p className="font-mono text-xs text-ink">01K50T1A1F12Z63DDM6SE1HZV9</p>
          </div>
          <div>
            <p className="mb-1 text-ink-muted">Knowledge access:</p>
            <p className={`font-medium ${systemStatus.knowledgeBase === 'online' ? 'text-success' : 'text-danger'}`}>
              {systemStatus.knowledgeBase === 'online' ? 'Full Access' : 'Limited Access'}
            </p>
          </div>
          <div>
            <p className="mb-1 text-ink-muted">Local updates:</p>
            <p className={`font-medium ${systemStatus.realTimeConnection === 'online' ? 'text-success' : 'text-danger'}`}>
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
              systemStatus.database === 'online' ? 'bg-success' : 'bg-danger'
            }`} />
            <span className="text-ink-muted">Database</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              systemStatus.pricingValidation === 'online' ? 'bg-success' : 'bg-danger'
            }`} />
            <span className="text-ink-muted">Pricing flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              systemStatus.aiAgent === 'online' ? 'bg-success' : 'bg-danger'
            }`} />
            <span className="text-ink-muted">AI agent</span>
          </div>
        </div>
        <div className="text-ink-muted">
          Auto-refresh: 30s
        </div>
      </div>
    </section>
  );
};

export default SystemStatusChecker;
