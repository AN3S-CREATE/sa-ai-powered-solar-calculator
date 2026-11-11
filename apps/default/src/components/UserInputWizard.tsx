import React, { useState, useEffect } from 'react';
import { MapPin, Home, Zap, User, Mail, Phone, Calculator } from 'lucide-react';
import { SolarCalculation } from './SolarCalculator';

interface UserInputWizardProps {
  onCalculate: (calculation: SolarCalculation) => void;
  loading: boolean;
}

export const UserInputWizard: React.FC<UserInputWizardProps> = ({ onCalculate, loading }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SolarCalculation>({
    userName: '',
    email: '',
    phone: '',
    monthlyBill: 0,
    location: '',
    roofOrientation: '',
    roofSize: 0,
    loadshedding: 'medium',
    propertyType: 'freehold'
  });

  // Auto-detect location (simplified for demo)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode these coordinates
          setFormData(prev => ({ ...prev, location: 'Cape Town, Western Cape' }));
        },
        () => {
          // Fallback if geolocation fails
          setFormData(prev => ({ ...prev, location: 'Johannesburg, Gauteng' }));
        }
      );
    }
  }, []);

  const handleInputChange = (field: keyof SolarCalculation, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(formData);
  };

  const nextStep = () => setStep(Math.min(step + 1, 4));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.userName && formData.email && formData.phone;
      case 2:
        return formData.monthlyBill > 0;
      case 3:
        return formData.location && formData.roofOrientation && formData.roofSize > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Electricity Bill', icon: Zap },
    { number: 3, title: 'Property Details', icon: Home },
    { number: 4, title: 'Review & Calculate', icon: Calculator }
  ];

  return (
    <div className="bg-[#080A24] rounded-xl shadow-lg p-6 border border-[#B2B1B6]/20">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#FFFFFF] mb-2">Solar System Calculator</h2>
        <p className="text-[#B2B1B6]">Get your personalized solar solution in 4 easy steps</p>
      </div>

      {/* Progress Steps - Compact Version */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = step === s.number;
            const isCompleted = step > s.number;
            
            return (
              <div key={s.number} className="flex flex-col items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors mb-2 ${
                  isCompleted 
                    ? 'bg-[#48E1FD] border-[#48E1FD] text-[#03041D]'
                    : isActive 
                      ? 'border-[#48E1FD] text-[#48E1FD] bg-[#48E1FD]/10'
                      : 'border-[#B2B1B6] text-[#B2B1B6]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-medium ${isActive ? 'text-[#48E1FD]' : isCompleted ? 'text-[#48E1FD]' : 'text-[#B2B1B6]'}`}>
                    Step {s.number}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-[#48E1FD]' : isCompleted ? 'text-[#48E1FD]' : 'text-[#B2B1B6]'}`}>
                    {s.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`absolute top-4 w-full h-0.5 ${isCompleted ? 'bg-[#48E1FD]' : 'bg-[#B2B1B6]/30'}`}
                       style={{ 
                         left: `${(100 / steps.length) * (index + 0.5)}%`, 
                         width: `${100 / steps.length}%`,
                         zIndex: -1
                       }} />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-[#B2B1B6]/30 rounded-full h-2">
          <div 
            className="bg-[#48E1FD] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => handleInputChange('userName', e.target.value)}
                className="w-full px-4 py-3 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#03041D] text-[#FFFFFF] placeholder-[#B2B1B6]"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#03041D] text-[#FFFFFF] placeholder-[#B2B1B6]"
                placeholder="your.email@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#03041D] text-[#FFFFFF] placeholder-[#B2B1B6]"
                placeholder="+27 82 123 4567"
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Electricity Bill */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                <Zap className="w-4 h-4 inline mr-2" />
                Monthly Electricity Bill (Rands)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B2B1B6] text-lg">R</span>
                <input
                  type="number"
                  value={formData.monthlyBill || ''}
                  onChange={(e) => handleInputChange('monthlyBill', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#03041D] text-[#FFFFFF] placeholder-[#B2B1B6]"
                  placeholder="2,500"
                  min="0"
                  step="50"
                  required
                />
              </div>
              <p className="text-sm text-[#B2B1B6] mt-2">
                Enter your average monthly electricity bill amount in South African Rands
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                Load-shedding Frequency
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'low', label: 'Low (1-2 times/week)', color: '#48E1FD' },
                  { value: 'medium', label: 'Medium (3-4 times/week)', color: '#48E1FD' },
                  { value: 'high', label: 'High (Daily)', color: '#48E1FD' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-3 border border-[#B2B1B6]/30 rounded-lg cursor-pointer hover:bg-[#03041D]/50">
                    <input
                      type="radio"
                      name="loadshedding"
                      value={option.value}
                      checked={formData.loadshedding === option.value}
                      onChange={(e) => handleInputChange('loadshedding', e.target.value)}
                      className="mr-3 text-[#48E1FD] focus:ring-[#48E1FD]"
                    />
                    <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: option.color }} />
                    <span className="text-[#FFFFFF]">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Property Details */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-3 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#03041D] text-[#FFFFFF] placeholder-[#B2B1B6]"
                placeholder="Cape Town, Western Cape"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                Roof Orientation
              </label>
              <select
                value={formData.roofOrientation}
                onChange={(e) => handleInputChange('roofOrientation', e.target.value)}
                className="w-full px-4 py-3 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#03041D] text-[#FFFFFF]"
                required
              >
                <option value="">Select orientation</option>
                <option value="North">North (Best)</option>
                <option value="North-East">North-East</option>
                <option value="North-West">North-West</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
                <option value="South">South</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                Available Roof Size (m²)
              </label>
              <input
                type="number"
                value={formData.roofSize || ''}
                onChange={(e) => handleInputChange('roofSize', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-[#B2B1B6]/30 rounded-lg focus:ring-2 focus:ring-[#48E1FD] focus:border-transparent bg-[#03041D] text-[#FFFFFF] placeholder-[#B2B1B6]"
                placeholder="120"
                min="0"
                step="5"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF] mb-2">
                Property Type
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'freehold', label: 'Freehold Property' },
                  { value: 'sectional', label: 'Sectional Title/Complex' },
                  { value: 'rental', label: 'Rental Property' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-3 border border-[#B2B1B6]/30 rounded-lg cursor-pointer hover:bg-[#03041D]/50">
                    <input
                      type="radio"
                      name="propertyType"
                      value={option.value}
                      checked={formData.propertyType === option.value}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                      className="mr-3 text-[#48E1FD] focus:ring-[#48E1FD]"
                    />
                    <span className="text-[#FFFFFF]">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#FFFFFF]">Review Your Information</h3>
            
            <div className="bg-[#03041D] rounded-lg p-4 space-y-3 border border-[#B2B1B6]/20">
              <div className="flex justify-between">
                <span className="text-[#B2B1B6]">Name:</span>
                <span className="font-medium text-[#FFFFFF]">{formData.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B2B1B6]">Email:</span>
                <span className="font-medium text-[#FFFFFF]">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B2B1B6]">Monthly Bill:</span>
                <span className="font-medium text-[#48E1FD]">R{formData.monthlyBill.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B2B1B6]">Location:</span>
                <span className="font-medium text-[#FFFFFF]">{formData.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B2B1B6]">Roof Size:</span>
                <span className="font-medium text-[#FFFFFF]">{formData.roofSize}m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#B2B1B6]">Property Type:</span>
                <span className="font-medium text-[#FFFFFF] capitalize">{formData.propertyType}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-3 border border-[#B2B1B6]/30 rounded-lg text-[#B2B1B6] hover:bg-[#03041D]/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid()}
              className="px-6 py-3 bg-[#48E1FD] text-[#03041D] rounded-lg hover:bg-[#48E1FD]/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !isStepValid()}
              className="px-8 py-3 bg-[#48E1FD] text-[#03041D] rounded-lg hover:bg-[#48E1FD]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#03041D]"></div>
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>Calculate Solar System</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
