import React, { useState } from 'react';
import { Menu, ShieldCheck } from 'lucide-react';

import { APP_BRANDING } from '../config/branding';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-line bg-deep-space/88 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-line py-3">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <ShieldCheck className="h-4 w-4 text-cyan-glow" />
            <span>Private local workspace</span>
          </div>
          <div className="text-sm text-ink-muted">
            <span className="text-success">●</span> Offline ready
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <img src={APP_BRANDING.compactWordmark} alt={APP_BRANDING.creator} className="w-28" />
            <div>
              <h1 className="text-sm font-bold uppercase tracking-[0.14em] text-ink">{APP_BRANDING.productName}</h1>
              <p className="text-xs text-ink-muted">Offline solar planning</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#calculator" className="text-ink-muted transition-colors hover:text-cyan-glow">Calculator</a>
            <a href="#products" className="text-ink-muted transition-colors hover:text-cyan-glow">Products</a>
            <a href="#records" className="text-ink-muted transition-colors hover:text-cyan-glow">Local records</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="an3s-action-primary px-6 py-2"
            >
              Get Quote
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="text-ink-muted hover:text-ink md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="grid gap-3 border-t border-line py-4 md:hidden">
            {['calculator', 'products', 'records'].map((section) => (
              <a key={section} href={`#${section}`} className="capitalize text-ink-muted hover:text-cyan-glow">
                {section}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
