import React, { useState } from 'react';
import { SolarCalculation } from './SolarCalculator';
import { FileText, Download, Eye, Mail, Printer, Share2, CheckCircle, DollarSign, Zap, Battery, Sun } from 'lucide-react';

interface ProposalGeneratorProps {
  calculation: SolarCalculation | null;
}

export const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({ calculation }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('comprehensive');
  const [showPreview, setShowPreview] = useState(false);
  const [customizations, setCustomizations] = useState({
    includeFinancing: true,
    includeWarranty: true,
    includeEnvironmental: true,
    includeMaintenance: true,
    companyLogo: true,
    customerTestimonials: false
  });

  const templates = [
    {
      id: 'comprehensive',
      name: 'Comprehensive Proposal',
      description: 'Full detailed proposal with all technical specs, financials, and environmental impact',
      pages: '8-12 pages',
      features: ['Technical specifications', 'Financial analysis', 'Environmental impact', 'Installation timeline', 'Warranty details']
    },
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'Concise overview focusing on key benefits and ROI',
      pages: '3-4 pages',
      features: ['Key benefits', 'ROI summary', 'System overview', 'Next steps']
    },
    {
      id: 'technical',
      name: 'Technical Specification',
      description: 'Detailed technical document for engineers and installers',
      pages: '6-8 pages',
      features: ['Component specifications', 'Electrical diagrams', 'Installation requirements', 'Compliance details']
    }
  ];

  const generateProposal = async (format: 'pdf' | 'word' | 'email') => {
    if (!calculation) return;

    const proposalContent = createProposalContent();
    
    if (format === 'email') {
      const emailDraft = `To: ${calculation.email}\nSubject: Solar Proposal for ${calculation.userName}\n\n${proposalContent}`;
      await navigator.clipboard.writeText(emailDraft);
      window.alert('The proposal email draft was copied to the clipboard.');
      return;
    }

    // Generate downloadable file
    const blob = new Blob([proposalContent], { 
      type: format === 'pdf' ? 'application/pdf' : 'application/msword' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Solar-Proposal-${calculation.userName.replace(/\s+/g, '-')}.${format === 'pdf' ? 'pdf' : 'doc'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createProposalContent = (): string => {
    if (!calculation) return '';

    const template = templates.find(t => t.id === selectedTemplate);
    const currentDate = new Date().toLocaleDateString('en-ZA');

    return `
SOLAR ENERGY PROPOSAL
${template?.name}

Prepared for: ${calculation.userName}
Date: ${currentDate}
Property: ${calculation.location}

EXECUTIVE SUMMARY
================

Dear ${calculation.userName},

Thank you for your interest in solar energy solutions. Based on our analysis of your property and energy requirements, we are pleased to present this customized solar proposal.

SYSTEM OVERVIEW
===============

Recommended System Size: ${calculation.systemSize}kWp
Battery Storage: ${calculation.batterySize}kWh
Inverter Capacity: ${calculation.inverterSize}kW
Property Type: ${calculation.propertyType === 'sectional' ? 'Sectional Title' : calculation.propertyType === 'rental' ? 'Rental Property' : 'Freehold'}

FINANCIAL ANALYSIS
==================

Total Investment: R${calculation.totalCost?.toLocaleString()}
Monthly Savings: R${calculation.monthlySavings?.toLocaleString()}
Annual Savings: R${calculation.annualSavings?.toLocaleString()}
Payback Period: ${calculation.paybackPeriod} years
Return on Investment: ${((calculation.roi || 0) * 100).toFixed(1)}%

20-Year Financial Projection:
- Total Savings: R${((calculation.annualSavings || 0) * 20).toLocaleString()}
- Net Profit: R${(((calculation.annualSavings || 0) * 20) - (calculation.totalCost || 0)).toLocaleString()}

TECHNICAL SPECIFICATIONS
========================

Solar Panels:
- Technology: Monocrystalline Silicon
- Efficiency: 20-22%
- Warranty: 25 years performance, 12 years product
- Expected Lifespan: 25+ years

Battery System:
- Technology: Lithium Iron Phosphate (LiFePO4)
- Capacity: ${calculation.batterySize}kWh
- Warranty: 10 years
- Cycles: 6000+ cycles at 80% DoD

Inverter:
- Type: Hybrid Grid-Tie with Battery Backup
- Capacity: ${calculation.inverterSize}kW
- Efficiency: >97%
- Warranty: 10 years

ENVIRONMENTAL IMPACT
====================

Annual CO2 Reduction: ${Math.round((calculation.systemSize || 0) * 1.2)} tons
Equivalent to planting: ${Math.round((calculation.systemSize || 0) * 15)} trees annually
Clean Energy Generation: ${Math.round((calculation.systemSize || 0) * 1.5 * 365)} kWh/year

INSTALLATION PROCESS
====================

1. Site Survey & Final Design (1 week)
2. Permit Applications & Approvals (2-4 weeks)
3. Equipment Procurement (1-2 weeks)
4. Installation & Commissioning (2-3 days)
5. Final Inspections & Grid Connection (1 week)

Total Timeline: 6-10 weeks from contract signing

WARRANTY & SUPPORT
==================

- Solar Panels: 25-year performance warranty
- Inverter: 10-year manufacturer warranty
- Battery: 10-year warranty
- Installation: 5-year workmanship warranty
- Monitoring: Lifetime system monitoring included
- Maintenance: Annual inspection and cleaning service available

FINANCING OPTIONS
=================

1. Cash Purchase (Best ROI)
   - Full payment on installation
   - Maximum savings and fastest payback

2. Solar Loan
   - 6-12% interest rates available
   - Terms up to 10 years
   - Immediate savings from day one

3. Rent-to-Own
   - No upfront costs
   - Monthly payments lower than current electricity bill
   - Ownership transfer after 7-10 years

NEXT STEPS
==========

1. Review and approve this proposal
2. Schedule detailed site survey
3. Finalize system design and permits
4. Sign installation contract
5. Begin installation process

This proposal is valid for 30 days. Prices subject to change based on final site survey and current market conditions.

Contact Information:
AN3S Solar Intelligence
Generated locally for planning purposes
Phone: +27 21 123 4567

Thank you for choosing clean, renewable energy!

---
Generated on ${currentDate} for ${calculation.userName}
Proposal ID: ${Date.now().toString(36).toUpperCase()}
`;
  };

  if (!calculation) {
    return (
      <div className="bg-[#080A24] rounded-xl shadow-lg p-8 text-center border border-[#B2B1B6]/20">
        <FileText className="w-16 h-16 text-[#B2B1B6] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#FFFFFF] mb-2">Proposal Generator</h2>
        <p className="text-[#B2B1B6] mb-6">
          Complete a solar calculation first to generate professional proposals and documentation.
        </p>
        <div className="bg-[#03041D] rounded-lg p-4 border border-[#B2B1B6]/20">
          <h3 className="font-semibold text-[#48E1FD] mb-2">Available Formats</h3>
          <ul className="text-sm text-[#B2B1B6] space-y-1">
            <li>• PDF proposals for professional presentation</li>
            <li>• Word documents for easy customization</li>
            <li>• Email templates for quick sharing</li>
            <li>• Technical specifications for installers</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#080A24] rounded-xl shadow-lg p-6 border border-[#B2B1B6]/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-[#48E1FD]" />
            <div>
              <h2 className="text-2xl font-bold text-[#FFFFFF]">Proposal Generator</h2>
              <p className="text-[#B2B1B6]">Create professional solar proposals and documentation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-[#48E1FD]" />
            <span className="text-sm text-[#48E1FD] font-medium">Calculation Complete</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#03041D] rounded-lg border border-[#B2B1B6]/20">
          <div className="text-center">
            <Sun className="w-6 h-6 text-[#48E1FD] mx-auto mb-1" />
            <div className="text-lg font-bold text-[#FFFFFF]">{calculation.systemSize}kWp</div>
            <div className="text-xs text-[#B2B1B6]">System Size</div>
          </div>
          <div className="text-center">
            <Battery className="w-6 h-6 text-[#48E1FD] mx-auto mb-1" />
            <div className="text-lg font-bold text-[#FFFFFF]">{calculation.batterySize}kWh</div>
            <div className="text-xs text-[#B2B1B6]">Battery</div>
          </div>
          <div className="text-center">
            <DollarSign className="w-6 h-6 text-[#48E1FD] mx-auto mb-1" />
            <div className="text-lg font-bold text-[#FFFFFF]">R{calculation.totalCost?.toLocaleString()}</div>
            <div className="text-xs text-[#B2B1B6]">Investment</div>
          </div>
          <div className="text-center">
            <Zap className="w-6 h-6 text-[#48E1FD] mx-auto mb-1" />
            <div className="text-lg font-bold text-[#FFFFFF]">{calculation.paybackPeriod}y</div>
            <div className="text-xs text-[#B2B1B6]">Payback</div>
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div className="bg-[#080A24] rounded-xl shadow-lg p-6 border border-[#B2B1B6]/20">
        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4">Choose Proposal Template</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedTemplate === template.id
                  ? 'border-[#48E1FD] bg-[#48E1FD]/10'
                  : 'border-[#B2B1B6]/30 hover:border-[#B2B1B6]/50'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-[#FFFFFF]">{template.name}</h4>
                <span className="text-xs text-[#B2B1B6]">{template.pages}</span>
              </div>
              <p className="text-sm text-[#B2B1B6] mb-3">{template.description}</p>
              <ul className="text-xs text-[#B2B1B6] space-y-1">
                {template.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-[#48E1FD] mr-1" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Customization Options */}
        <div className="border-t border-[#B2B1B6]/20 pt-4">
          <h4 className="font-semibold text-[#FFFFFF] mb-3">Customization Options</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(customizations).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="rounded border-[#B2B1B6]/30 text-[#48E1FD] focus:ring-[#48E1FD] bg-[#03041D]"
                />
                <span className="text-[#B2B1B6]">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Generation Options */}
      <div className="bg-[#080A24] rounded-xl shadow-lg p-6 border border-[#B2B1B6]/20">
        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4">Generate & Share</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => generateProposal('pdf')}
            className="flex flex-col items-center p-4 border border-[#B2B1B6]/30 rounded-lg hover:shadow-md transition-shadow hover:bg-[#03041D]/50"
          >
            <Download className="w-8 h-8 text-[#48E1FD] mb-2" />
            <span className="font-medium text-[#FFFFFF]">Download PDF</span>
            <span className="text-xs text-[#B2B1B6]">Professional format</span>
          </button>
          
          <button
            onClick={() => generateProposal('word')}
            className="flex flex-col items-center p-4 border border-[#B2B1B6]/30 rounded-lg hover:shadow-md transition-shadow hover:bg-[#03041D]/50"
          >
            <FileText className="w-8 h-8 text-[#48E1FD] mb-2" />
            <span className="font-medium text-[#FFFFFF]">Download Word</span>
            <span className="text-xs text-[#B2B1B6]">Editable document</span>
          </button>
          
          <button
            onClick={() => generateProposal('email')}
            className="flex flex-col items-center p-4 border border-[#B2B1B6]/30 rounded-lg hover:shadow-md transition-shadow hover:bg-[#03041D]/50"
          >
            <Mail className="w-8 h-8 text-[#48E1FD] mb-2" />
            <span className="font-medium text-[#FFFFFF]">Email Client</span>
            <span className="text-xs text-[#B2B1B6]">Send directly</span>
          </button>
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex flex-col items-center p-4 border border-[#B2B1B6]/30 rounded-lg hover:shadow-md transition-shadow hover:bg-[#03041D]/50"
          >
            <Eye className="w-8 h-8 text-[#48E1FD] mb-2" />
            <span className="font-medium text-[#FFFFFF]">Preview</span>
            <span className="text-xs text-[#B2B1B6]">View content</span>
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#080A24] rounded-xl shadow-xl max-w-4xl max-h-[80vh] overflow-hidden border border-[#B2B1B6]/20">
            <div className="flex items-center justify-between p-4 border-b border-[#B2B1B6]/20">
              <h3 className="text-lg font-semibold text-[#FFFFFF]">Proposal Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-[#B2B1B6] hover:text-[#FFFFFF]"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm text-[#B2B1B6] font-mono">
                {createProposalContent()}
              </pre>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t border-[#B2B1B6]/20 bg-[#03041D]">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-[#B2B1B6] hover:text-[#FFFFFF]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  generateProposal('pdf');
                  setShowPreview(false);
                }}
                className="px-4 py-2 bg-[#48E1FD] text-[#03041D] rounded-lg hover:bg-[#48E1FD]/90"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Services */}
      <div className="bg-gradient-to-r from-[#080A24] to-[#03041D] rounded-xl p-6 border border-[#B2B1B6]/20">
        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4 flex items-center">
          <Share2 className="w-5 h-5 mr-2 text-[#48E1FD]" />
          Additional Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#03041D] rounded-lg p-4 border border-[#B2B1B6]/20">
            <h4 className="font-semibold text-[#FFFFFF] mb-2">Custom Branding</h4>
            <p className="text-sm text-[#B2B1B6] mb-3">
              Add your company logo and branding to proposals
            </p>
            <button
              type="button"
              onClick={() => {
                setCustomizations((current) => ({ ...current, companyLogo: true }));
                window.alert('Custom branding is enabled for this local proposal.');
              }}
              className="text-[#48E1FD] hover:text-[#48E1FD]/80 text-sm font-medium"
            >
              Setup Branding →
            </button>
          </div>
          <div className="bg-[#03041D] rounded-lg p-4 border border-[#B2B1B6]/20">
            <h4 className="font-semibold text-[#FFFFFF] mb-2">Digital Signatures</h4>
            <p className="text-sm text-[#B2B1B6] mb-3">
              Enable electronic signing for faster approvals
            </p>
            <button
              type="button"
              onClick={() => window.alert('Digital signatures require a separate local signing tool and are not enabled in this offline build.')}
              className="text-[#48E1FD] hover:text-[#48E1FD]/80 text-sm font-medium"
            >
              Enable E-Signatures →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
