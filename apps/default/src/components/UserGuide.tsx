import React from 'react';
import { BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';

export const UserGuide: React.FC = () => {
  return (
    <div className="bg-[#080A24] rounded-xl shadow-lg p-6 border border-[#B2B1B6]/20">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#FFFFFF] mb-2 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-[#48E1FD]" />
          Solar Calculator Guide
        </h2>
        <p className="text-sm text-[#B2B1B6]">
          How to use AN3S Solar Intelligence for a private, local planning estimate
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What You'll Need */}
        <div className="bg-[#03041D] rounded-lg p-4 border border-[#48E1FD]/20">
          <h3 className="font-semibold text-[#48E1FD] text-sm mb-3">What You'll Need:</h3>
          <ul className="text-xs text-[#FFFFFF] space-y-2">
            <li className="flex items-center">
              <CheckCircle className="w-3 h-3 text-[#48E1FD] mr-2 flex-shrink-0" />
              Recent electricity bill
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-3 h-3 text-[#48E1FD] mr-2 flex-shrink-0" />
              Property location details
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-3 h-3 text-[#48E1FD] mr-2 flex-shrink-0" />
              Roof size and orientation
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-3 h-3 text-[#48E1FD] mr-2 flex-shrink-0" />
              Property type information
            </li>
          </ul>
        </div>

        {/* Process Overview */}
        <div className="bg-[#03041D] rounded-lg p-4 border border-[#48E1FD]/20">
          <h3 className="font-semibold text-[#48E1FD] text-sm mb-3">Process Overview:</h3>
          <ol className="text-xs text-[#FFFFFF] space-y-2">
            <li className="flex items-center">
              <div className="w-5 h-5 bg-[#48E1FD] text-[#03041D] rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">1</div>
              Enter your personal details
            </li>
            <li className="flex items-center">
              <div className="w-5 h-5 bg-[#48E1FD] text-[#03041D] rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">2</div>
              Provide electricity usage info
            </li>
            <li className="flex items-center">
              <div className="w-5 h-5 bg-[#48E1FD] text-[#03041D] rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">3</div>
              Add property specifications
            </li>
            <li className="flex items-center">
              <div className="w-5 h-5 bg-[#48E1FD] text-[#03041D] rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">4</div>
              Review and calculate
            </li>
          </ol>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#03041D] to-[#080A24] rounded-lg border border-[#48E1FD]/20">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-[#48E1FD]" />
          <h3 className="font-semibold text-sm text-[#FFFFFF]">Quick Tips</h3>
        </div>
        <ul className="text-xs text-[#B2B1B6] space-y-1">
          <li>• Have your latest electricity bill ready</li>
          <li>• Measure your roof area if possible</li>
          <li>• Consider future energy needs</li>
          <li>• Check for any roof obstructions</li>
        </ul>
      </div>

      {/* Contact Support */}
      <div className="mt-4 p-3 bg-[#03041D] rounded-lg border border-[#48E1FD]/20">
        <h3 className="font-semibold text-sm text-[#48E1FD] mb-2">Need Help?</h3>
        <p className="text-xs text-[#B2B1B6] mb-2">
          Use the local assistant and exported workspace records to prepare questions for a qualified solar provider.
        </p>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard
              .writeText('AN3S Solar Intelligence stores support context in the local workspace settings.')
              .then(() => window.alert('Local support details copied to the clipboard.'))
              .catch(() => window.alert('Open Local Settings for support and operator configuration.'));
          }}
          className="text-xs text-[#48E1FD] hover:text-[#FFFFFF] font-medium transition-colors"
        >
          Contact Support →
        </button>
      </div>
    </div>
  );
};
