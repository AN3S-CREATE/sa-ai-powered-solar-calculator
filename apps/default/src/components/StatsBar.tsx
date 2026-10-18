import React from 'react';
import { Zap, Battery, Leaf, Users } from 'lucide-react';

const StatsBar: React.FC = () => {
  const stats = [
    {
      icon: Zap,
      value: '85 MW',
      label: 'Annual Solar Output',
      color: 'text-[#D4FF00]'
    },
    {
      icon: Battery,
      value: '5 MW',
      label: 'Operational Solar Farm',
      color: 'text-[#D4FF00]'
    },
    {
      icon: Leaf,
      value: '123,165',
      label: 'Tons CO₂ Reduced',
      color: 'text-[#D4FF00]'
    },
    {
      icon: Users,
      value: '20+',
      label: 'Years Experience',
      color: 'text-[#D4FF00]'
    }
  ];

  return (
    <div className="bg-[#333333]/50 backdrop-blur-sm border-y border-[#D4FF00]/10">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#333333] flex items-center justify-center">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-[#CCCCCC]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsBar;