import React from 'react';
import { BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';

export const UserGuide: React.FC = () => {
  return (
    <div className="bg-[#333333] rounded-xl shadow-lg p-6 border border-[#CCCCCC]/20">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#FFFFFF] mb-2 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-[#D4FF00]" />
          Solar Calculator Guide
        </h2>
        <p className="text-sm text-[#CCCCCC]">
          Everything you need to know about calculating your solar solution with IO Green
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What You'll Need */}
        <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#D4FF00]/20">
          <h3 className="font-semibold text-[#D4FF00] text-sm mb-3">What You'll Need:</h3>
          <ul className="text-xs text-[#FFFFFF] space-y-2">
            <li className="flex items-center">
              <CheckCircle className="w-3 h-3 text-[#D4FF00] mr-2 flex-shrink-0" />
              Recent electricity bill
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-3 h-3 text-[#D4FF00] mr-2 flex-shrink-0" />
              Property location details
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-3 h-3 text-[#D4FF00] mr-2 flex-shrink-0" />
              Roof size and orientation
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-3 h-3 text-[#D4FF00] mr-2 flex-shrink-0" />
              Property type information
            </li>
          </ul>
        </div>

        {/* Process Overview */}
        <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#D4FF00]/20">
          <h3 className="font-semibold text-[#D4FF00] text-sm mb-3">Process Overview:</h3>
          <ol className="text-xs text-[#FFFFFF] space-y-2">
            <li className="flex items-center">
              <div className="w-5 h-5 bg-[#D4FF00] text-[#1E1E1E] rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">1</div>
              Enter your personal details
            </li>
            <li className="flex items-center">
              <div className="w-5 h-5 bg-[#D4FF00] text-[#1E1E1E] rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">2</div>
              Provide electricity usage info
            </li>
            <li className="flex items-center">
              <div className="w-5 h-5 bg-[#D4FF00] text-[#1E1E1E] rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">3</div>
              Add property specifications
            </li>
            <li className="flex items-center">
              <div className="w-5 h-5 bg-[#D4FF00] text-[#1E1E1E] rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">4</div>
              Review and calculate
            </li>
          </ol>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-[#1E1E1E] to-[#333333] rounded-lg border border-[#D4FF00]/20">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-[#D4FF00]" />
          <h3 className="font-semibold text-sm text-[#FFFFFF]">Quick Tips</h3>
        </div>
        <ul className="text-xs text-[#CCCCCC] space-y-1">
          <li>• Have your latest electricity bill ready</li>
          <li>• Measure your roof area if possible</li>
          <li>• Consider future energy needs</li>
          <li>• Check for any roof obstructions</li>
        </ul>
      </div>

      {/* Contact Support */}
      <div className="mt-4 p-3 bg-[#1E1E1E] rounded-lg border border-[#D4FF00]/20">
        <h3 className="font-semibold text-sm text-[#D4FF00] mb-2">Need Help?</h3>
        <p className="text-xs text-[#CCCCCC] mb-2">
          Our solar experts at IO Green are here to assist you with personalized service and transparent communication.
        </p>
        <button className="text-xs text-[#D4FF00] hover:text-[#FFFFFF] font-medium transition-colors">
          Contact Support →
        </button>
      </div>
    </div>
  );
};