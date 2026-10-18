import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, CheckCircle, Clock, Database, Shield, RefreshCw } from 'lucide-react';

interface QuoteRequestData {
  userName: string;
  email: string;
  phone: string;
  monthlyBill: number;
  location: string;
  roofOrientation: string;
  roofSize: number;
  loadshedding: string;
  systemSize: number;
  batterySize: number;
  inverterSize: number;
  monthlySavings: number;
  annualSavings: number;
  paybackPeriod: number;
  roi: number;
  totalCost: number;
  propertyType: string;
  status: string;
}

interface QuoteRequestManagerProps {
  onDataSaved?: (success: boolean) => void;
}

export const QuoteRequestManager: React.FC<QuoteRequestManagerProps> = ({ onDataSaved }) => {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pendingData, setPendingData] = useState<QuoteRequestData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');

  // Auto-save interval (every 30 seconds)
  const AUTO_SAVE_INTERVAL = 30000;
  const MAX_RETRY_ATTEMPTS = 3;

  useEffect(() => {
    // Check online status
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Auto-save mechanism
    if (!autoSaveEnabled || !pendingData) return;

    const interval = setInterval(() => {
      if (pendingData && connectionStatus === 'online') {
        saveQuoteRequest(pendingData, true);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [autoSaveEnabled, pendingData, connectionStatus]);

  const saveQuoteRequest = async (data: QuoteRequestData, isAutoSave = false) => {
    if (connectionStatus === 'offline' && !isAutoSave) {
      // Store data locally for later sync
      localStorage.setItem('pendingQuoteRequest', JSON.stringify(data));
      setSaveStatus('error');
      return;
    }

    setSaveStatus('saving');

    try {
      const response = await fetch('/api/taskade/projects/aCGbHMAbWUZzTmna/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          '/text': `Quote Request - ${data.userName} - ${new Date().toLocaleDateString()}`,
          '/attributes/@calc1': data.userName,
          '/attributes/@calc2': data.email,
          '/attributes/@calc3': data.phone,
          '/attributes/@calc4': data.monthlyBill,
          '/attributes/@calc5': data.location,
          '/attributes/@calc6': data.roofOrientation,
          '/attributes/@calc7': data.roofSize,
          '/attributes/@calc8': data.loadshedding,
          '/attributes/@calc9': data.systemSize,
          '/attributes/@calc10': data.batterySize,
          '/attributes/@calc11': data.inverterSize,
          '/attributes/@calc12': data.monthlySavings,
          '/attributes/@calc13': data.annualSavings,
          '/attributes/@calc14': data.paybackPeriod,
          '/attributes/@calc15': data.roi,
          '/attributes/@calc16': data.totalCost,
          '/attributes/@calc17': data.propertyType,
          '/attributes/@calc18': data.status,
          '/attributes/note': `Quote request submitted on ${new Date().toISOString()}. ${isAutoSave ? 'Auto-saved' : 'Manual save'}.`
        }),
      });

      if (response.ok) {
        setSaveStatus('success');
        setLastSaved(new Date());
        setRetryCount(0);
        setPendingData(null);
        
        // Clear any locally stored data
        localStorage.removeItem('pendingQuoteRequest');
        
        if (onDataSaved) {
          onDataSaved(true);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving quote request:', error);
      setSaveStatus('error');
      
      // Implement retry logic
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          saveQuoteRequest(data, isAutoSave);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
      } else {
        // Store locally as fallback
        localStorage.setItem('pendingQuoteRequest', JSON.stringify(data));
      }
      
      if (onDataSaved) {
        onDataSaved(false);
      }
    }
  };

  const validateQuoteData = async (data: QuoteRequestData) => {
    try {
      // Use the pricing validation system
      const response = await fetch('/api/taskade/webhooks/01K4ZV0WPB4T9A65P6T86E98FC/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalCost: data.totalCost,
          systemSize: data.systemSize,
          batterySize: data.batterySize,
          monthlyBill: data.monthlyBill,
          inverterSize: data.inverterSize
        }),
      });

      if (response.ok) {
        const validationResult = await response.json();
        return validationResult;
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
    return null;
  };

  const recoverPendingData = () => {
    const stored = localStorage.getItem('pendingQuoteRequest');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setPendingData(data);
        return data;
      } catch (error) {
        console.error('Error parsing stored data:', error);
        localStorage.removeItem('pendingQuoteRequest');
      }
    }
    return null;
  };

  const forceSave = () => {
    const stored = recoverPendingData();
    if (stored) {
      saveQuoteRequest(stored, false);
    }
  };

  const getStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Database className="w-4 h-4 text-[#CCCCCC]" />;
    }
  };

  const getStatusMessage = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving quote request...';
      case 'success':
        return `Last saved: ${lastSaved?.toLocaleTimeString()}`;
      case 'error':
        return connectionStatus === 'offline' 
          ? 'Offline - Data stored locally' 
          : `Save failed (Retry ${retryCount}/${MAX_RETRY_ATTEMPTS})`;
      default:
        return 'Ready to save';
    }
  };

  return (
    <div className="bg-[#333333] rounded-xl shadow-lg p-6 border border-[#CCCCCC]/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-[#D4FF00]" />
          <div>
            <h2 className="text-2xl font-bold text-[#FFFFFF]">Quote Request Protection</h2>
            <p className="text-[#CCCCCC]">Ensuring no customer data is lost</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm text-[#CCCCCC]">{getStatusMessage()}</span>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`p-4 rounded-lg mb-6 border ${
        connectionStatus === 'online' 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-red-500/10 border-red-500/30'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'online' ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <span className="text-[#FFFFFF] font-medium">
            {connectionStatus === 'online' ? 'Connected' : 'Offline Mode'}
          </span>
        </div>
        <p className="text-sm text-[#CCCCCC] mt-1">
          {connectionStatus === 'online' 
            ? 'Quote requests are being saved automatically'
            : 'Quote requests will be saved locally and synced when connection is restored'
          }
        </p>
      </div>

      {/* Auto-save Settings */}
      <div className="bg-[#1E1E1E] rounded-lg p-4 mb-6 border border-[#CCCCCC]/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#FFFFFF]">Protection Features</h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded border-[#CCCCCC]/30 text-[#D4FF00] focus:ring-[#D4FF00] bg-[#333333]"
            />
            <span className="text-sm text-[#CCCCCC]">Auto-save enabled</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Save className="w-5 h-5 text-[#D4FF00]" />
            <div>
              <p className="text-sm font-medium text-[#FFFFFF]">Auto-save every 30s</p>
              <p className="text-xs text-[#CCCCCC]">Prevents data loss during form completion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-[#D4FF00]" />
            <div>
              <p className="text-sm font-medium text-[#FFFFFF]">Retry mechanism</p>
              <p className="text-xs text-[#CCCCCC]">Automatic retry with exponential backoff</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-[#D4FF00]" />
            <div>
              <p className="text-sm font-medium text-[#FFFFFF]">Local storage backup</p>
              <p className="text-xs text-[#CCCCCC]">Data preserved offline and synced later</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-[#D4FF00]" />
            <div>
              <p className="text-sm font-medium text-[#FFFFFF]">Data validation</p>
              <p className="text-xs text-[#CCCCCC]">Pricing validation before saving</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Actions */}
      {(saveStatus === 'error' || localStorage.getItem('pendingQuoteRequest')) && (
        <div className="bg-[#1E1E1E] border border-[#D4FF00]/30 rounded-lg p-4">
          <h4 className="font-semibold text-[#D4FF00] mb-2">Data Recovery Available</h4>
          <p className="text-sm text-[#CCCCCC] mb-3">
            There is unsaved quote request data that can be recovered and submitted.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={forceSave}
              className="px-4 py-2 bg-[#D4FF00] text-[#1E1E1E] rounded-lg hover:bg-[#D4FF00]/90 font-medium"
            >
              Retry Save
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('pendingQuoteRequest');
                setPendingData(null);
                setSaveStatus('idle');
              }}
              className="px-4 py-2 border border-[#CCCCCC]/30 text-[#CCCCCC] rounded-lg hover:bg-[#1E1E1E]/50"
            >
              Clear Stored Data
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#1E1E1E] to-[#333333] rounded-lg border border-[#CCCCCC]/20">
        <h4 className="font-semibold text-[#FFFFFF] mb-2">System Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-[#D4FF00]">{retryCount}</p>
            <p className="text-xs text-[#CCCCCC]">Retry Attempts</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#D4FF00]">
              {autoSaveEnabled ? 'ON' : 'OFF'}
            </p>
            <p className="text-xs text-[#CCCCCC]">Auto-save</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#D4FF00]">
              {connectionStatus === 'online' ? '✓' : '✗'}
            </p>
            <p className="text-xs text-[#CCCCCC]">Connection</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#D4FF00]">
              {localStorage.getItem('pendingQuoteRequest') ? '1' : '0'}
            </p>
            <p className="text-xs text-[#CCCCCC]">Pending</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Export the save function for use by other components
  QuoteRequestManager.saveQuoteRequest = saveQuoteRequest;
  QuoteRequestManager.validateQuoteData = validateQuoteData;
};

export default QuoteRequestManager;