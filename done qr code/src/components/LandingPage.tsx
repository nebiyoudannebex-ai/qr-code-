import React, { useState } from 'react';
import {
  QrCode,
  Shield,
  Smartphone,
  ChevronRight,
  Sun,
  Moon,
  CheckCircle2,
  Lock,
  Building,
  ArrowRight,
  Eye,
  Info,
  X
} from 'lucide-react';
import BankLogo from './BankLogo';
import BrandLogo from './BrandLogo';

interface LandingPageProps {
  onGoToStaff: () => void;
  onGoToAdmin: () => void;
  onGoToDemo: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function LandingPage({ onGoToStaff, onGoToAdmin, onGoToDemo, darkMode, setDarkMode }: LandingPageProps) {
  const [showAbout, setShowAbout] = useState(false);
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between p-4 bg-gradient-to-tr from-slate-950 via-zinc-950 to-black text-slate-100 transition-colors duration-500">
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/20 blur-[130px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 px-2 relative z-20">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur">
          <BrandLogo className="h-10 w-10" />
          <div className="leading-none">
            <span className="font-extrabold text-sm tracking-tight text-white">
              Mobile Banking Directory
            </span>
            <p className="mt-1 text-[10px] uppercase tracking-[0.32em] text-slate-400">
              Secure portal
            </p>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAbout(true)}
            id="nav-about-btn"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            About
          </button>
          <button
            onClick={onGoToStaff}
            id="nav-staff-portal-btn"
            className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
          >
            Staff Portal
          </button>
          <button
            onClick={onGoToAdmin}
            id="nav-admin-portal-btn"
            className="px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-400 hover:text-emerald-350 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/10 transition cursor-pointer"
          >
            Super Admin
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-5xl mx-auto my-auto py-8 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left Hand: App intro copy */}
        <div className="md:col-span-7 space-y-6 text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Mobile Banking<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-emerald-300">
              Directory
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-medium">
            Tired of display boards filled with 5 different bank accounts? Give customers a unified, modern checkout. Scan a single QR to view and copy your active CBE, Telebirr, or Dashen accounts instantly.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onGoToStaff}
              id="hero-staff-btn"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full text-xs font-extrabold bg-emerald-500 hover:bg-emerald-600 text-black hover:scale-[1.01] transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <Eye className="w-4.5 h-4.5" />
              Get Started
            </button>
          </div>
        </div>

        {/* Right Hand: Interactive/Visual App Showcase */}
        <div className="md:col-span-5 flex items-center justify-center relative">
          {/* Frosted Glass Demo Card */}
          <div className="w-full max-w-sm p-6 rounded-[32px] bg-white/45 dark:bg-zinc-900/45 border border-white/55 dark:border-zinc-800/50 shadow-2xl backdrop-blur-xl relative hover:scale-[1.01] transition-transform duration-300">
            
            <div className="flex items-center justify-between mb-6">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Interactive Preview
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Custom Mock Business */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-[18px] bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-white/60 dark:border-zinc-800/50 flex items-center justify-center mb-3">
                <Building className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-none">
                Elegance Boutique Ltd
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">
                Tap a bank to pay instantly via your mobile app
              </p>
            </div>

            {/* Simulated Payment Stack */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-zinc-950/40 border border-white/55 dark:border-zinc-850/40 text-xs">
                <div className="flex items-center gap-2.5">
                  <BankLogo bankName="Commercial Bank of Ethiopia" className="w-8 h-8" />
                  <div>
                    <p className="font-bold">Commercial Bank of Ethiopia</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">1000••••81948</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-zinc-950/40 border border-white/55 dark:border-zinc-850/40 text-xs">
                <div className="flex items-center gap-2.5">
                  <BankLogo bankName="Telebirr Mobile Wallet" className="w-8 h-8" />
                  <div>
                    <p className="font-bold">Telebirr Mobile Wallet</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">0911••••3344</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            <button
              onClick={onGoToDemo}
              className="w-full mt-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-black flex items-center justify-center gap-1.5 transition"
            >
              Test Demo Directory
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer Credentials */}
      <footer className="w-full max-w-5xl mx-auto text-center py-6 px-2 border-t border-slate-200/40 dark:border-zinc-900/40 relative z-20 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
        <div className="text-left">
          <p>© 2026 Mobile Banking Directory Platform. All rights reserved.</p>
          <p className="text-emerald-450 dark:text-emerald-400 font-semibold mt-1">build BY NEBIYOU DANIEL (Website designer and Developer.)</p>
        </div>
        <p>Built with React, Express, and Secure Node Cryptography.</p>
      </footer>

      {/* About Developer Modal */}
      {showAbout && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition duration-300"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="w-full max-w-sm rounded-[28px] bg-zinc-950/95 border border-zinc-800/60 shadow-2xl backdrop-blur-2xl p-6 relative max-h-[90vh] overflow-y-auto text-left"
            onClick={e => e.stopPropagation()}
            id="about-dev-modal"
          >
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-zinc-800/60 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-extrabold text-white mb-1">
              About the Developer
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Learn more about the designer and engineer behind this platform.
            </p>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Developer Profile</p>
              <p className="text-sm font-semibold text-white mb-0.5">Nebiyou Daniel</p>
              <p className="text-[10px] text-slate-400 mb-4 font-semibold uppercase tracking-wider">Personal Website Designer and Developer</p>
              
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Info</p>
              <div className="space-y-2 text-sm text-slate-350">
                <p>
                  <span className="font-semibold text-slate-400">Telegram:</span>{" "}
                  <a href="https://t.me/NebiyouDaniel" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">
                    @NebiyouDaniel
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-slate-400">Instagram:</span>{" "}
                  <a href="https://instagram.com/aka_neba" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">
                    @aka_neba
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-slate-400">Phone:</span>{" "}
                  <a href="tel:+251956797970" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">
                    +251956797970
                  </a>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-500/20">
                <p className="text-xs italic text-slate-400 leading-relaxed">
                  "Crafting premium, high-fidelity, and secure digital products. Seamlessly blending interactive design with robust technologies to elevate modern business standards and deliver stellar user experiences."
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAbout(false)}
              className="w-full py-2.5 rounded-xl font-semibold text-sm bg-zinc-900 hover:bg-zinc-800 text-slate-200 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
