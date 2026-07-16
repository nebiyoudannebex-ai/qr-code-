import React from 'react';

interface BrandLogoProps {
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export default function BrandLogo({ className = 'h-10 w-10', showLabel = false, label = 'MBD' }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${showLabel ? '' : ''}`}>
      <div className={`relative flex items-center justify-center overflow-hidden rounded-[18px] border border-emerald-400/30 bg-zinc-950/90 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_18px_45px_rgba(0,0,0,0.35)] ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-emerald-500/10 to-transparent" />
        <svg viewBox="0 0 120 120" className="relative h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="80" height="80" rx="28" fill="#07120D" stroke="#34D399" strokeWidth="4" />
          <path d="M40 34H64C73.9411 34 82 42.0589 82 52V52C82 61.9411 73.9411 70 64 70H40V34Z" fill="#34D399" />
          <path d="M40 70H70C76.6274 70 82 75.3726 82 82V82C82 88.6274 76.6274 94 70 94H40V70Z" fill="#10B981" />
          <path d="M36 38C36 35.7909 37.7909 34 40 34H54C56.2091 34 58 35.7909 58 38V54C58 56.2091 56.2091 58 54 58H40C37.7909 58 36 56.2091 36 54V38Z" fill="#ECFDF5" fillOpacity="0.85" />
        </svg>
      </div>
      {showLabel ? (
        <span className="text-sm font-semibold tracking-[0.2em] text-slate-200 uppercase">{label}</span>
      ) : null}
    </div>
  );
}
