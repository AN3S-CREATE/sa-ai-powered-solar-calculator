import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Shield,
  Sparkles,
  Sun,
  TrendingUp,
  Zap,
} from 'lucide-react';

import EnhancedSolarCalculator from './components/EnhancedSolarCalculator';
import BrandHeader from './components/BrandHeader';
import ProductRecommendations from './components/ProductRecommendations';
import QuoteRequestManager from './components/QuoteRequestManager';
import StatsBar from './components/StatsBar';
import SystemStatusChecker from './components/SystemStatusChecker';
import FloatingAgentChat from './components/blocks/agent-chat/FloatingAgentChat';

export interface CalculatorResults {
  systemSize: number;
  monthlySavings: number;
  annualSavings: number;
  systemCost: number;
  paybackPeriod: number;
  roi: number;
  batterySize: number;
  inverterSize: number;
}

export interface CalculatorData {
  monthlyBill: number;
  location: string;
  roofSize: number;
  roofOrientation: string;
  loadshedding: string;
  propertyType: string;
}

interface SubviewProps {
  title: string;
  description: string;
  onBack: () => void;
  children: React.ReactNode;
}

function Subview({ title, description, onBack, children }: SubviewProps) {
  return (
    <div className="min-h-screen bg-gradient-space text-ink">
      <div className="an3s-starfield" aria-hidden="true" />
      <BrandHeader />
      <main className="page-content relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <button
            type="button"
            onClick={onBack}
            className="an3s-action-secondary mb-8 inline-flex items-center gap-2 px-5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to calculator
          </button>
          <div className="mb-10 max-w-3xl">
            <div className="an3s-eyebrow mb-4">Local workspace</div>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">{title}</h1>
            <p className="mt-3 max-w-measure text-base text-ink-muted sm:text-lg">{description}</p>
          </div>
          <div className="an3s-reveal">{children}</div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState<'main' | 'products' | 'admin' | 'status'>('main');
  const [calculatorResults, setCalculatorResults] = useState<CalculatorResults | null>(null);
  const [calculatorData, setCalculatorData] = useState<CalculatorData | null>(null);
  const [showQuoteManager, setShowQuoteManager] = useState(false);

  const navigateTo = (view: 'main' | 'products' | 'admin' | 'status') => {
    setCurrentView(view);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  };

  const handleViewProducts = (results: CalculatorResults, data: CalculatorData) => {
    setCalculatorResults(results);
    setCalculatorData(data);
    navigateTo('products');
  };

  const handleBackToMain = () => navigateTo('main');

  const handleDataSaved = (success: boolean) => {
    console.info(success ? 'Quote request saved successfully' : 'Quote request save failed - data preserved locally');
  };

  if (currentView === 'products' && calculatorResults && calculatorData) {
    return (
      <ProductRecommendations
        results={calculatorResults}
        calculatorData={calculatorData}
        onBack={handleBackToMain}
      />
    );
  }

  if (currentView === 'admin') {
    return (
      <Subview
        title="System administration"
        description="Quote-request protection, local records, and data lifecycle controls."
        onBack={handleBackToMain}
      >
        <QuoteRequestManager onDataSaved={handleDataSaved} />
      </Subview>
    );
  }

  if (currentView === 'status') {
    return (
      <Subview
        title="System status"
        description="Local AI, storage, flow execution, and update-bus health."
        onBack={handleBackToMain}
      >
        <SystemStatusChecker />
      </Subview>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-space text-ink">
      <div className="an3s-starfield" aria-hidden="true" />
      <BrandHeader onStatus={() => navigateTo('status')} onAdmin={() => navigateTo('admin')} />

      <div className="page-content relative z-10">
        <main>
          <section className="relative mx-auto flex min-h-[520px] max-w-7xl items-center justify-center px-4 py-14 text-center sm:px-6 sm:py-20">
            <div className="an3s-reveal relative z-10 max-w-4xl">
              <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
                <div className="an3s-halo absolute inset-0" aria-hidden="true" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-cyan/70 bg-deep-space/80 text-cyan-glow shadow-glow-cyan">
                  <Sun className="h-10 w-10" strokeWidth={1.6} />
                </div>
              </div>

              <div className="an3s-eyebrow mb-6">Local solar intelligence</div>
              <h1 className="uppercase text-4xl font-light leading-[1.05] tracking-[0.04em] text-ink sm:text-6xl lg:text-7xl">
                AI Solar
                <span className="an3s-gradient-text mt-1 block font-extrabold tracking-[0.02em]">Calculator</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg">
                Powering South Africa&apos;s future with sustainable solar recommendations, local pricing data,
                and private offline-first intelligence.
              </p>
            </div>
          </section>

          <StatsBar />

          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <section className="mb-10 border-y border-line bg-panel/55 px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Shield className="h-6 w-6 shrink-0 text-cyan-glow" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink">
                    AI systems &amp; data protection enabled
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Workspace agents, pricing data, and quote records remain on this workstation with persistent offline storage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuoteManager((current) => !current)}
                  className="an3s-action-secondary shrink-0 px-5"
                >
                  {showQuoteManager ? 'Hide records' : 'Show records'}
                </button>
              </div>
            </section>

            {showQuoteManager && (
              <section className="an3s-reveal mb-10">
                <QuoteRequestManager onDataSaved={handleDataSaved} />
              </section>
            )}

            <section id="solar-workspace" className="grid min-w-0 gap-6 lg:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-5">
                <article className="an3s-panel flex h-[760px] min-w-0 flex-col" data-tone="pink">
                  <header className="shrink-0 border-b border-line px-5 pb-5 sm:px-6">
                    <span className="an3s-panel-tab">Pink asks</span>
                    <div className="mt-5 flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-pink-glow" />
                      <div>
                        <h2 className="text-xl font-bold text-ink">AI solar consultant</h2>
                        <p className="mt-1 text-sm text-ink-muted">
                          Local model with an automatic offline workspace fallback.
                        </p>
                      </div>
                    </div>
                  </header>
                  <div className="min-h-0 flex-1">
                    <FloatingAgentChat />
                  </div>
                </article>

                <button
                  type="button"
                  onClick={() => {
                    setShowQuoteManager(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="an3s-action-primary w-full px-8 py-4"
                >
                  Get professional quote
                </button>
              </div>

              <article className="an3s-panel flex h-[760px] min-w-0 flex-col" data-tone="blue">
                <header className="shrink-0 border-b border-line px-5 pb-5 sm:px-6">
                  <span className="an3s-panel-tab">Cyan answers</span>
                  <div className="mt-5 flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-cyan-glow" />
                    <div>
                      <h2 className="text-xl font-bold text-ink">Solar calculator form</h2>
                      <p className="mt-1 text-sm text-ink-muted">Local calculation using exported South African pricing data.</p>
                    </div>
                  </div>
                </header>
                <div className="min-h-0 flex-1">
                  <EnhancedSolarCalculator onViewProducts={handleViewProducts} />
                </div>
              </article>
            </section>

            <section className="mt-16 border-y border-line py-10">
              <div className="an3s-eyebrow mb-8">Built for local decisions</div>
              <div className="grid gap-8 md:grid-cols-3 md:gap-0">
                {[
                  {
                    icon: Zap,
                    title: 'Grounded intelligence',
                    text: 'Recommendations use the exported workspace instead of unverified cloud data.',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Deterministic validation',
                    text: 'Pricing checks and ZAR estimates continue to work without an internet connection.',
                  },
                  {
                    icon: Shield,
                    title: 'Local data residency',
                    text: 'Quote data, profiles, settings, and secrets stay within the local browser profile.',
                  },
                ].map((feature, index) => (
                  <div
                    key={feature.title}
                    className={`px-0 md:px-8 ${index > 0 ? 'md:border-l md:border-line' : ''}`}
                  >
                    <feature.icon className="mb-5 h-8 w-8 text-cyan-glow" strokeWidth={1.5} />
                    <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-ink">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-ink-muted">{feature.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <footer className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-ink-muted">
                {['Offline agent ready', 'Local knowledge loaded', 'Pricing validation active'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_10px_#8af5b6]" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
              <span className="font-semibold text-success">All systems operational</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
