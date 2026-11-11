import React, { useState, useEffect } from 'react';
import { ArrowLeft, Battery, Zap, Sun, Shield, Check, Calculator, CreditCard, Mail } from 'lucide-react';
import { CalculatorResults, CalculatorData } from '../App';
import { createNode } from '../lib/genesis-data/client';
import BrandHeader from './BrandHeader';

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

      await createNode('aCGbHMAbWUZzTmna', {
          Name: `Quote Request - Customer - ${new Date().toLocaleDateString('en-ZA')}`,
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
      });

      try {
        await navigator.clipboard.writeText(`${emailSubject}\n\n${emailBody}`);
      } catch {
        // Clipboard access is optional; the local quote record is already persisted.
      }

      alert('Quote request saved locally. A copy-ready summary was placed on the clipboard when browser permissions allowed it.');
      
    } catch (error) {
      console.error('Error sending quote request:', error);
      alert('The local quote request could not be saved. Please export your workspace data and try again.');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      const summary = selectedProducts
        .map((selected) => {
          const product = products.find((candidate) => candidate.id === selected.productId);
          return `${product?.brand ?? ''} ${product?.name ?? selected.productId} x${selected.quantity}`.trim();
        })
        .join('; ');
      await createNode('aCGbHMAbWUZzTmna', {
        Name: `Saved Configuration - ${new Date().toLocaleDateString('en-ZA')}`,
        '/attributes/@calc4': calculatorData.monthlyBill,
        '/attributes/@calc5': calculatorData.location,
        '/attributes/@calc9': results.systemSize,
        '/attributes/@calc10': results.batterySize,
        '/attributes/@calc11': results.inverterSize,
        '/attributes/@calc16': pricing.total,
        '/attributes/@calc17': calculatorData.propertyType,
        '/attributes/@calc18': 'saved-configuration',
        '/attributes/note': summary,
      });
      window.alert('Configuration saved to the local workspace.');
    } catch (error) {
      console.error('[RUNTIME:DATA] Configuration save failed.', error);
      window.alert('The configuration could not be saved locally.');
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
      <article
        className={`an3s-panel transition duration-base hover:-translate-y-0.5 hover:shadow-glow-cyan ${
          isSelected ? 'ring-2 ring-cyan/50' : ''
        }`}
        data-tone={product.recommended ? 'pink' : 'blue'}
      >
        {product.recommended && (
          <span className="an3s-panel-tab ml-5">Recommended</span>
        )}
        
        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center text-cyan-glow">
                <Icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">{product.name}</h3>
                <p className="text-sm text-ink-muted">{product.brand}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleProductSelection(product.id)}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition duration-fast ${
                isSelected
                  ? 'border-cyan bg-cyan-glow text-deep-space shadow-glow-cyan'
                  : 'border-line-strong text-ink-muted hover:border-cyan hover:text-cyan-glow'
              }`}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Remove' : 'Select'} ${product.name}`}
            >
              {isSelected && <Check className="h-5 w-5" />}
            </button>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-line py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-ink-muted">Capacity</p>
              <p className="text-sm font-semibold text-ink">{product.capacity}</p>
            </div>
            {product.efficiency && (
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-ink-muted">Efficiency</p>
                <p className="text-sm font-semibold text-ink">{product.efficiency}</p>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-ink-muted">Warranty</p>
              <p className="text-sm font-semibold text-ink">{product.warranty}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-ink-muted">Unit price</p>
              <p className="text-sm font-semibold text-cyan-glow">R{product.price.toLocaleString('en-ZA')}</p>
            </div>
          </div>

          {isSelected && (
            <div className="mb-5 border-b border-line pb-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm text-ink-muted">Quantity</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateProductQuantity(product.id, quantity - 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-md border border-line-strong text-cyan-glow hover:border-cyan"
                    disabled={quantity <= 1}
                    aria-label={`Decrease ${product.name} quantity`}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold tabular-nums text-ink">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateProductQuantity(product.id, quantity + 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-md border border-line-strong text-cyan-glow hover:border-cyan"
                    aria-label={`Increase ${product.name} quantity`}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">Recommended: {recommendedQuantity}</span>
                <span className="font-semibold text-cyan-glow">
                  Total: R{(product.price * quantity).toLocaleString('en-ZA')}
                </span>
              </div>
            </div>
          )}

          <p className="mb-2 text-xs uppercase tracking-[0.08em] text-ink-muted">Key features</p>
          <ul className="divide-y divide-line text-sm text-ink-soft">
            {product.features.map((feature) => (
              <li key={feature} className="flex gap-2 py-2">
                <span className="text-pink-glow" aria-hidden="true">+</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-space text-ink">
      <div className="an3s-starfield" aria-hidden="true" />
      <BrandHeader />
      <div className="page-content relative z-10">
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          {/* Header */}
          <div className="mb-10 flex items-start gap-4">
            <button
              type="button"
              onClick={onBack}
              className="an3s-action-secondary flex h-11 w-11 shrink-0 items-center justify-center"
              aria-label="Back to calculator"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="an3s-eyebrow mb-3">System configuration</div>
              <h1 className="text-3xl font-extrabold text-ink sm:text-5xl">Product recommendations</h1>
              <p className="mt-2 text-ink-muted">Based on your {results.systemSize} kW solar-system calculation.</p>
            </div>
          </div>

          {/* System Summary */}
          <section className="an3s-panel mb-10" data-tone="blue">
            <span className="an3s-panel-tab ml-5">Your system</span>
            <div className="grid gap-0 p-6 md:grid-cols-3">
              <div className="text-center">
                <Sun className="mx-auto mb-3 h-8 w-8 text-pink-glow" strokeWidth={1.5} />
                <p className="text-3xl font-extrabold text-ink">{recommendations.panels}</p>
                <p className="text-sm text-ink-soft">Solar panels</p>
                <p className="text-xs text-ink-muted">~{results.systemSize} kW total</p>
              </div>
              <div className="border-y border-line py-6 text-center md:border-x md:border-y-0 md:py-0">
                <Battery className="mx-auto mb-3 h-8 w-8 text-violet-glow" strokeWidth={1.5} />
                <p className="text-3xl font-extrabold text-ink">{recommendations.batteries}</p>
                <p className="text-sm text-ink-soft">Battery units</p>
                <p className="text-xs text-ink-muted">~{results.batterySize} kWh total</p>
              </div>
              <div className="text-center">
                <Zap className="mx-auto mb-3 h-8 w-8 text-cyan-glow" strokeWidth={1.5} />
                <p className="text-3xl font-extrabold text-ink">{recommendations.inverters}</p>
                <p className="text-sm text-ink-soft">Inverter</p>
                <p className="text-xs text-ink-muted">~{results.inverterSize} kW capacity</p>
              </div>
            </div>
          </section>

          {/* Category Filter */}
          <div className="mb-8 flex gap-3 overflow-x-auto pb-2" role="group" aria-label="Product categories">
            {[
              { key: 'all', label: 'All Products', icon: Shield },
              { key: 'panel', label: 'Solar Panels', icon: Sun },
              { key: 'battery', label: 'Batteries', icon: Battery },
              { key: 'inverter', label: 'Inverters', icon: Zap }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as any)}
                className={`flex shrink-0 items-center gap-2 rounded-md border px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] transition duration-fast ${
                  selectedCategory === key
                    ? 'border-pink bg-gradient-glow text-deep-space shadow-glow-pink'
                    : 'border-line-strong bg-panel text-ink-muted hover:border-cyan hover:text-cyan-glow'
                }`}
                aria-pressed={selectedCategory === key}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pricing Summary */}
          {selectedProducts.length > 0 && (
            <section className="an3s-panel mb-8 p-6" data-tone="pink">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="h-6 w-6 text-pink-glow" />
                <h2 className="text-xl font-semibold text-ink">Pricing summary</h2>
              </div>
              
              {/* Selected Products Breakdown */}
              <div className="space-y-3 mb-6">
                {selectedProducts.map(selectedProduct => {
                  const product = products.find(p => p.id === selectedProduct.productId);
                  if (!product) return null;
                  
                  const lineTotal = product.price * selectedProduct.quantity;
                  
                  return (
                    <div key={selectedProduct.productId} className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-ink">{product.name}</p>
                        <p className="text-sm text-ink-muted">
                          {selectedProduct.quantity} × R{product.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-cyan-glow">R{lineTotal.toLocaleString('en-ZA')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing Totals */}
              <div className="space-y-2 border-t border-line pt-4">
                <div className="flex justify-between text-ink-muted">
                  <span>Subtotal:</span>
                  <span>R{pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>VAT (15%):</span>
                  <span>R{pricing.vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-xl font-bold text-ink">
                  <span>Total (incl. VAT):</span>
                  <span className="text-cyan-glow">R{pricing.total.toLocaleString('en-ZA')}</span>
                </div>
              </div>

              {/* Financing Toggle */}
              <div className="mt-6">
                <button
                  onClick={() => setShowFinancing(!showFinancing)}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-cyan-glow hover:text-cyan"
                >
                  <CreditCard className="w-4 h-4" />
                  {showFinancing ? 'Hide' : 'View'} Financing Options
                </button>
              </div>

              {/* Financing Options */}
              {showFinancing && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-ink">Financing options</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {financingOptions.map(option => {
                      const calc = calculateFinancing(pricing.total, option);
                      return (
                        <div
                          key={option.id}
                          className={`cursor-pointer rounded-md border p-4 transition duration-fast ${
                            selectedFinancing === option.id
                              ? 'border-cyan bg-cyan/10 shadow-glow-cyan'
                              : 'border-line-strong hover:border-cyan/70'
                          }`}
                          onClick={() => setSelectedFinancing(option.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-ink">{option.name}</h4>
                            {selectedFinancing === option.id && (
                              <Check className="h-5 w-5 text-cyan-glow" />
                            )}
                          </div>
                          <p className="mb-3 text-sm text-ink-muted">{option.description}</p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-ink-muted">Down payment:</span>
                              <span className="font-medium text-cyan-glow">R{calc.downPayment.toLocaleString('en-ZA')}</span>
                            </div>
                            {option.id !== 'cash' && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-ink-muted">Monthly payment:</span>
                                  <span className="font-medium text-cyan-glow">R{calc.monthlyPayment.toLocaleString('en-ZA')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-ink-muted">Term:</span>
                                  <span className="text-ink">{option.termMonths} months</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-ink-muted">Total interest:</span>
                                  <span className="text-ink">R{calc.totalInterest.toLocaleString('en-ZA')}</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="mt-3 border-t border-line pt-3">
                            <ul className="space-y-1 text-xs text-ink-muted">
                              {option.features.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                  <Check className="mr-1 h-3 w-3 text-cyan-glow" />
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
                  className="an3s-action-primary flex flex-1 items-center justify-center gap-2 px-6 py-3 disabled:opacity-50"
                >
                  {isSubmittingQuote ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-deep-space border-t-transparent" />
                      Saving locally...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Save quote request
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSaveConfiguration()}
                  className="an3s-action-secondary px-6 py-3"
                >
                  Save Configuration
                </button>
              </div>

              <p className="mt-5 border-t border-line pt-4 text-xs leading-5 text-ink-muted">
                Planning estimates use the local exported data. Confirm equipment availability, installation, permits, financing terms, and current supplier pricing before purchase.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductRecommendations;
