import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Zap, DollarSign, Calendar, TrendingUp, ShoppingCart, AlertCircle, Save, Shield, CheckCircle } from 'lucide-react';
import { CalculatorResults, CalculatorData } from '../App';

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

  const saveFormData = async (isAutoSave = false) => {
    if (!formData.userName || !formData.email) return;

    setSaveStatus('saving');

    try {
      // Save to localStorage first (immediate backup)
      localStorage.setItem('solarCalculatorFormData', JSON.stringify(formData));

      // If we have calculation results, save to database
      if (results) {
        const response = await fetch('/api/taskade/projects/aCGbHMAbWUZzTmna/nodes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            '/text': `Quote Request - ${formData.userName} - ${new Date().toLocaleDateString()}`,
            '/attributes/@calc1': formData.userName,
            '/attributes/@calc2': formData.email,
            '/attributes/@calc3': formData.phone,
            '/attributes/@calc4': formData.monthlyBill,
            '/attributes/@calc5': formData.location,
            '/attributes/@calc6': formData.roofOrientation,
            '/attributes/@calc7': formData.roofSize,
            '/attributes/@calc8': formData.loadshedding,
            '/attributes/@calc9': results.systemSize,
            '/attributes/@calc10': results.batterySize,
            '/attributes/@calc11': results.inverterSize,
            '/attributes/@calc12': results.monthlySavings,
            '/attributes/@calc13': results.annualSavings,
            '/attributes/@calc14': results.paybackPeriod,
            '/attributes/@calc15': results.roi,
            '/attributes/@calc16': results.systemCost,
            '/attributes/@calc17': formData.propertyType,
            '/attributes/@calc18': 'quote',
            '/attributes/note': `${isAutoSave ? 'Auto-saved' : 'Manual save'} calculation on ${new Date().toISOString()}`
          }),
        });

        if (response.ok) {
          setSaveStatus('success');
          setLastSaved(new Date());
          
          // Clear localStorage after successful database save
          if (!isAutoSave) {
            localStorage.removeItem('solarCalculatorFormData');
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
      const response = await fetch('/api/taskade/webhooks/01K4ZV0WPB4T9A65P6T86E98FC/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalCost: calculationResults.systemCost,
          systemSize: calculationResults.systemSize,
          batterySize: calculationResults.batterySize,
          monthlyBill: formData.monthlyBill,
          inverterSize: calculationResults.inverterSize
        }),
      });

      if (response.ok) {
        const validationResult = await response.json();
        return validationResult;
      }
    } catch (error) {
      console.error('Pricing validation error:', error);
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
        
        // Auto-save the complete calculation
        setTimeout(() => saveFormData(true), 1000);
        
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
        return <Save className="w-4 h-4 animate-pulse text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Shield className="w-4 h-4 text-[#CCCCCC]" />;
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
    <div ref={formRef} className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Save Status Bar */}
      <div className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg border border-[#CCCCCC]/20">
        <div className="flex items-center space-x-2">
          {getSaveStatusIcon()}
          <span className="text-sm text-[#CCCCCC]">{getSaveStatusMessage()}</span>
        </div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoSaveEnabled}
            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
            className="rounded border-[#CCCCCC]/30 text-[#D4FF00] focus:ring-[#D4FF00] bg-[#333333]"
          />
          <span className="text-xs text-[#CCCCCC]">Auto-save</span>
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Customer Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => handleInputChange('userName', e.target.value)}
              className="w-full bg-[#333333] border border-[#333333] rounded-lg px-3 py-2 text-white placeholder-[#CCCCCC] focus:outline-none focus:border-[#D4FF00]/50"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full bg-[#333333] border border-[#333333] rounded-lg px-3 py-2 text-white placeholder-[#CCCCCC] focus:outline-none focus:border-[#D4FF00]/50"
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full bg-[#333333] border border-[#333333] rounded-lg px-3 py-2 text-white placeholder-[#CCCCCC] focus:outline-none focus:border-[#D4FF00]/50"
            placeholder="+27 82 123 4567"
          />
        </div>
      </div>

      {/* System Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">System Requirements</h3>
        
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Monthly Electricity Bill (ZAR) *
          </label>
          <input
            type="number"
            value={formData.monthlyBill || ''}
            onChange={(e) => handleInputChange('monthlyBill', Number(e.target.value))}
            className="w-full bg-[#333333] border border-[#333333] rounded-lg px-3 py-2 text-white placeholder-[#CCCCCC] focus:outline-none focus:border-[#D4FF00]/50"
            placeholder="e.g. 2500"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full bg-[#333333] border border-[#333333] rounded-lg px-3 py-2 text-white placeholder-[#CCCCCC] focus:outline-none focus:border-[#D4FF00]/50"
            placeholder="e.g. Johannesburg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Available Roof Space (m²) *
          </label>
          <input
            type="number"
            value={formData.roofSize || ''}
            onChange={(e) => handleInputChange('roofSize', Number(e.target.value))}
            className="w-full bg-[#333333] border border-[#333333] rounded-lg px-3 py-2 text-white placeholder-[#CCCCCC] focus:outline-none focus:border-[#D4FF00]/50"
            placeholder="e.g. 50"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Roof Orientation
          </label>
          <select
            value={formData.roofOrientation}
            onChange={(e) => handleInputChange('roofOrientation', e.target.value)}
            className="w-full bg-[#333333] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4FF00]/50"
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
          <label className="block text-sm font-medium text-white mb-2">
            Load-shedding Frequency
          </label>
          <select
            value={formData.loadshedding}
            onChange={(e) => handleInputChange('loadshedding', e.target.value)}
            className="w-full bg-[#333333] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4FF00]/50"
          >
            <option value="low">Low (1-2 times/week)</option>
            <option value="medium">Medium (3-4 times/week)</option>
            <option value="high">High (Daily)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Property Type
          </label>
          <select
            value={formData.propertyType}
            onChange={(e) => handleInputChange('propertyType', e.target.value)}
            className="w-full bg-[#333333] border border-[#333333] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D4FF00]/50"
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
            className="flex-1 bg-[#D4FF00] text-[#1E1E1E] py-3 rounded-lg hover:bg-[#D4FF00]/90 disabled:bg-[#333333] disabled:text-[#CCCCCC] disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 font-bold"
          >
            {isCalculating ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin"></div>
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
            className="px-4 py-3 bg-[#333333] hover:bg-[#333333]/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="border-t border-[#D4FF00]/20 pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Your Solar Estimate</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#333333] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-[#D4FF00]" />
                <span className="text-xs text-[#CCCCCC]">System Size</span>
              </div>
              <div className="text-lg font-bold text-white">{results.systemSize} kW</div>
            </div>
            
            <div className="bg-[#333333] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-[#D4FF00]" />
                <span className="text-xs text-[#CCCCCC]">Monthly Savings</span>
              </div>
              <div className="text-lg font-bold text-white">R{results.monthlySavings.toLocaleString()}</div>
            </div>
            
            <div className="bg-[#333333] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-[#D4FF00]" />
                <span className="text-xs text-[#CCCCCC]">Payback Period</span>
              </div>
              <div className="text-lg font-bold text-white">{results.paybackPeriod} years</div>
            </div>
            
            <div className="bg-[#333333] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-[#D4FF00]" />
                <span className="text-xs text-[#CCCCCC]">ROI</span>
              </div>
              <div className="text-lg font-bold text-white">{(results.roi * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div className="bg-[#D4FF00]/10 border border-[#D4FF00]/20 rounded-lg p-4">
            <div className="text-sm text-[#D4FF00] mb-2 font-medium">Estimated System Cost</div>
            <div className="text-2xl font-bold text-white">R{results.systemCost.toLocaleString()}</div>
            <div className="text-xs text-[#CCCCCC] mt-1">Including installation & battery backup</div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleViewProducts}
              className="w-full bg-[#D4FF00] text-[#1E1E1E] py-3 rounded-lg hover:bg-[#D4FF00]/90 transition-all duration-300 flex items-center justify-center gap-2 font-bold"
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