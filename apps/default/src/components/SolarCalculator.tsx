import React, { useState, useEffect } from 'react';
import { Calculator, Zap, DollarSign, Calendar, TrendingUp, ShoppingCart, AlertCircle } from 'lucide-react';
import { CalculatorResults, CalculatorData } from '../App';

interface SolarCalculatorProps {
  onViewProducts: (results: CalculatorResults, data: CalculatorData) => void;
}

const SolarCalculator: React.FC<SolarCalculatorProps> = ({ onViewProducts }) => {
  const [formData, setFormData] = useState<CalculatorData>({
    monthlyBill: 0,
    location: '',
    roofSize: 0,
    roofOrientation: 'south',
    loadshedding: 'medium',
    propertyType: 'freehold'
  });

  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateSolar = () => {
    if (formData.monthlyBill <= 0 || formData.roofSize <= 0) {
      setError('Please enter valid monthly bill and roof size values');
      return;
    }
    
    setIsCalculating(true);
    setError(null);
    
    // Simulate calculation delay
    setTimeout(() => {
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

        setResults({
          systemSize: Math.round(systemSize * 10) / 10,
          monthlySavings,
          annualSavings,
          systemCost,
          paybackPeriod,
          roi,
          batterySize,
          inverterSize
        });
        
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

  const handleInputChange = (field: keyof CalculatorData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null); // Clear error when user makes changes
  };

  const saveCalculation = async () => {
    if (!results) return;

    try {
      const response = await fetch('/api/taskade/projects/aCGbHMAbWUZzTmna/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          '/text': `Solar Calculation - ${new Date().toLocaleDateString()}`,
          '/attributes/@calc1': 'Anonymous User', // We don't have user name in this form
          '/attributes/@calc2': '', // No email in this form
          '/attributes/@calc3': '', // No phone in this form
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
          '/attributes/note': `Calculation performed on ${new Date().toISOString()}`
        }),
      });

      if (response.ok) {
        alert('Calculation saved! Our team will contact you soon with a detailed quote.');
      } else {
        throw new Error('Failed to save calculation');
      }
    } catch (error) {
      console.error('Error saving calculation:', error);
      alert('Unable to save calculation at this time. Please try again later.');
    }
  };

  const handleViewProducts = () => {
    if (results) {
      onViewProducts(results, formData);
    }
  };

  return (
    <div className="p-6 space-y-6 h-[600px] overflow-y-auto">
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Input Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Monthly Electricity Bill (ZAR)
          </label>
          <input
            type="number"
            value={formData.monthlyBill || ''}
            onChange={(e) => handleInputChange('monthlyBill', Number(e.target.value))}
            className="w-full bg-[#333333] border border-[#333333] rounded-lg px-3 py-2 text-white placeholder-[#CCCCCC] focus:outline-none focus:border-[#D4FF00]/50"
            placeholder="e.g. 2500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full bg-[#333333] border border-[#333333] rounded-lg px-3 py-2 text-white placeholder-[#CCCCCC] focus:outline-none focus:border-[#D4FF00]/50"
            placeholder="e.g. Johannesburg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Available Roof Space (m²)
          </label>
          <input
            type="number"
            value={formData.roofSize || ''}
            onChange={(e) => handleInputChange('roofSize', Number(e.target.value))}
            className="w-full bg-[#333333] border border-[#333333] rounded-lg px-3 py-2 text-white placeholder-[#CCCCCC] focus:outline-none focus:border-[#D4FF00]/50"
            placeholder="e.g. 50"
            min="0"
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

        <button
          onClick={calculateSolar}
          disabled={isCalculating || formData.monthlyBill <= 0 || formData.roofSize <= 0}
          className="w-full bg-[#D4FF00] text-[#1E1E1E] py-3 rounded-lg hover:bg-[#D4FF00]/90 disabled:bg-[#333333] disabled:text-[#CCCCCC] disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 font-bold"
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

            <button
              onClick={saveCalculation}
              className="w-full bg-[#333333] hover:bg-[#333333]/80 text-white py-2 rounded-lg transition-colors text-sm"
            >
              Save & Request Detailed Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolarCalculator;