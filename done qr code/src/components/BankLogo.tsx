import React, { useState } from 'react';

interface BankLogoProps {
  bankName: string;
  className?: string;
}

const BANK_LOGOS = [
  {
    keywords: ['cbe', 'commercial bank of ethiopia'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Commercial_Bank_of_Ethiopia_logo.png'
  },
  {
    keywords: ['telebirr', 'tele birr'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Telebirr_Logo.png'
  },
  {
    keywords: ['dashen', 'amole', 'dashin'],
    url: 'https://img.logo.dev/dashenbanksc.com?token=pk_R3t92rD9TUKy_U34091v9A'
  },
  {
    keywords: ['awash', 'awash birr'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Awash_International_Bank.png'
  },
  {
    keywords: ['abyssinia', 'boa'],
    url: 'https://www.bankofabyssinia.com/wp-content/uploads/2023/12/boa-logo.png'
  },
  {
    keywords: ['cooperative bank of oromia', 'coopay', 'coop bank', 'cooperative', 'coop'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Cooperative_Bank_of_Oromia.png'
  },
  {
    keywords: ['hibret', 'hila', 'united bank'],
    url: 'https://www.hibretbank.com.et/wp-content/themes/hibret_bank/img/logo.png'
  },
  {
    keywords: ['wegagen', 'efoy'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Wogagen_Bank.png'
  },
  {
    keywords: ['nib', 'nib international'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Nib_International_Bank.png'
  },
  {
    keywords: ['bunna'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Bunna_bank.png'
  },
  {
    keywords: ['zemen'],
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Zemen_Bank.png'
  },
  {
    keywords: ['oromia bank', 'oromia'],
    url: 'https://oromiabank.com/wp-content/uploads/2024/01/cropped-oromia_bank_sc-1.png'
  },
  {
    keywords: ['berhan'],
    url: 'https://berhanbanksc.com/wp-content/uploads/2021/04/Logo-01-1.png'
  },
  {
    keywords: ['abay'],
    url: 'https://abaybank.com.et/wp-content/uploads/2021/05/Logo-Updated_New_Png.png'
  },
  {
    keywords: ['lion', 'anbesa'],
    url: 'https://anbesabank.com/wp-content/uploads/2023/11/logo.png'
  },
  {
    keywords: ['global'],
    url: 'https://globalbankethiopia.com/wp-content/uploads/2024/01/gbe_final_logo-01_png.png'
  },
  {
    keywords: ['enat'],
    url: 'https://www.enatbanksc.com/wp-content/uploads/2022/12/enat-logo-1.png'
  }
];

export default function BankLogo({ bankName, className = "w-10 h-10" }: BankLogoProps) {
  const [useFallback, setUseFallback] = useState(false);
  const name = bankName.toLowerCase();

  // Try real image first if not failed
  if (!useFallback) {
    const matched = BANK_LOGOS.find(logo => 
      logo.keywords.some(keyword => name.includes(keyword))
    );
    if (matched) {
      return (
        <img 
          src={matched.url} 
          alt={bankName}
          referrerPolicy="no-referrer"
          onError={() => setUseFallback(true)}
          className={`bank-logo-badge ${className}`}
        />
      );
    }
  }

  // Commercial Bank of Ethiopia (CBE) - Stunning high-fidelity yellow & gold shield logo representation
  if (name.includes('ethiopia') || name.includes('cbe')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-amber-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Gold circular emblem */}
          <circle cx="50" cy="50" r="45" fill="#FFC72C" />
          {/* Inner blue ring representing Ethiopia's seal colors */}
          <circle cx="50" cy="50" r="37" fill="#0033A0" />
          {/* Detailed gears/petals represent trade & growth */}
          <path d="M50 20 L53 35 L68 32 L58 43 L72 49 L58 55 L68 66 L53 63 L50 78 L47 63 L32 66 L42 55 L28 49 L42 43 L32 32 L47 35 Z" fill="#FFC72C" />
          <circle cx="50" cy="50" r="16" fill="#0033A0" />
          <circle cx="50" cy="50" r="8" fill="#FFC72C" />
        </svg>
      </div>
    );
  }

  // Telebirr - Signature bright cyan & teal mobile payment wallet logo representation
  if (name.includes('tele') || name.includes('birr')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-cyan-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Blue/Teal background circle */}
          <circle cx="50" cy="50" r="46" fill="url(#teleGrad)" />
          {/* Sleek lowercase 't' logo mark */}
          <path d="M35 32 C35 24, 45 24, 52 24 L52 35 C48 35, 45 37, 45 42 L45 74 L35 74 Z" fill="#FFFFFF" />
          {/* Elegant orange and yellow glowing coin/dot representing digital wallet transaction */}
          <circle cx="62" cy="50" r="14" fill="#FF6B35" />
          <circle cx="62" cy="50" r="7" fill="#FFD166" />
          <defs>
            <linearGradient id="teleGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00A896" />
              <stop offset="1" stopColor="#028090" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Dashen Bank - Highly recognizable twin-mountain emblem logo representation
  if (name.includes('dashen')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-orange-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#0F337C" />
          {/* Mountain contours representing Mount Dashen */}
          <path d="M22 68 L42 35 L54 52 L68 28 L82 68 Z" fill="#EF4444" />
          <path d="M32 68 L48 42 L58 56 L72 35 L82 68 Z" fill="#F59E0B" />
          <path d="M42 68 L52 50 L62 62 L74 44 L82 68 Z" fill="#FBBF24" />
          <path d="M18 68 H82 V74 H18 Z" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // Awash Bank - Traditional/Modern green leaf/shield representation
  if (name.includes('awash')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-emerald-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#005A36" />
          {/* Abstract stylized 'A' & 'B' inside leaf */}
          <path d="M50 18 C30 35, 30 65, 50 82 C70 65, 70 35, 50 18 Z" fill="#FFFFFF" />
          <path d="M50 25 C36 40, 36 60, 50 75 C64 60, 64 40, 50 25 Z" fill="#005A36" />
          <circle cx="50" cy="50" r="10" fill="#FFD700" />
        </svg>
      </div>
    );
  }

  // Bank of Abyssinia - Golden yellow & blue circle branding
  if (name.includes('abyssinia') || name.includes('boa')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-yellow-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#1E3A8A" />
          {/* Stylized shining sun/star of Abyssinia */}
          <circle cx="50" cy="50" r="28" fill="#FBBF24" />
          <path d="M50 15 L54 34 L72 24 L60 40 L78 50 L60 60 L72 76 L54 66 L50 85 L46 66 L28 76 L40 60 L22 50 L40 40 L28 24 L46 34 Z" fill="#1E3A8A" />
          <circle cx="50" cy="50" r="10" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // Cooperative Bank of Oromia (Coopay / Coop Bank) - Vibrant orange & green waves with golden shield
  if (name.includes('cooperative') || name.includes('coop')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-emerald-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#006837" />
          {/* Stylized Oromia emblem & orange dynamic swoosh */}
          <path d="M25 50 C25 35, 35 25, 50 25 C65 25, 75 35, 75 50 C75 65, 65 75, 50 75" stroke="#F15A24" strokeWidth="8" strokeLinecap="round" />
          <path d="M35 50 C35 42, 42 35, 50 35 C58 35, 65 42, 65 50" stroke="#FFD166" strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // Wegagen Bank - Bold orange & yellow radiating geometric rays
  if (name.includes('wegagen')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-amber-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#F7931E" />
          {/* Geometric sunrise rays/wedges representing Wegagen (Dawn) */}
          <path d="M50 50 L20 20 A45 45 0 0 1 80 20 Z" fill="#F15A24" />
          <path d="M50 50 L30 30 A30 30 0 0 1 70 30 Z" fill="#FFD166" />
          <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
          <circle cx="50" cy="50" r="7" fill="#F7931E" />
        </svg>
      </div>
    );
  }

  // Hibret Bank - Interlocking deep blue & vibrant orange rings of unity/partnership
  if (name.includes('hibret') || name.includes('united')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-orange-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#0E2E5C" />
          {/* Beautiful infinite interlocking chain rings */}
          <circle cx="42" cy="50" r="18" stroke="#F15A24" strokeWidth="7" />
          <circle cx="58" cy="50" r="18" stroke="#FFFFFF" strokeWidth="7" />
          <path d="M42 32 A18 18 0 0 1 50 34" stroke="#F15A24" strokeWidth="7" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Nib International Bank - Royal blue and warm honey-yellow hive & bee branding
  if (name.includes('nib')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-blue-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#0C51A3" />
          {/* Golden hexagon honeycomb pattern */}
          <path d="M50 25 L71.6 37.5 L71.6 62.5 L50 75 L28.4 62.5 L28.4 37.5 Z" fill="#FBBF24" />
          {/* Stylized inner hexagon & wing elements */}
          <path d="M50 32 L65.5 41 L65.5 59 L50 68 L34.5 59 L34.5 41 Z" fill="#0C51A3" />
          <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // Bunna Bank - Coffee-brown and green/gold branch logo
  if (name.includes('bunna')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-amber-950/45`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#4A2C11" />
          {/* Golden Coffee Beans & Green Leaves */}
          <path d="M30 50 C30 35, 42 28, 50 28 C58 28, 70 35, 70 50 C70 65, 58 72, 50 72 C42 72, 30 65, 30 50 Z" fill="#FFC72C" />
          <path d="M50 28 C45 38, 45 62, 50 72" stroke="#4A2C11" strokeWidth="4" />
          <path d="M32 40 C38 43, 44 43, 50 43" stroke="#006837" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M68 60 C62 57, 56 57, 50 57" stroke="#006837" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Zemen Bank - Futuristic deep blue & solid gold elegant diamonds
  if (name.includes('zemen')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-blue-900/30`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#0A192F" />
          {/* Stylized sharp elegant 'Z' inside gold diamond */}
          <path d="M50 18 L78 50 L50 82 L22 50 Z" fill="#D4AF37" />
          <path d="M38 38 H62 L38 62 H62" stroke="#0A192F" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  // Berhan Bank - Glowing orange and yellow lightburst
  if (name.includes('berhan')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-orange-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#E65100" />
          {/* Alternating gold and white sun rays (Berhan = Light) */}
          <circle cx="50" cy="50" r="16" fill="#FEEB65" />
          <path d="M50 15 L50 30 M50 70 L50 85 M15 50 L30 50 M70 50 L85 50 M25 25 L36 36 M64 64 L75 75 M75 25 L64 36 M36 64 L25 75" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Abay Bank - Emerald-green & cool blue waves representing the Blue Nile (Abay) river
  if (name.includes('abay')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-teal-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#0D5C75" />
          {/* Dynamic flowing curves/waves of the river */}
          <path d="M15 45 C35 30, 45 65, 85 50 L85 85 L15 85 Z" fill="#00A896" />
          <path d="M15 55 C35 42, 45 72, 85 60 L85 85 L15 85 Z" fill="#028090" />
          <path d="M15 65 C35 55, 45 80, 85 70 L85 85 L15 85 Z" fill="#05668D" />
        </svg>
      </div>
    );
  }

  // Lion International Bank (Anbesa) - Golden/yellow proud lion's head silhouette
  if (name.includes('lion') || name.includes('anbesa')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-amber-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#B25E00" />
          {/* Lion profile vector crown & face */}
          <path d="M30 65 C30 50, 42 35, 58 35 C70 35, 75 42, 75 50 C75 58, 68 62, 58 62 M35 58 L42 55 M38 52 L45 50" stroke="#FFC72C" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M42 35 C35 42, 32 50, 32 58 C32 68, 45 74, 55 74" stroke="#FFC72C" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="56" cy="46" r="3.5" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // Global Bank Ethiopia - High tech blue and teal network global globe
  if (name.includes('global')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-cyan-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#073B4C" />
          {/* Elegant longitude/latitude curved wireframe lines */}
          <ellipse cx="50" cy="50" rx="35" ry="14" stroke="#118AB2" strokeWidth="3.5" />
          <ellipse cx="50" cy="50" rx="14" ry="35" stroke="#118AB2" strokeWidth="3.5" />
          <line x1="15" y1="50" x2="85" y2="50" stroke="#06D6A0" strokeWidth="3.5" />
          <line x1="50" y1="15" x2="50" y2="85" stroke="#06D6A0" strokeWidth="3.5" />
        </svg>
      </div>
    );
  }

  // Enat Bank - Elegant deep violet, purple, and magenta shield representing the mother & child curves
  if (name.includes('enat')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-pink-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#4A148C" />
          {/* Beautiful abstract overlapping maternal curves (Pink & Purple) */}
          <path d="M32 40 C32 25, 68 25, 68 40 C68 55, 50 78, 50 78 C50 78, 32 55, 32 40 Z" fill="#EC407A" />
          <path d="M40 43 C40 32, 60 32, 60 43 C60 52, 50 68, 50 68 C50 68, 40 52, 40 43 Z" fill="#F48FB1" />
          <circle cx="50" cy="38" r="6" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // Oromia Bank - Bright red & royal blue dual split
  if (name.includes('oromia')) {
    return (
      <div className={`${className} bg-[#1e2022] rounded-full p-1.5 flex items-center justify-center shadow-md overflow-hidden relative border border-blue-500/20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#0033A0" />
          {/* Red diagonal slash and gold star */}
          <path d="M15 15 L85 85 L85 15 Z" fill="#DA291C" />
          <polygon points="50,28 53,38 64,38 55,44 58,54 50,48 42,54 45,44 36,38 47,38" fill="#FFC72C" />
        </svg>
      </div>
    );
  }

  // Fallback beautiful money icon with custom gradient for other providers
  return (
    <div className={`${className} bg-gradient-to-tr from-[#059669] to-[#10b981] rounded-full p-2 flex items-center justify-center shadow-md border border-emerald-400/20`}>
      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
  );
}
