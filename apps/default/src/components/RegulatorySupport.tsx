import React, { useState } from 'react';
import { SolarCalculation } from './SolarCalculator';
import { Shield, CheckCircle, AlertCircle, FileText, Download, Clock, Building } from 'lucide-react';

interface RegulatorySupportProps {
  calculation: SolarCalculation | null;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  propertyTypes: string[];
}

export const RegulatorySupport: React.FC<RegulatorySupportProps> = ({ calculation }) => {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const toggleItem = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
  };

  const checklistItems: ChecklistItem[] = [
    {
      id: 'hoa-approval',
      title: 'HOA/Body Corporate Approval',
      description: 'Submit application to your homeowners association or body corporate for solar installation approval',
      required: true,
      completed: false,
      propertyTypes: ['sectional']
    },
    {
      id: 'municipal-approval',
      title: 'Municipal Building Approval',
      description: 'Some municipalities require building plan approval for solar installations',
      required: false,
      completed: false,
      propertyTypes: ['freehold', 'sectional']
    },
    {
      id: 'electrical-coc',
      title: 'Electrical Certificate of Compliance',
      description: 'Required electrical CoC from certified electrician after installation',
      required: true,
      completed: false,
      propertyTypes: ['freehold', 'sectional', 'rental']
    },
    {
      id: 'grid-tie-application',
      title: 'Grid-Tie Application',
      description: 'Apply to your municipality for grid-tie approval if feeding back to grid',
      required: false,
      completed: false,
      propertyTypes: ['freehold', 'sectional']
    },
    {
      id: 'insurance-notification',
      title: 'Insurance Notification',
      description: 'Notify your home insurance provider about the solar installation',
      required: true,
      completed: false,
      propertyTypes: ['freehold', 'sectional']
    },
    {
      id: 'structural-assessment',
      title: 'Structural Assessment',
      description: 'Ensure roof can support additional weight of solar panels',
      required: true,
      completed: false,
      propertyTypes: ['freehold', 'sectional', 'rental']
    },
    {
      id: 'landlord-permission',
      title: 'Landlord Permission',
      description: 'Written permission from property owner for solar installation',
      required: true,
      completed: false,
      propertyTypes: ['rental']
    }
  ];

  const documents = [
    {
      id: 'hoa-application',
      title: 'HOA Application Template',
      description: 'Pre-filled application for homeowners association approval',
      type: 'template',
      propertyTypes: ['sectional']
    },
    {
      id: 'municipal-plans',
      title: 'Municipal Building Plans',
      description: 'Technical drawings and specifications for municipal submission',
      type: 'technical',
      propertyTypes: ['freehold', 'sectional']
    },
    {
      id: 'electrical-specs',
      title: 'Electrical Specifications',
      description: 'Detailed electrical layout and component specifications',
      type: 'technical',
      propertyTypes: ['freehold', 'sectional', 'rental']
    },
    {
      id: 'insurance-letter',
      title: 'Insurance Notification Letter',
      description: 'Template letter to notify insurance company',
      type: 'template',
      propertyTypes: ['freehold', 'sectional']
    },
    {
      id: 'landlord-agreement',
      title: 'Landlord Agreement Form',
      description: 'Legal agreement template for rental properties',
      type: 'legal',
      propertyTypes: ['rental']
    }
  ];

  const getRelevantItems = () => {
    if (!calculation?.propertyType) return checklistItems;
    return checklistItems.filter(item => 
      item.propertyTypes.includes(calculation.propertyType)
    );
  };

  const getRelevantDocuments = () => {
    if (!calculation?.propertyType) return documents;
    return documents.filter(doc => 
      doc.propertyTypes.includes(calculation.propertyType)
    );
  };

  const getCompletionPercentage = () => {
    const relevantItems = getRelevantItems();
    if (relevantItems.length === 0) return 0;
    return Math.round((completedItems.size / relevantItems.length) * 100);
  };

  const generateDocument = (docId: string) => {
    // In a real app, this would generate actual documents
    const docContent = getDocumentContent(docId);
    const blob = new Blob([docContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docId}-${calculation?.userName || 'user'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDocumentContent = (docId: string): string => {
    const baseInfo = calculation ? `\nProperty Owner: ${calculation.userName}\nEmail: ${calculation.email}\nPhone: ${calculation.phone}\nProperty Location: ${calculation.location}\nSystem Size: ${calculation.systemSize}kWp\nInstallation Date: ${new Date().toLocaleDateString()}\n` : '';

    switch (docId) {
      case 'hoa-application':
        return `HOA SOLAR INSTALLATION APPLICATION\n\n${baseInfo}\n\nDear HOA Committee,\n\nI am writing to request approval for the installation of a solar photovoltaic system on my property. The proposed system will:\n\n- Generate clean, renewable energy\n- Reduce electricity costs\n- Increase property value\n- Comply with all safety regulations\n\nSystem Details:\n- Solar Panel Capacity: ${calculation?.systemSize}kWp\n- Battery Storage: ${calculation?.batterySize}kWh\n- Inverter Size: ${calculation?.inverterSize}kW\n- Estimated Cost: R${calculation?.totalCost?.toLocaleString()}\n\nThe installation will be performed by certified professionals and will comply with all municipal and electrical regulations. All necessary certificates of compliance will be obtained.\n\nI look forward to your approval.\n\nSincerely,\n${calculation?.userName}`;

      case 'insurance-letter':
        return `SOLAR INSTALLATION INSURANCE NOTIFICATION\n\n${baseInfo}\n\nDear Insurance Provider,\n\nI am writing to notify you of a planned solar installation on my insured property. This notification is to ensure continued coverage and compliance with policy requirements.\n\nInstallation Details:\n- System Value: R${calculation?.totalCost?.toLocaleString()}\n- Installation Date: [To be confirmed]\n- Installer: [Certified Solar Installer]\n- Warranty: 10-20 years manufacturer warranty\n\nPlease confirm:\n1. Coverage for the solar system under my existing policy\n2. Any premium adjustments required\n3. Additional documentation needed\n\nThank you for your attention to this matter.\n\nBest regards,\n${calculation?.userName}`;

      default:
        return `Document template for ${docId}\n\n${baseInfo}`;
    }
  };

  if (!calculation) {
    return (
      <div className="bg-[#333333] rounded-xl shadow-lg p-8 text-center border border-[#CCCCCC]/20">
        <Shield className="w-16 h-16 text-[#CCCCCC] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#FFFFFF] mb-2">Regulatory Support</h2>
        <p className="text-[#CCCCCC] mb-6">
          Complete a solar calculation first to get personalized regulatory guidance for your property type.
        </p>
        <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#CCCCCC]/20">
          <h3 className="font-semibold text-[#D4FF00] mb-2">General Requirements</h3>
          <ul className="text-sm text-[#CCCCCC] space-y-1 text-left">
            <li>• Electrical Certificate of Compliance (all installations)</li>
            <li>• HOA approval (sectional title properties)</li>
            <li>• Municipal approval (some areas)</li>
            <li>• Insurance notification</li>
            <li>• Structural assessment</li>
          </ul>
        </div>
      </div>
    );
  }

  const relevantItems = getRelevantItems();
  const relevantDocuments = getRelevantDocuments();
  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#333333] rounded-xl shadow-lg p-6 border border-[#CCCCCC]/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-[#D4FF00]" />
            <div>
              <h2 className="text-2xl font-bold text-[#FFFFFF]">Regulatory Support</h2>
              <p className="text-[#CCCCCC]">
                {calculation.propertyType === 'sectional' ? 'Sectional Title' : 
                 calculation.propertyType === 'rental' ? 'Rental Property' : 'Freehold'} Requirements
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#D4FF00]">{completionPercentage}%</div>
            <div className="text-sm text-[#CCCCCC]">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#1E1E1E] rounded-full h-2 mb-4">
          <div 
            className="bg-[#D4FF00] h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Property Type Alert */}
        {calculation.propertyType === 'sectional' && (
          <div className="bg-[#1E1E1E] border border-[#D4FF00]/30 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-[#D4FF00] mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#D4FF00]">Sectional Title Property</h4>
                <p className="text-sm text-[#CCCCCC]">
                  Additional approvals required from your HOA/Body Corporate. This process typically takes 2-6 weeks.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="bg-[#333333] rounded-xl shadow-lg p-6 border border-[#CCCCCC]/20">
        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-[#D4FF00]" />
          Compliance Checklist
        </h3>
        
        <div className="space-y-3">
          {relevantItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 border rounded-lg transition-colors ${
                completedItems.has(item.id) 
                  ? 'bg-[#1E1E1E] border-[#D4FF00]/50' 
                  : 'bg-[#1E1E1E] border-[#CCCCCC]/20 hover:border-[#CCCCCC]/40'
              }`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleItem(item.id)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    completedItems.has(item.id)
                      ? 'bg-[#D4FF00] border-[#D4FF00] text-[#1E1E1E]'
                      : 'border-[#CCCCCC]/50 hover:border-[#D4FF00]'
                  }`}
                >
                  {completedItems.has(item.id) && <CheckCircle className="w-3 h-3" />}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-medium ${
                      completedItems.has(item.id) ? 'text-[#D4FF00]' : 'text-[#FFFFFF]'
                    }`}>
                      {item.title}
                    </h4>
                    {item.required && (
                      <span className="px-2 py-1 bg-[#D4FF00]/20 text-[#D4FF00] text-xs rounded-full border border-[#D4FF00]/30">
                        Required
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${
                    completedItems.has(item.id) ? 'text-[#CCCCCC]' : 'text-[#CCCCCC]'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Templates */}
      <div className="bg-[#333333] rounded-xl shadow-lg p-6 border border-[#CCCCCC]/20">
        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-[#D4FF00]" />
          Document Templates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relevantDocuments.map((doc) => (
            <div key={doc.id} className="border border-[#CCCCCC]/20 rounded-lg p-4 hover:shadow-md transition-shadow bg-[#1E1E1E] hover:border-[#CCCCCC]/40">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-[#FFFFFF]">{doc.title}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  doc.type === 'template' ? 'bg-[#D4FF00]/20 text-[#D4FF00] border border-[#D4FF00]/30' :
                  doc.type === 'technical' ? 'bg-[#D4FF00]/20 text-[#D4FF00] border border-[#D4FF00]/30' :
                  'bg-[#D4FF00]/20 text-[#D4FF00] border border-[#D4FF00]/30'
                }`}>
                  {doc.type}
                </span>
              </div>
              <p className="text-sm text-[#CCCCCC] mb-3">{doc.description}</p>
              <button
                onClick={() => generateDocument(doc.id)}
                className="flex items-center space-x-2 text-[#D4FF00] hover:text-[#D4FF00]/80 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Generate Document</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-[#333333] rounded-xl shadow-lg p-6 border border-[#CCCCCC]/20">
        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-[#D4FF00]" />
          Typical Timeline
        </h3>
        
        <div className="space-y-4">
          {[
            { phase: 'Documentation Preparation', duration: '1-2 weeks', description: 'Gather documents and submit applications' },
            { phase: 'Approval Process', duration: calculation.propertyType === 'sectional' ? '2-6 weeks' : '1-3 weeks', description: 'Wait for HOA/municipal approvals' },
            { phase: 'Installation', duration: '1-3 days', description: 'Professional installation and testing' },
            { phase: 'Final Inspections', duration: '1 week', description: 'Electrical CoC and final approvals' }
          ].map((phase, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-[#1E1E1E] rounded-full flex items-center justify-center text-[#D4FF00] font-semibold text-sm border border-[#D4FF00]/30">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-[#FFFFFF]">{phase.phase}</h4>
                <p className="text-sm text-[#CCCCCC]">{phase.description}</p>
              </div>
              <div className="text-sm font-medium text-[#D4FF00]">{phase.duration}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Contact */}
      <div className="bg-gradient-to-r from-[#333333] to-[#1E1E1E] rounded-xl p-6 border border-[#CCCCCC]/20">
        <div className="flex items-center space-x-3 mb-4">
          <Building className="w-6 h-6 text-[#D4FF00]" />
          <h3 className="text-lg font-semibold text-[#FFFFFF]">Need Help?</h3>
        </div>
        <p className="text-[#CCCCCC] mb-4">
          Our regulatory specialists can help you navigate the approval process and ensure compliance.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-4 py-2 bg-[#D4FF00] text-[#1E1E1E] rounded-lg hover:bg-[#D4FF00]/90 font-medium">
            Schedule Consultation
          </button>
          <button className="px-4 py-2 border border-[#D4FF00] text-[#D4FF00] rounded-lg hover:bg-[#D4FF00]/10">
            Download Full Guide
          </button>
        </div>
      </div>
    </div>
  );
};