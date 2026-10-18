import React from 'react';
import { Sun, Menu, Phone, Mail } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-green-500/20 bg-slate-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-3 border-b border-green-500/10">
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-400" />
              <span>+27 11 123 4567</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-400" />
              <span>info@iogreen.co.za</span>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            <span className="text-green-400">●</span> Serving Gauteng & Beyond
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <Sun className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">IO Green</h1>
              <p className="text-xs text-slate-400">Solar Energy Solutions</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-slate-300 hover:text-green-400 transition-colors">Services</a>
            <a href="#projects" className="text-slate-300 hover:text-green-400 transition-colors">Projects</a>
            <a href="#about" className="text-slate-300 hover:text-green-400 transition-colors">About</a>
            <a href="#careers" className="text-slate-300 hover:text-green-400 transition-colors">Careers</a>
            <a href="#contact" className="text-slate-300 hover:text-green-400 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/25">
              Get Quote
            </button>
            <button className="md:hidden text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;