import React from 'react';
import { SolarCalculation } from './SolarCalculator';
import { Battery, Zap, DollarSign, TrendingUp, Calendar, Sun, Home } from 'lucide-react';

interface CalculationResultsProps {
  calculation: SolarCalculation;
}

export const CalculationResults: React.FC<CalculationResultsProps> = ({ calculation }) => {
  const formatCurrency = (amount: number) => `R${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  const resultCards = [
    {
      title: 'Recommended System Size',
      value: `${calculation.systemSize}kWp`,
      icon: Sun,
      color: 'yellow',
      description: 'Solar panel capacity needed'
    },
    {
      title: 'Battery Storage',
      value: `${calculation.batterySize}kWh`,
      icon: Battery,
      color: 'blue',
      description: 'Backup power capacity'
    },
    {
      title: 'Inverter Size',
      value: `${calculation.inverterSize}kW`,
      icon: Zap,
      color: 'purple',
      description: 'Power conversion capacity'
    },
    {
      title: 'Total Investment',
      value: formatCurrency(calculation.totalCost || 0),
      icon: DollarSign,
      color: 'green',
      description: 'Complete system cost'
    },
    {
      title: 'Monthly Savings',
      value: formatCurrency(calculation.monthlySavings || 0),
      icon: TrendingUp,
      color: 'emerald',
      description: 'Estimated monthly reduction'
    },
    {
      title: 'Payback Period',
      value: `${calculation.paybackPeriod} years`,
      icon: Calendar,
      color: 'indigo',
      description: 'Time to recover investment'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      yellow: 'bg-[#1E1E1E] text-[#D4FF00] border-[#D4FF00]/30',
      blue: 'bg-[#1E1E1E] text-[#D4FF00] border-[#D4FF00]/30',
      purple: 'bg-[#1E1E1E] text-[#D4FF00] border-[#D4FF00]/30',
      green: 'bg-[#1E1E1E] text-[#D4FF00] border-[#D4FF00]/30',
      emerald: 'bg-[#1E1E1E] text-[#D4FF00] border-[#D4FF00]/30',
      indigo: 'bg-[#1E1E1E] text-[#D4FF00] border-[#D4FF00]/30'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-[#333333] rounded-xl shadow-lg p-6 border border-[#CCCCCC]/20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#D4FF00] mb-2">Your Solar Solution</h2>
        <p className="text-[#CCCCCC]">Customized recommendations for {calculation.userName}</p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {resultCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${getColorClasses(card.color)} transition-transform hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-6 h-6 text-[#D4FF00]" />
                <span className="text-2xl font-bold text-white">{card.value}</span>
              </div>
              <h3 className="font-semibold text-sm mb-1 text-white">{card.title}</h3>
              <p className="text-xs text-[#CCCCCC]">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-r from-[#1E1E1E] to-[#333333] rounded-lg p-6 mb-6 border border-[#D4FF00]/20">
        <h3 className="text-lg font-semibold text-white mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#D4FF00]">
              {formatCurrency(calculation.annualSavings || 0)}
            </p>
            <p className="text-sm text-[#CCCCCC]">Annual Savings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#D4FF00]">
              {formatPercentage(calculation.roi || 0)}
            </p>
            <p className="text-sm text-[#CCCCCC]">Return on Investment</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#D4FF00]">
              {formatCurrency((calculation.annualSavings || 0) * 20)}
            </p>
            <p className="text-sm text-[#CCCCCC]">20-Year Savings</p>
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-[#1E1E1E] rounded-lg p-6 mb-6 border border-[#D4FF00]/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Home className="w-5 h-5 mr-2 text-[#D4FF00]" />
          Environmental Impact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-lg font-semibold text-[#D4FF00]">
              {Math.round((calculation.systemSize || 0) * 1.5 * 365)} kWh/year
            </p>
            <p className="text-sm text-[#CCCCCC]">Clean energy generated</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-[#D4FF00]">
              {Math.round((calculation.systemSize || 0) * 1.2)} tons CO₂
            </p>
            <p className="text-sm text-[#CCCCCC]">Annual carbon offset</p>
          </div>
        </div>
      </div>

      {/* Property-Specific Notes */}
      {calculation.propertyType === 'sectional' && (
        <div className="bg-[#1E1E1E] border border-[#D4FF00]/30 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-[#D4FF00] mb-2">Sectional Title Requirements</h4>
          <p className="text-sm text-[#CCCCCC]">
            As this is a sectional title property, you'll need HOA/Body Corporate approval. 
            Check our Regulatory Support tab for assistance with the approval process.
          </p>
        </div>
      )}

      {/* Next Steps */}
      <div className="mt-6 p-4 bg-[#1E1E1E] rounded-lg border border-[#D4FF00]/20">
        <h4 className="font-semibold text-[#D4FF00] mb-2">Next Steps</h4>
        <ul className="text-sm text-[#CCCCCC] space-y-1">
          <li>• Consult with our AI Assistant for detailed explanations</li>
          <li>• Review regulatory requirements for your property type</li>
          <li>• Generate a detailed proposal document</li>
          <li>• Schedule a site inspection with our certified installers</li>
        </ul>
      </div>
    </div>
  );
};