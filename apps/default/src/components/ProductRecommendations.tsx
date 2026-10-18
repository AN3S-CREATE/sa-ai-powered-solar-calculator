import React, { useState, useEffect } from 'react';
import { ArrowLeft, Battery, Zap, Sun, Shield, Star, Check, Info, Calculator, ShoppingCart, CreditCard, Mail, Phone, DollarSign, Calendar } from 'lucide-react';
import { CalculatorResults, CalculatorData } from '../App';

interface ProductRecommendationsProps {
  results: CalculatorResults;
  calculatorData: CalculatorData;
  onBack: () => void;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  type: 'panel' | 'battery' | 'inverter';
  capacity: string;
  efficiency?: string;
  warranty: string;
  price: number;
  features: string[];
  recommended?: boolean;
  image?: string;
}

interface SelectedProduct {
  productId: string;
  quantity: number;
}

interface FinancingOption {
  id: string;
  name: string;
  description: string;
  interestRate: number;
  termMonths: number;
  downPaymentPercent: number;
  features: string[];
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ 
  results, 
  calculatorData, 
  onBack 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'panel' | 'battery' | 'inverter'>('all');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [showFinancing, setShowFinancing] = useState(false);
  const [selectedFinancing, setSelectedFinancing] = useState<string | null>(null);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // Financing options
  const financingOptions: FinancingOption[] = [
    {
      id: 'cash',
      name: 'Cash Purchase',
      description: 'Pay in full upfront for maximum savings',
      interestRate: 0,
      termMonths: 0,
      downPaymentPercent: 100,
      features: ['No interest charges', 'Maximum ROI', 'Immediate ownership', 'Best long-term value']
    },
    {
      id: 'solar-loan-5',
      name: '5-Year Solar Loan',
      description: 'Competitive rates with manageable monthly payments',
      interestRate: 8.5,
      termMonths: 60,
      downPaymentPercent: 10,
      features: ['8.5% interest rate', 'Quick approval', 'No prepayment penalties', 'Immediate savings']
    },
    {
      id: 'solar-loan-10',
      name: '10-Year Solar Loan',
      description: 'Lower monthly payments with extended terms',
      interestRate: 9.5,
      termMonths: 120,
      downPaymentPercent: 10,
      features: ['9.5% interest rate', 'Lower monthly payments', 'Extended warranty coverage', 'Flexible terms']
    },
    {
      id: 'rent-to-own',
      name: 'Rent-to-Own',
      description: 'No upfront costs, own after 7 years',
      interestRate: 12,
      termMonths: 84,
      downPaymentPercent: 0,
      features: ['No upfront payment', 'Maintenance included', 'Ownership after 7 years', 'Immediate installation']
    }
  ];

  // Sample product data
  const products: Product[] = [
    // Solar Panels
    {
      id: 'panel-1',
      name: 'Monocrystalline Solar Panel',
      brand: 'JA Solar',
      type: 'panel',
      capacity: '540W',
      efficiency: '21.2%',
      warranty: '25 years',
      price: 2800,
      features: ['High efficiency', 'Weather resistant', 'Anti-reflective coating', 'Hail resistant'],
      recommended: true
    },
    {
      id: 'panel-2',
      name: 'Polycrystalline Solar Panel',
      brand: 'Trina Solar',
      type: 'panel',
      capacity: '450W',
      efficiency: '19.8%',
      warranty: '25 years',
      price: 2200,
      features: ['Cost effective', 'Reliable performance', 'Good low-light performance']
    },
    {
      id: 'panel-3',
      name: 'Bifacial Solar Panel',
      brand: 'Longi Solar',
      type: 'panel',
      capacity: '580W',
      efficiency: '22.1%',
      warranty: '25 years',
      price: 3200,
      features: ['Dual-sided generation', 'Higher energy yield', 'Premium efficiency', 'Excellent durability']
    },

    // Batteries
    {
      id: 'battery-1',
      name: 'Lithium Iron Phosphate Battery',
      brand: 'Pylontech',
      type: 'battery',
      capacity: '5.12kWh',
      warranty: '10 years',
      price: 45000,
      features: ['Long lifespan', 'Safe chemistry', 'Modular design', 'Smart BMS'],
      recommended: true
    },
    {
      id: 'battery-2',
      name: 'Lithium Battery Pack',
      brand: 'Hubble',
      type: 'battery',
      capacity: '5.5kWh',
      warranty: '10 years',
      price: 42000,
      features: ['High energy density', 'Fast charging', 'Compact design', 'Built-in monitoring']
    },
    {
      id: 'battery-3',
      name: 'High Capacity LiFePO4',
      brand: 'Freedom Won',
      type: 'battery',
      capacity: '10kWh',
      warranty: '10 years',
      price: 85000,
      features: ['Large capacity', 'South African made', 'Excellent cycle life', 'Remote monitoring']
    },

    // Inverters
    {
      id: 'inverter-1',
      name: 'Hybrid Solar Inverter',
      brand: 'Sunsynk',
      type: 'inverter',
      capacity: '8kW',
      efficiency: '97.6%',
      warranty: '5 years',
      price: 18000,
      features: ['Grid-tie with backup', 'MPPT charge controller', 'WiFi monitoring', 'Load shedding protection'],
      recommended: true
    },
    {
      id: 'inverter-2',
      name: 'Pure Sine Wave Inverter',
      brand: 'Victron Energy',
      type: 'inverter',
      capacity: '5kW',
      efficiency: '96%',
      warranty: '5 years',
      price: 22000,
      features: ['Premium quality', 'Pure sine wave', 'Remote monitoring', 'Excellent reliability']
    },
    {
      id: 'inverter-3',
      name: 'Smart Grid-Tie Inverter',
      brand: 'Goodwe',
      type: 'inverter',
      capacity: '10kW',
      efficiency: '98.2%',
      warranty: '10 years',
      price: 25000,
      features: ['High efficiency', 'Smart monitoring', 'Grid support', 'Easy installation']
    }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.type === selectedCategory);

  const getRecommendedQuantities = () => {
    // Calculate panels needed based on system size and panel capacity
    const recommendedPanel = products.find(p => p.type === 'panel' && p.recommended);
    const panelCapacityKw = recommendedPanel ? parseFloat(recommendedPanel.capacity) / 1000 : 0.54; // Default 540W
    const panelsNeeded = Math.ceil(results.systemSize / panelCapacityKw);
    
    // Calculate batteries needed based on battery size and battery capacity
    const recommendedBattery = products.find(p => p.type === 'battery' && p.recommended);
    const batteryCapacityKwh = recommendedBattery ? parseFloat(recommendedBattery.capacity) : 5.12; // Default 5.12kWh
    const batteriesNeeded = Math.ceil(results.batterySize / batteryCapacityKwh);
    
    return {
      panels: panelsNeeded,
      batteries: batteriesNeeded,
      inverters: 1 // Usually 1 inverter per system
    };
  };

  const recommendations = getRecommendedQuantities();

  // Initialize with recommended products
  useEffect(() => {
    const recommendedProducts: SelectedProduct[] = [];
    
    // Add recommended panel
    const recommendedPanel = products.find(p => p.type === 'panel' && p.recommended);
    if (recommendedPanel) {
      recommendedProducts.push({
        productId: recommendedPanel.id,
        quantity: recommendations.panels
      });
    }
    
    // Add recommended battery
    const recommendedBattery = products.find(p => p.type === 'battery' && p.recommended);
    if (recommendedBattery) {
      recommendedProducts.push({
        productId: recommendedBattery.id,
        quantity: recommendations.batteries
      });
    }
    
    // Add recommended inverter
    const recommendedInverter = products.find(p => p.type === 'inverter' && p.recommended);
    if (recommendedInverter) {
      recommendedProducts.push({
        productId: recommendedInverter.id,
        quantity: recommendations.inverters
      });
    }
    
    setSelectedProducts(recommendedProducts);
  }, [recommendations.panels, recommendations.batteries, recommendations.inverters]);

  const toggleProductSelection = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setSelectedProducts(prev => {
      const existingIndex = prev.findIndex(p => p.productId === productId);
      
      if (existingIndex >= 0) {
        // Remove product
        return prev.filter(p => p.productId !== productId);
      } else {
        // Add product with recommended quantity
        let quantity = 1;
        if (product.type === 'panel') quantity = recommendations.panels;
        else if (product.type === 'battery') quantity = recommendations.batteries;
        else if (product.type === 'inverter') quantity = recommendations.inverters;
        
        // Remove other products of the same type first
        const filtered = prev.filter(p => {
          const existingProduct = products.find(prod => prod.id === p.productId);
          return existingProduct?.type !== product.type;
        });
        
        return [...filtered, { productId, quantity }];
      }
    });
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev => 
      prev.map(p => 
        p.productId === productId 
          ? { ...p, quantity: Math.max(1, quantity) }
          : p
      )
    );
  };

  const calculatePricing = () => {
    const subtotal = selectedProducts.reduce((total, selectedProduct) => {
      const product = products.find(p => p.id === selectedProduct.productId);
      return total + (product?.price || 0) * selectedProduct.quantity;
    }, 0);
    
    const vat = subtotal * 0.15; // 15% VAT
    const total = subtotal + vat;
    
    return { subtotal, vat, total };
  };

  const calculateFinancing = (total: number, option: FinancingOption) => {
    if (option.id === 'cash') {
      return {
        downPayment: total,
        monthlyPayment: 0,
        totalInterest: 0,
        totalPayment: total
      };
    }

    const downPayment = total * (option.downPaymentPercent / 100);
    const loanAmount = total - downPayment;
    const monthlyRate = option.interestRate / 100 / 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, option.termMonths)) / (Math.pow(1 + monthlyRate, option.termMonths) - 1);
    const totalPayment = downPayment + (monthlyPayment * option.termMonths);
    const totalInterest = totalPayment - total;

    return {
      downPayment,
      monthlyPayment,
      totalInterest,
      totalPayment
    };
  };

  const pricing = calculatePricing();

  const isProductSelected = (productId: string) => {
    return selectedProducts.some(p => p.productId === productId);
  };

  const getSelectedQuantity = (productId: string) => {
    const selected = selectedProducts.find(p => p.productId === productId);
    return selected?.quantity || 0;
  };

  const handleRequestQuote = async () => {
    setIsSubmittingQuote(true);
    
    try {
      // Prepare quote data
      const selectedProductDetails = selectedProducts.map(sp => {
        const product = products.find(p => p.id === sp.productId);
        return {
          name: product?.name || '',
          brand: product?.brand || '',
          quantity: sp.quantity,
          unitPrice: product?.price || 0,
          lineTotal: (product?.price || 0) * sp.quantity
        };
      });

      const financingDetails = selectedFinancing ? 
        financingOptions.find(f => f.id === selectedFinancing) : null;
      
      const financingCalc = financingDetails ? 
        calculateFinancing(pricing.total, financingDetails) : null;

      // Create email content
      const emailSubject = `Solar System Quote Request - Customer`;
      const emailBody = `
SOLAR SYSTEM QUOTE REQUEST
==========================

Customer Information:
- Location: ${calculatorData.location || 'Not provided'}

System Requirements:
- System Size: ${results.systemSize}kW
- Battery Size: ${results.batterySize}kWh
- Inverter Size: ${results.inverterSize}kW
- Property Type: ${calculatorData.propertyType}
- Load-shedding Frequency: ${calculatorData.loadshedding}

Selected Products:
${selectedProductDetails.map(p => 
  `- ${p.name} (${p.brand}): ${p.quantity} units × R${p.unitPrice.toLocaleString()} = R${p.lineTotal.toLocaleString()}`
).join('\n')}

Pricing Summary:
- Subtotal: R${pricing.subtotal.toLocaleString()}
- VAT (15%): R${pricing.vat.toLocaleString()}
- Total (incl. VAT): R${pricing.total.toLocaleString()}

${financingDetails ? `
Financing Option: ${financingDetails.name}
- Down Payment: R${financingCalc?.downPayment.toLocaleString()}
- Monthly Payment: R${financingCalc?.monthlyPayment.toLocaleString()}
- Term: ${financingDetails.termMonths} months
- Total Interest: R${financingCalc?.totalInterest.toLocaleString()}
` : ''}

Please contact the customer to provide a detailed quote and schedule a site assessment.

Generated on: ${new Date().toLocaleString()}
      `.trim();

      // Create mailto link
      const mailtoLink = `mailto:sales@iogreenenergy.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Open email client
      window.open(mailtoLink);
      
      // Also save to database
      await fetch('/api/taskade/projects/aCGbHMAbWUZzTmna/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          '/text': `Quote Request - Customer - ${new Date().toLocaleDateString()}`,
          '/attributes/@calc1': 'Anonymous Customer',
          '/attributes/@calc2': '',
          '/attributes/@calc3': '',
          '/attributes/@calc4': calculatorData.monthlyBill,
          '/attributes/@calc5': calculatorData.location || '',
          '/attributes/@calc6': calculatorData.roofOrientation || '',
          '/attributes/@calc7': calculatorData.roofSize,
          '/attributes/@calc8': calculatorData.loadshedding,
          '/attributes/@calc9': results.systemSize,
          '/attributes/@calc10': results.batterySize,
          '/attributes/@calc11': results.inverterSize,
          '/attributes/@calc12': results.monthlySavings,
          '/attributes/@calc13': results.annualSavings,
          '/attributes/@calc14': results.paybackPeriod,
          '/attributes/@calc15': results.roi,
          '/attributes/@calc16': pricing.total,
          '/attributes/@calc17': calculatorData.propertyType,
          '/attributes/@calc18': 'quote',
          '/attributes/note': `Quote request with selected products. Total: R${pricing.total.toLocaleString()} ${financingDetails ? `| Financing: ${financingDetails.name}` : ''}`
        }),
      });

      alert('Quote request sent successfully! Our sales team will contact you within 24 hours.');
      
    } catch (error) {
      console.error('Error sending quote request:', error);
      alert('There was an error sending your quote request. Please try again or contact us directly at sales@iogreenenergy.com');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const isSelected = isProductSelected(product.id);
    const quantity = getSelectedQuantity(product.id);
    const Icon = product.type === 'panel' ? Sun : product.type === 'battery' ? Battery : Zap;

    let recommendedQuantity = 1;
    if (product.type === 'panel') recommendedQuantity = recommendations.panels;
    else if (product.type === 'battery') recommendedQuantity = recommendations.batteries;
    else if (product.type === 'inverter') recommendedQuantity = recommendations.inverters;

    return (
      <div 
        className={`bg-[#333333]/80 backdrop-blur-sm rounded-2xl border transition-all duration-300 ${
          isSelected 
            ? 'border-[#D4FF00]/50 shadow-lg shadow-[#D4FF00]/20' 
            : 'border-[#333333] hover:border-[#D4FF00]/30'
        } ${product.recommended ? 'ring-2 ring-[#D4FF00]/30' : ''}`}
      >
        {product.recommended && (
          <div className="bg-[#D4FF00] text-[#1E1E1E] text-xs px-3 py-1 rounded-t-2xl text-center font-bold">
            RECOMMENDED
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D4FF00]/20 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#D4FF00]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                <p className="text-sm text-[#CCCCCC]">{product.brand}</p>
              </div>
            </div>
            <button
              onClick={() => toggleProductSelection(product.id)}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-[#D4FF00] border-[#D4FF00] text-[#1E1E1E]'
                  : 'border-[#CCCCCC]/50 hover:border-[#D4FF00]'
              }`}
            >
              {isSelected && <Check className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-[#CCCCCC]">Capacity</p>
              <p className="text-sm font-semibold text-white">{product.capacity}</p>
            </div>
            {product.efficiency && (
              <div>
                <p className="text-xs text-[#CCCCCC]">Efficiency</p>
                <p className="text-sm font-semibold text-white">{product.efficiency}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-[#CCCCCC]">Warranty</p>
              <p className="text-sm font-semibold text-white">{product.warranty}</p>
            </div>
            <div>
              <p className="text-xs text-[#CCCCCC]">Unit Price</p>
              <p className="text-sm font-semibold text-[#D4FF00]">R{product.price.toLocaleString()}</p>
            </div>
          </div>

          {isSelected && (
            <div className="mb-4 p-3 bg-[#1E1E1E] rounded-lg border border-[#D4FF00]/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#CCCCCC]">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateProductQuantity(product.id, quantity - 1)}
                    className="w-6 h-6 bg-[#333333] hover:bg-[#D4FF00]/20 rounded text-[#D4FF00] flex items-center justify-center"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-white font-medium w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => updateProductQuantity(product.id, quantity + 1)}
                    className="w-6 h-6 bg-[#333333] hover:bg-[#D4FF00]/20 rounded text-[#D4FF00] flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#CCCCCC]">Recommended: {recommendedQuantity}</span>
                <span className="text-[#D4FF00] font-semibold">
                  Total: R{(product.price * quantity).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="mb-4">
            <p className="text-xs text-[#CCCCCC] mb-2">Key Features</p>
            <div className="flex flex-wrap gap-1">
              {product.features.slice(0, 3).map((feature, index) => (
                <span key={index} className="text-xs bg-[#333333] text-[#CCCCCC] px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
              {product.features.length > 3 && (
                <span className="text-xs text-[#CCCCCC]">+{product.features.length - 3} more</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,255,0,0.05),transparent_50%)]"></div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-[#333333]/80 hover:bg-[#333333] rounded-full flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Product Recommendations</h1>
              <p className="text-[#CCCCCC]">Based on your {results.systemSize}kW solar system calculation</p>
            </div>
          </div>

          {/* System Summary */}
          <div className="bg-[#333333]/80 backdrop-blur-sm rounded-2xl border border-[#D4FF00]/20 p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Your System Requirements</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#D4FF00]/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Sun className="w-6 h-6 text-[#D4FF00]" />
                </div>
                <p className="text-2xl font-bold text-white">{recommendations.panels}</p>
                <p className="text-sm text-[#CCCCCC]">Solar Panels Needed</p>
                <p className="text-xs text-[#CCCCCC]/70">~{results.systemSize}kW total</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#D4FF00]/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Battery className="w-6 h-6 text-[#D4FF00]" />
                </div>
                <p className="text-2xl font-bold text-white">{recommendations.batteries}</p>
                <p className="text-sm text-[#CCCCCC]">Battery Units Needed</p>
                <p className="text-xs text-[#CCCCCC]/70">~{results.batterySize}kWh total</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#D4FF00]/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-[#D4FF00]" />
                </div>
                <p className="text-2xl font-bold text-white">{recommendations.inverters}</p>
                <p className="text-sm text-[#CCCCCC]">Inverter Required</p>
                <p className="text-xs text-[#CCCCCC]/70">~{results.inverterSize}kW capacity</p>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-4 mb-8">
            {[
              { key: 'all', label: 'All Products', icon: Shield },
              { key: 'panel', label: 'Solar Panels', icon: Sun },
              { key: 'battery', label: 'Batteries', icon: Battery },
              { key: 'inverter', label: 'Inverters', icon: Zap }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                  selectedCategory === key
                    ? 'bg-[#D4FF00] text-[#1E1E1E]'
                    : 'bg-[#333333]/80 text-[#CCCCCC] hover:bg-[#333333]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pricing Summary */}
          {selectedProducts.length > 0 && (
            <div className="bg-[#333333]/80 backdrop-blur-sm rounded-2xl border border-[#D4FF00]/20 p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="w-6 h-6 text-[#D4FF00]" />
                <h3 className="text-xl font-semibold text-white">Pricing Summary</h3>
              </div>
              
              {/* Selected Products Breakdown */}
              <div className="space-y-3 mb-6">
                {selectedProducts.map(selectedProduct => {
                  const product = products.find(p => p.id === selectedProduct.productId);
                  if (!product) return null;
                  
                  const lineTotal = product.price * selectedProduct.quantity;
                  
                  return (
                    <div key={selectedProduct.productId} className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-sm text-[#CCCCCC]">
                          {selectedProduct.quantity} × R{product.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#D4FF00] font-semibold">R{lineTotal.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing Totals */}
              <div className="border-t border-[#CCCCCC]/20 pt-4 space-y-2">
                <div className="flex justify-between text-[#CCCCCC]">
                  <span>Subtotal:</span>
                  <span>R{pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#CCCCCC]">
                  <span>VAT (15%):</span>
                  <span>R{pricing.vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white border-t border-[#CCCCCC]/20 pt-2">
                  <span>Total (incl. VAT):</span>
                  <span className="text-[#D4FF00]">R{pricing.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Financing Toggle */}
              <div className="mt-6">
                <button
                  onClick={() => setShowFinancing(!showFinancing)}
                  className="flex items-center gap-2 text-[#D4FF00] hover:text-[#D4FF00]/80 font-medium"
                >
                  <CreditCard className="w-4 h-4" />
                  {showFinancing ? 'Hide' : 'View'} Financing Options
                </button>
              </div>

              {/* Financing Options */}
              {showFinancing && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-lg font-semibold text-white">Financing Options</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {financingOptions.map(option => {
                      const calc = calculateFinancing(pricing.total, option);
                      return (
                        <div
                          key={option.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedFinancing === option.id
                              ? 'border-[#D4FF00] bg-[#D4FF00]/10'
                              : 'border-[#CCCCCC]/30 hover:border-[#CCCCCC]/50'
                          }`}
                          onClick={() => setSelectedFinancing(option.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-white">{option.name}</h5>
                            {selectedFinancing === option.id && (
                              <Check className="w-5 h-5 text-[#D4FF00]" />
                            )}
                          </div>
                          <p className="text-sm text-[#CCCCCC] mb-3">{option.description}</p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#CCCCCC]">Down Payment:</span>
                              <span className="text-[#D4FF00] font-medium">R{calc.downPayment.toLocaleString()}</span>
                            </div>
                            {option.id !== 'cash' && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-[#CCCCCC]">Monthly Payment:</span>
                                  <span className="text-[#D4FF00] font-medium">R{calc.monthlyPayment.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#CCCCCC]">Term:</span>
                                  <span className="text-white">{option.termMonths} months</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#CCCCCC]">Total Interest:</span>
                                  <span className="text-white">R{calc.totalInterest.toLocaleString()}</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-[#CCCCCC]/20">
                            <ul className="text-xs text-[#CCCCCC] space-y-1">
                              {option.features.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                  <Check className="w-3 h-3 text-[#D4FF00] mr-1" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button 
                  onClick={handleRequestQuote}
                  disabled={isSubmittingQuote}
                  className="flex-1 bg-[#D4FF00] text-[#1E1E1E] px-6 py-3 rounded-lg hover:bg-[#D4FF00]/90 transition-all duration-300 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingQuote ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1E1E1E]"></div>
                      Sending Quote...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Request Quote
                    </>
                  )}
                </button>
                <button className="px-6 py-3 border border-[#D4FF00] text-[#D4FF00] rounded-lg hover:bg-[#D4FF00]/10 transition-all duration-300 font-medium">
                  Save Configuration
                </button>
              </div>

              {/* Contact Info */}
              <div className="mt-4 p-3 bg-[#1E1E1E] rounded-lg border border-[#D4FF00]/20">
                <div className="flex items-center gap-4 text-sm text-[#CCCCCC]">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4 text-[#D4FF00]" />
                    <span>sales@iogreenenergy.com</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-[#D4FF00]" />
                    <span>+27 21 123 4567</span>
                  </div>
                </div>
                <p className="text-xs text-[#CCCCCC] mt-2">
                  <Info className="w-4 h-4 inline mr-1 text-[#D4FF00]" />
                  Pricing includes equipment only. Installation, permits, and additional components will be quoted separately based on site requirements.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendations;