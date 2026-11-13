import React, { useState } from 'react';
import { SolarCalculation } from './SolarCalculator';
import { Settings, Users, TrendingUp, DollarSign, Battery, Sun, Filter, Search, Download, Eye, MoreVertical } from 'lucide-react';

interface AdminDashboardProps {
  calculations: SolarCalculation[];
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ calculations, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'savings'>('date');
  const [selectedCalculation, setSelectedCalculation] = useState<SolarCalculation | null>(null);

  // Calculate summary statistics
  const totalCalculations = calculations.length;
  const totalValue = calculations.reduce((sum, calc) => sum + (calc.totalCost || 0), 0);
  const totalSavings = calculations.reduce((sum, calc) => sum + (calc.annualSavings || 0), 0);
  const avgSystemSize = calculations.length > 0 
    ? calculations.reduce((sum, calc) => sum + (calc.systemSize || 0), 0) / calculations.length 
    : 0;

  const statusCounts = calculations.reduce((acc, calc) => {
    const status = calc.status || 'quote';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter and sort calculations
  const filteredCalculations = calculations
    .filter(calc => {
      const matchesSearch = calc.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           calc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           calc.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || calc.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return (b.totalCost || 0) - (a.totalCost || 0);
        case 'savings':
          return (b.annualSavings || 0) - (a.annualSavings || 0);
        default:
          return new Date(b.id || '').getTime() - new Date(a.id || '').getTime();
      }
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(amount);

  const getStatusColor = (status: string) => {
    const colors = {
      quote: 'bg-[#080A24] text-[#48E1FD] border border-[#48E1FD]/30',
      pending: 'bg-[#080A24] text-[#48E1FD] border border-[#48E1FD]/30',
      approved: 'bg-[#48E1FD] text-[#03041D]',
      installed: 'bg-[#48E1FD] text-[#03041D]'
    };
    return colors[status as keyof typeof colors] || colors.quote;
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Location', 'System Size (kWp)', 'Total Cost', 'Annual Savings', 'Status'],
      ...filteredCalculations.map(calc => [
        calc.userName,
        calc.email,
        calc.location,
        calc.systemSize?.toString() || '',
        calc.totalCost?.toString() || '',
        calc.annualSavings?.toString() || '',
        calc.status || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-calculations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCalculation = (calculation: SolarCalculation) => {
    const blob = new Blob([JSON.stringify(calculation, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `solar-proposal-${calculation.userName.replace(/\s+/g, '-').toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#080A24] rounded-xl shadow-lg p-6 border border-[#B2B1B6]/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-8 h-8 text-[#48E1FD]" />
            <div>
              <h2 className="text-2xl font-bold text-[#FFFFFF]">Admin Dashboard</h2>
              <p className="text-[#B2B1B6]">Manage solar calculations and customer data</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              className="px-4 py-2 text-[#B2B1B6] hover:text-[#FFFFFF] border border-[#B2B1B6]/30 rounded-lg hover:bg-[#03041D]/50"
            >
              Refresh
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-[#48E1FD] text-[#03041D] rounded-lg hover:bg-[#48E1FD]/90 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#03041D] rounded-lg p-4 border border-[#B2B1B6]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#B2B1B6] text-sm font-medium">Total Calculations</p>
                <p className="text-2xl font-bold text-[#48E1FD]">{totalCalculations}</p>
              </div>
              <Users className="w-8 h-8 text-[#48E1FD]" />
            </div>
          </div>
          
          <div className="bg-[#03041D] rounded-lg p-4 border border-[#B2B1B6]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#B2B1B6] text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-[#48E1FD]">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-[#48E1FD]" />
            </div>
          </div>
          
          <div className="bg-[#03041D] rounded-lg p-4 border border-[#B2B1B6]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#B2B1B6] text-sm font-medium">Annual Savings</p>
                <p className="text-2xl font-bold text-[#48E1FD]">{formatCurrency(totalSavings)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#48E1FD]" />
            </div>
          </div>
          
          <div className="bg-[#03041D] rounded-lg p-4 border border-[#B2B1B6]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#B2B1B6] text-sm font-medium">Avg System Size</p>
                <p className="text-2xl font-bold text-[#48E1FD]">{avgSystemSize.toFixed(1)}kWp</p>
              </div>
              <Sun className="w-8 h-8 text-[#48E1FD]" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-[#080A24] rounded-xl shadow-lg p-6 border border-[#B2B1B6]/20">
        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4">Status Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="text-center p-3 bg-[#03041D] rounded-lg border border-[#B2B1B6]/20">
              <div className="text-2xl font-bold text-[#FFFFFF]">{count}</div>
              <div className={`text-sm px-2 py-1 rounded-full inline-block mt-1 ${getStatusColor(status)}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-[#080A24] rounded-xl shadow-lg p-6 border border-[#B2B1B6]/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B2B1B6]" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#03041D] text-[#FFFFFF] placeholder-[#B2B1B6]"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#03041D] text-[#FFFFFF]"
            >
              <option value="all">All Status</option>
              <option value="quote">Quote</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="installed">Installed</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#B2B1B6]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'value' | 'savings')}
              className="px-4 py-2 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#03041D] text-[#FFFFFF]"
            >
              <option value="date">Sort by Date</option>
              <option value="value">Sort by Value</option>
              <option value="savings">Sort by Savings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calculations Table */}
      <div className="bg-[#080A24] rounded-xl shadow-lg overflow-hidden border border-[#B2B1B6]/20">
        <div className="px-6 py-4 border-b border-[#B2B1B6]/20">
          <h3 className="text-lg font-semibold text-[#FFFFFF]">
            Customer Calculations ({filteredCalculations.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#03041D]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#B2B1B6] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#B2B1B6] uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#B2B1B6] uppercase tracking-wider">
                  System
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#B2B1B6] uppercase tracking-wider">
                  Investment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#B2B1B6] uppercase tracking-wider">
                  Savings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#B2B1B6] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#B2B1B6] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#080A24] divide-y divide-[#B2B1B6]/20">
              {filteredCalculations.map((calculation, index) => (
                <tr key={calculation.id || index} className="hover:bg-[#03041D]/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[#FFFFFF]">{calculation.userName}</div>
                      <div className="text-sm text-[#B2B1B6]">{calculation.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFFFFF]">
                    {calculation.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#FFFFFF]">
                      <div className="flex items-center space-x-2">
                        <Sun className="w-4 h-4 text-[#48E1FD]" />
                        <span>{calculation.systemSize}kWp</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Battery className="w-4 h-4 text-[#48E1FD]" />
                        <span>{calculation.batterySize}kWh</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#48E1FD]">
                    {formatCurrency(calculation.totalCost || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#FFFFFF]">
                      <div>{formatCurrency(calculation.monthlySavings || 0)}/mo</div>
                      <div className="text-xs text-[#B2B1B6]">{formatCurrency(calculation.annualSavings || 0)}/yr</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(calculation.status || 'quote')}`}>
                      {(calculation.status || 'quote').charAt(0).toUpperCase() + (calculation.status || 'quote').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedCalculation(calculation)}
                        className="text-[#48E1FD] hover:text-[#48E1FD]/80"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCalculation(calculation)}
                        className="text-[#B2B1B6] hover:text-[#FFFFFF]"
                        aria-label={`Open actions for ${calculation.userName}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCalculations.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-[#B2B1B6] mx-auto mb-4" />
            <p className="text-[#B2B1B6]">No calculations found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCalculation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#080A24] rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-[#B2B1B6]/20">
            <div className="flex items-center justify-between p-6 border-b border-[#B2B1B6]/20">
              <h3 className="text-lg font-semibold text-[#FFFFFF]">
                Calculation Details - {selectedCalculation.userName}
              </h3>
              <button
                onClick={() => setSelectedCalculation(null)}
                className="text-[#B2B1B6] hover:text-[#FFFFFF]"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-[#FFFFFF] mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-[#B2B1B6]">Name:</span> <span className="text-[#FFFFFF]">{selectedCalculation.userName}</span></div>
                    <div><span className="text-[#B2B1B6]">Email:</span> <span className="text-[#FFFFFF]">{selectedCalculation.email}</span></div>
                    <div><span className="text-[#B2B1B6]">Phone:</span> <span className="text-[#FFFFFF]">{selectedCalculation.phone}</span></div>
                    <div><span className="text-[#B2B1B6]">Location:</span> <span className="text-[#FFFFFF]">{selectedCalculation.location}</span></div>
                    <div><span className="text-[#B2B1B6]">Property:</span> <span className="text-[#FFFFFF]">{selectedCalculation.propertyType}</span></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-[#FFFFFF] mb-3">System Specifications</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-[#B2B1B6]">System Size:</span> <span className="text-[#48E1FD]">{selectedCalculation.systemSize}kWp</span></div>
                    <div><span className="text-[#B2B1B6]">Battery:</span> <span className="text-[#48E1FD]">{selectedCalculation.batterySize}kWh</span></div>
                    <div><span className="text-[#B2B1B6]">Inverter:</span> <span className="text-[#48E1FD]">{selectedCalculation.inverterSize}kW</span></div>
                    <div><span className="text-[#B2B1B6]">Roof Size:</span> <span className="text-[#FFFFFF]">{selectedCalculation.roofSize}m²</span></div>
                    <div><span className="text-[#B2B1B6]">Orientation:</span> <span className="text-[#FFFFFF]">{selectedCalculation.roofOrientation}</span></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-[#FFFFFF] mb-3">Financial Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-[#B2B1B6]">Monthly Bill:</span> <span className="text-[#48E1FD]">{formatCurrency(selectedCalculation.monthlyBill)}</span></div>
                    <div><span className="text-[#B2B1B6]">Total Cost:</span> <span className="text-[#48E1FD]">{formatCurrency(selectedCalculation.totalCost || 0)}</span></div>
                    <div><span className="text-[#B2B1B6]">Monthly Savings:</span> <span className="text-[#48E1FD]">{formatCurrency(selectedCalculation.monthlySavings || 0)}</span></div>
                    <div><span className="text-[#B2B1B6]">Annual Savings:</span> <span className="text-[#48E1FD]">{formatCurrency(selectedCalculation.annualSavings || 0)}</span></div>
                    <div><span className="text-[#B2B1B6]">Payback Period:</span> <span className="text-[#FFFFFF]">{selectedCalculation.paybackPeriod} years</span></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-[#FFFFFF] mb-3">Additional Info</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-[#B2B1B6]">Load-shedding:</span> <span className="text-[#FFFFFF]">{selectedCalculation.loadshedding}</span></div>
                    <div><span className="text-[#B2B1B6]">ROI:</span> <span className="text-[#48E1FD]">{((selectedCalculation.roi || 0) * 100).toFixed(1)}%</span></div>
                    <div><span className="text-[#B2B1B6]">Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedCalculation.status || 'quote')}`}>
                        {(selectedCalculation.status || 'quote').charAt(0).toUpperCase() + (selectedCalculation.status || 'quote').slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-[#B2B1B6]/20 bg-[#03041D]">
              <button
                onClick={() => setSelectedCalculation(null)}
                className="px-4 py-2 text-[#B2B1B6] hover:text-[#FFFFFF]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => downloadCalculation(selectedCalculation)}
                className="px-4 py-2 bg-[#48E1FD] text-[#03041D] rounded-lg hover:bg-[#48E1FD]/90"
              >
                Generate Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
