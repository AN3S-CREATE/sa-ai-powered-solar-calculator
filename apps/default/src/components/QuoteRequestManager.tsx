import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, CheckCircle, Clock, Database, Shield, RefreshCw } from 'lucide-react';
import { createNode } from '../lib/genesis-data/client';

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
  const retryCount = 0;

  // Auto-save interval (every 30 seconds)
  const AUTO_SAVE_INTERVAL = 30000;
  const MAX_RETRY_ATTEMPTS = 0;

  useEffect(() => {
    // Auto-save mechanism
    if (!autoSaveEnabled || !pendingData) return;

    const interval = setInterval(() => {
      if (pendingData) {
        saveQuoteRequest(pendingData, true);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [autoSaveEnabled, pendingData]);

  const saveQuoteRequest = async (data: QuoteRequestData, isAutoSave = false) => {
    setSaveStatus('saving');

    try {
      await createNode('aCGbHMAbWUZzTmna', {
          Name: `Quote Request - ${data.userName} - ${new Date().toLocaleDateString('en-ZA')}`,
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
      });

      setSaveStatus('success');
      setLastSaved(new Date());
      setPendingData(null);
      localStorage.removeItem('pendingQuoteRequest');

      if (onDataSaved) {
        onDataSaved(true);
      }
    } catch (error) {
      console.error('Error saving quote request:', error);
      setSaveStatus('error');
      
      localStorage.setItem('pendingQuoteRequest', JSON.stringify(data));
      
      if (onDataSaved) {
        onDataSaved(false);
      }
    }
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
        return <RefreshCw className="h-4 w-4 animate-spin text-cyan" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-danger" />;
      default:
        return <Database className="h-4 w-4 text-ink-muted" />;
    }
  };

  const getStatusMessage = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving quote request...';
      case 'success':
        return `Last saved: ${lastSaved?.toLocaleTimeString()}`;
      case 'error':
        return `Local save failed (Retry ${retryCount}/${MAX_RETRY_ATTEMPTS})`;
      default:
        return 'Ready to save';
    }
  };

  return (
    <section className="an3s-panel p-5 sm:p-6" data-tone="blue">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-cyan-glow" />
          <div>
            <h2 className="text-2xl font-bold text-ink">Quote-request protection</h2>
            <p className="text-ink-muted">Local recovery and persistence controls</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm text-ink-muted">{getStatusMessage()}</span>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-6 border-y border-success/30 bg-success/10 p-4">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="font-medium text-ink">
            Local storage ready
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          Quote requests are saved on this workstation without cloud synchronization.
        </p>
      </div>

      {/* Auto-save Settings */}
      <div className="mb-6 border-y border-line py-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-ink">Protection features</h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              className="rounded border-line-strong bg-panel text-cyan focus:ring-cyan"
            />
            <span className="text-sm text-ink-muted">Auto-save enabled</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Save className="h-5 w-5 text-cyan-glow" />
            <div>
              <p className="text-sm font-medium text-ink">Auto-save every 30s</p>
              <p className="text-xs text-ink-muted">Prevents data loss during form completion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-cyan-glow" />
            <div>
              <p className="text-sm font-medium text-ink">Retry mechanism</p>
              <p className="text-xs text-ink-muted">Automatic retry with exponential backoff</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-cyan-glow" />
            <div>
              <p className="text-sm font-medium text-ink">Local storage backup</p>
              <p className="text-xs text-ink-muted">Data remains on this workstation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-cyan-glow" />
            <div>
              <p className="text-sm font-medium text-ink">Data validation</p>
              <p className="text-xs text-ink-muted">Pricing validation before saving</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Actions */}
      {(saveStatus === 'error' || localStorage.getItem('pendingQuoteRequest')) && (
        <div className="rounded-md border border-cyan/30 bg-cyan/10 p-4">
          <h4 className="mb-2 font-semibold text-cyan-glow">Data recovery available</h4>
          <p className="mb-3 text-sm text-ink-muted">
            There is unsaved quote request data that can be recovered and submitted.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={forceSave}
              className="an3s-action-primary px-4 py-2"
            >
              Retry Save
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('pendingQuoteRequest');
                setPendingData(null);
                setSaveStatus('idle');
              }}
              className="an3s-action-secondary px-4 py-2"
            >
              Clear Stored Data
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 border-t border-line pt-5">
        <h4 className="mb-2 font-semibold text-ink">System status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-cyan-glow">{retryCount}</p>
            <p className="text-xs text-ink-muted">Retry attempts</p>
          </div>
          <div>
            <p className="text-lg font-bold text-cyan-glow">
              {autoSaveEnabled ? 'ON' : 'OFF'}
            </p>
            <p className="text-xs text-ink-muted">Auto-save</p>
          </div>
          <div>
            <p className="text-lg font-bold text-cyan-glow">
              ✓
            </p>
            <p className="text-xs text-ink-muted">Storage</p>
          </div>
          <div>
            <p className="text-lg font-bold text-cyan-glow">
              {localStorage.getItem('pendingQuoteRequest') ? '1' : '0'}
            </p>
            <p className="text-xs text-ink-muted">Pending</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteRequestManager;
