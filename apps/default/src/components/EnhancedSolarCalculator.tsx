import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Zap, DollarSign, Calendar, TrendingUp, ShoppingCart, AlertCircle, Save, Shield, CheckCircle } from 'lucide-react';
import { CalculatorResults, CalculatorData } from '../App';
import { createNode, updateNode } from '../lib/genesis-data/client';
import { runFlow } from '../lib/genesis-flows/client';

interface EnhancedSolarCalculatorProps {
  onViewProducts: (results: CalculatorResults, data: CalculatorData) => void;
}

interface FormData extends CalculatorData {
  userName: string;
  email: string;
  phone: string;
}

const EnhancedSolarCalculator: React.FC<EnhancedSolarCalculatorProps> = ({ onViewProducts }) => {
  const [formData, setFormData] = useState<FormData>({
    userName: 'John Dlamini',
    email: 'john.dlamini@example.com',
    phone: '+27 82 123 4567',
    monthlyBill: 2500,
    location: 'Johannesburg',
    roofSize: 50,
    roofOrientation: 'north',
    loadshedding: 'medium',
    propertyType: 'freehold'
  });

  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const quoteNodeIdRef = useRef<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Auto-save mechanism
  useEffect(() => {
    if (!autoSaveEnabled) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save (5 seconds after last change)
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (formData.userName && formData.email && formData.monthlyBill > 0) {
        saveFormData(true);
      }
    }, 5000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, autoSaveEnabled]);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('solarCalculatorFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  const saveFormData = async (
    isAutoSave = false,
    calculationResults: CalculatorResults | null = results,
  ) => {
    if (!formData.userName || !formData.email) return;

    setSaveStatus('saving');

    try {
      // Save to localStorage first (immediate backup)
      localStorage.setItem('solarCalculatorFormData', JSON.stringify(formData));

      // If we have calculation results, save to database
      if (calculationResults) {
        const quoteFields = {
            Name: `Quote Request - ${formData.userName} - ${new Date().toLocaleDateString('en-ZA')}`,
            '/attributes/@calc1': formData.userName,
            '/attributes/@calc2': formData.email,
            '/attributes/@calc3': formData.phone,
            '/attributes/@calc4': formData.monthlyBill,
            '/attributes/@calc5': formData.location,
            '/attributes/@calc6': formData.roofOrientation,
            '/attributes/@calc7': formData.roofSize,
            '/attributes/@calc8': formData.loadshedding,
            '/attributes/@calc9': calculationResults.systemSize,
            '/attributes/@calc10': calculationResults.batterySize,
            '/attributes/@calc11': calculationResults.inverterSize,
            '/attributes/@calc12': calculationResults.monthlySavings,
            '/attributes/@calc13': calculationResults.annualSavings,
            '/attributes/@calc14': calculationResults.paybackPeriod,
            '/attributes/@calc15': calculationResults.roi,
            '/attributes/@calc16': calculationResults.systemCost,
            '/attributes/@calc17': formData.propertyType,
            '/attributes/@calc18': 'quote',
            '/attributes/note': `${isAutoSave ? 'Auto-saved' : 'Manual save'} calculation on ${new Date().toISOString()}`
        };
        if (quoteNodeIdRef.current) {
          await updateNode('aCGbHMAbWUZzTmna', quoteNodeIdRef.current, quoteFields);
        } else {
          const node = await createNode('aCGbHMAbWUZzTmna', quoteFields);
          quoteNodeIdRef.current = node.id;
        }
        setSaveStatus('success');
        setLastSaved(new Date());

        if (!isAutoSave) {
          localStorage.removeItem('solarCalculatorFormData');
        }
      } else {
        // Just form data, no calculation yet
        setSaveStatus('success');
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveStatus('error');
      
      // Ensure data is at least saved locally
      localStorage.setItem('solarCalculatorFormData', JSON.stringify(formData));
    }
  };

  const validatePricing = async (calculationResults: CalculatorResults) => {
    try {
      return await runFlow('01K4ZV0WPB4T9A65P6T86E98FC', {
          totalCost: calculationResults.systemCost,
          systemSize: calculationResults.systemSize,
          batterySize: calculationResults.batterySize,
          monthlyBill: formData.monthlyBill,
          inverterSize: calculationResults.inverterSize
      });
    } catch (error) {
      console.error('Local pricing validation error:', error);
    }
    return null;
  };

  const calculateSolar = async () => {
    if (formData.monthlyBill <= 0 || formData.roofSize <= 0) {
      setError('Please enter valid monthly bill and roof size values');
      return;
    }
    
    setIsCalculating(true);
    setError(null);
    
    // Simulate calculation delay
    setTimeout(async () => {
      try {
        // Enhanced solar calculation logic for South African conditions
        const avgTariff = 2.5; // R2.50 per kWh average in SA
        const monthlyConsumption = formData.monthlyBill / avgTariff;
        const dailyConsumption = monthlyConsumption / 30;
        
        // Get location-specific sun hours
        const avgSunHours = getAverageSunHours(formData.location);
        
        // Orientation factor
        const orientationFactor = getRoofEfficiency(formData.roofOrientation);
        
        // Calculate system size needed
        const baseSystemSize = dailyConsumption / (avgSunHours * orientationFactor);
        const maxSystemSize = formData.roofSize / 8; // 8m² per kW
        const systemSize = Math.min(baseSystemSize, maxSystemSize);
        
        // Load-shedding factor (affects battery requirements)
        const loadshedingMultiplier = getLoadshedingMultiplier(formData.loadshedding);
        
        // Battery sizing based on daily consumption and load-shedding
        const batterySize = Math.round(dailyConsumption * loadshedingMultiplier * 10) / 10;
        
        // Inverter sizing (typically 1.2x system size for safety margin)
        const inverterSize = Math.round(systemSize * 1.2 * 10) / 10;
        
        // Cost calculations (South African market rates)
        const systemCostPerKw = 15000; // R15,000 per kW installed
        const batteryCostPerKwh = 8000; // R8,000 per kWh
        const systemCost = Math.round((systemSize * systemCostPerKw) + (batterySize * batteryCostPerKwh));
        
        // Savings calculations
        const monthlySavings = Math.round(monthlyConsumption * avgTariff * 0.8); // 80% offset
        const annualSavings = monthlySavings * 12;
        
        // Payback period and ROI
        const paybackPeriod = Math.round((systemCost / annualSavings) * 10) / 10;
        const roi = Math.round((annualSavings / systemCost) * 100) / 100;

        const calculationResults: CalculatorResults = {
          systemSize: Math.round(systemSize * 10) / 10,
          monthlySavings,
          annualSavings,
          systemCost,
          paybackPeriod,
          roi,
          batterySize,
          inverterSize
        };

        // Validate pricing
        const validationResult = await validatePricing(calculationResults);
        if (validationResult) {
          console.log('Pricing validation result:', validationResult);
        }

        setResults(calculationResults);
        
        // Persist the new result directly so this save does not depend on a stale render closure.
        await saveFormData(true, calculationResults);
        
      } catch (err) {
        setError('Error calculating solar system. Please check your inputs and try again.');
        console.error('Calculation error:', err);
      } finally {
        setIsCalculating(false);
      }
    }, 1000);
  };

  const getAverageSunHours = (location: string): number => {
    const sunHours: { [key: string]: number } = {
      'cape town': 6.2,
      'johannesburg': 5.8,
      'durban': 5.5,
      'pretoria': 5.9,
      'port elizabeth': 6.0,
      'bloemfontein': 6.1,
      'kimberley': 6.3,
      'upington': 6.8
    };
    
    const city = location.toLowerCase();
    for (const [key, hours] of Object.entries(sunHours)) {
      if (city.includes(key)) return hours;
    }
    return 5.8; // Default average for SA
  };

  const getRoofEfficiency = (orientation: string): number => {
    const efficiencies: { [key: string]: number } = {
      'north': 1.0,
      'north-east': 0.95,
      'north-west': 0.95,
      'east': 0.85,
      'west': 0.85,
      'south-east': 0.75,
      'south-west': 0.75,
      'south': 0.65
    };
    return efficiencies[orientation.toLowerCase()] || 0.85;
  };

  const getLoadshedingMultiplier = (frequency: string): number => {
    const multipliers = {
      'low': 0.3,
      'medium': 0.5,
      'high': 0.8
    };
    return multipliers[frequency as keyof typeof multipliers] || 0.5;
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null); // Clear error when user makes changes
  };

  const handleViewProducts = () => {
    if (results) {
      onViewProducts(results, formData);
    }
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Save className="h-4 w-4 animate-pulse text-cyan" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-danger" />;
      default:
        return <Shield className="h-4 w-4 text-ink-muted" />;
    }
  };

  const getSaveStatusMessage = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'success':
        return lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Saved';
      case 'error':
        return 'Save failed - Data stored locally';
      default:
        return 'Auto-save enabled';
    }
  };

  return (
    <div ref={formRef} className="h-full space-y-7 overflow-y-auto p-5 sm:p-6">
      {/* Save Status Bar */}
      <div className="flex items-center justify-between rounded-md border border-line bg-deep-space px-4 py-3">
        <div className="flex items-center space-x-2">
          {getSaveStatusIcon()}
          <span className="text-sm text-ink-muted">{getSaveStatusMessage()}</span>
        </div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoSaveEnabled}
            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
            className="rounded border-line-strong bg-panel text-cyan focus:ring-cyan"
          />
          <span className="text-xs text-ink-muted">Auto-save</span>
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-danger/50 bg-danger/10 p-4">
          <AlertCircle className="h-5 w-5 text-danger" />
          <span className="text-sm text-danger">{error}</span>
        </div>
      )}

      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-ink">Customer information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-soft">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => handleInputChange('userName', e.target.value)}
              className="w-full rounded-md border border-line-strong bg-deep-space px-3 py-2 text-ink placeholder:text-ink-muted focus:border-cyan focus:outline-none"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink-soft">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full rounded-md border border-line-strong bg-deep-space px-3 py-2 text-ink placeholder:text-ink-muted focus:border-cyan focus:outline-none"
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink-soft">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full rounded-md border border-line-strong bg-deep-space px-3 py-2 text-ink placeholder:text-ink-muted focus:border-cyan focus:outline-none"
            placeholder="+27 82 123 4567"
          />
        </div>
      </div>

      {/* System Requirements */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-ink">System requirements</h3>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-ink-soft">
            Monthly Electricity Bill (ZAR) *
          </label>
          <input
            type="number"
            value={formData.monthlyBill || ''}
            onChange={(e) => handleInputChange('monthlyBill', Number(e.target.value))}
            className="w-full rounded-md border border-line-strong bg-deep-space px-3 py-2 text-ink placeholder:text-ink-muted focus:border-cyan focus:outline-none"
            placeholder="e.g. 2500"
            min="0"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink-soft">
            Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full rounded-md border border-line-strong bg-deep-space px-3 py-2 text-ink placeholder:text-ink-muted focus:border-cyan focus:outline-none"
            placeholder="e.g. Johannesburg"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink-soft">
            Available Roof Space (m²) *
          </label>
          <input
            type="number"
            value={formData.roofSize || ''}
            onChange={(e) => handleInputChange('roofSize', Number(e.target.value))}
            className="w-full rounded-md border border-line-strong bg-deep-space px-3 py-2 text-ink placeholder:text-ink-muted focus:border-cyan focus:outline-none"
            placeholder="e.g. 50"
            min="0"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink-soft">
            Roof Orientation
          </label>
          <select
            value={formData.roofOrientation}
            onChange={(e) => handleInputChange('roofOrientation', e.target.value)}
            className="w-full rounded-md border border-line-strong bg-deep-space px-3 py-2 text-ink focus:border-cyan focus:outline-none"
          >
            <option value="north">North (Best)</option>
            <option value="north-east">North-East</option>
            <option value="north-west">North-West</option>
            <option value="east">East</option>
            <option value="west">West</option>
            <option value="south-east">South-East</option>
            <option value="south-west">South-West</option>
            <option value="south">South</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink-soft">
            Load-shedding Frequency
          </label>
          <select
            value={formData.loadshedding}
            onChange={(e) => handleInputChange('loadshedding', e.target.value)}
            className="w-full rounded-md border border-line-strong bg-deep-space px-3 py-2 text-ink focus:border-cyan focus:outline-none"
          >
            <option value="low">Low (1-2 times/week)</option>
            <option value="medium">Medium (3-4 times/week)</option>
            <option value="high">High (Daily)</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink-soft">
            Property Type
          </label>
          <select
            value={formData.propertyType}
            onChange={(e) => handleInputChange('propertyType', e.target.value)}
            className="w-full rounded-md border border-line-strong bg-deep-space px-3 py-2 text-ink focus:border-cyan focus:outline-none"
          >
            <option value="freehold">Freehold Property</option>
            <option value="sectional">Sectional Title/Complex</option>
            <option value="rental">Rental Property</option>
          </select>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={calculateSolar}
            disabled={isCalculating || formData.monthlyBill <= 0 || formData.roofSize <= 0 || !formData.userName || !formData.email}
            className="an3s-action-primary flex flex-1 items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isCalculating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-deep-space border-t-transparent" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                Calculate Solar Potential
              </>
            )}
          </button>

          <button
            onClick={() => saveFormData(false)}
            disabled={!formData.userName || !formData.email}
            className="an3s-action-secondary px-4 py-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4 border-t border-line pt-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-ink">Your solar estimate</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-line bg-deep-space p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-pink-glow" />
                <span className="text-xs text-ink-muted">System size</span>
              </div>
              <div className="text-lg font-bold text-ink">{results.systemSize} kW</div>
            </div>
            
            <div className="rounded-md border border-line bg-deep-space p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-cyan-glow" />
                <span className="text-xs text-ink-muted">Monthly savings</span>
              </div>
              <div className="text-lg font-bold text-ink">R{results.monthlySavings.toLocaleString()}</div>
            </div>
            
            <div className="rounded-md border border-line bg-deep-space p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-violet-glow" />
                <span className="text-xs text-ink-muted">Payback period</span>
              </div>
              <div className="text-lg font-bold text-ink">{results.paybackPeriod} years</div>
            </div>
            
            <div className="rounded-md border border-line bg-deep-space p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-cyan-glow" />
                <span className="text-xs text-ink-muted">ROI</span>
              </div>
              <div className="text-lg font-bold text-ink">{(results.roi * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div className="rounded-md border border-cyan/30 bg-cyan/10 p-4">
            <div className="mb-2 text-sm font-semibold uppercase tracking-[0.1em] text-cyan-glow">Estimated system cost</div>
            <div className="text-2xl font-extrabold text-ink">R{results.systemCost.toLocaleString()}</div>
            <div className="mt-1 text-xs text-ink-muted">Including installation &amp; battery backup</div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleViewProducts}
              className="an3s-action-primary flex w-full items-center justify-center gap-2 py-3"
            >
              <ShoppingCart className="w-4 h-4" />
              View Product Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSolarCalculator;
