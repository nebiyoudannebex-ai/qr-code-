import { useState, useEffect } from 'react';
import {
  Coins,
  Smartphone,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Users,
  Banknote,
  Copy,
  Check,
  ExternalLink,
  X,
  Info,
  Globe,
  Sun,
  Moon,
  Building2
} from 'lucide-react';
import { PublicBusiness } from '../types';
import BankLogo from './BankLogo';

interface PublicViewProps {
  ownerId: string;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

// Translations dictionary for Ethiopian localization
const translations = {
  EN: {
    title: "Mobile Banking Directory",
    instruction: "Tap a bank to pay instantly via your mobile banking app.",
    payNow: "Pay Now →",
    about: "About",
    language: "Language",
    aboutTitle: "About Mobile Banking Directory",
    aboutText: "This centralized platform allows businesses to receive payments quickly. Customers scan a single QR code to view all active mobile banking payment profiles of the business, preventing mistakes and accelerating checkout.",
    copySuccess: "Copied!",
    copyText: "Copy Account Number",
    openApp: "Open Pay Link / App",
    accountNum: "Account Number",
    paymentDetails: "Payment Details",
    errorTitle: "Business Not Found",
    errorText: "The requested business profile does not exist or has been disabled.",
    loading: "Loading business profile...",
    staffPortal: "Staff Portal",
    close: "Close",
    tapToCopy: "Tap the number or button to copy"
  },
  AM: {
    title: "የሞባይል ባንክ ማውጫ",
    instruction: "በሞባይል ባንክ መተግበሪያዎ ለመክፈል የባንኩን ስም ይጫኑ።",
    payNow: "ክፈል →",
    about: "ስለ እኛ",
    language: "ቋንቋ",
    aboutTitle: "ስለ ሞባይል ባንክ ማውጫ",
    aboutText: "ይህ ማዕከላዊ የመክፈያ ማውጫ ደንበኞች የአንድን ድርጅት የሞባይል ባንክ ሂሳቦች በአንድ የQR ኮድ አማካኝነት በፈጣንና አስተማማኝ መንገድ እንዲያገኙ ያግዛል።",
    copySuccess: "ኮፒ ተደርጓል!",
    copyText: "የሂሳብ ቁጥር ኮፒ አድርግ",
    openApp: "የመክፈያ ሊንክ ክፈት",
    accountNum: "የሂሳብ ቁጥር",
    paymentDetails: "የክፍያ ዝርዝር",
    errorTitle: "ድርጅቱ አልተገኘም",
    errorText: "የጠየቁት የድርጅት ፕሮፋይል አልተገኘም ወይም ተሰናክሏል።",
    loading: "የድርጅቱን መረጃ በመጫን ላይ...",
    staffPortal: "የሰራተኞች መግቢያ",
    close: "ዝጋ",
    tapToCopy: "ለመቅዳት ቁጥሩን ወይም ቁልፉን ይጫኑ"
  }
};

export default function PublicView({ ownerId, darkMode, setDarkMode }: PublicViewProps) {
  const [lang, setLang] = useState<'EN' | 'AM'>('EN');
  const [business, setBusiness] = useState<PublicBusiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/u/${ownerId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Business not found');
        }
        return res.json();
      })
      .then(data => {
        setBusiness(data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ownerId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBankStyle = (bankName: string) => {
    const name = bankName.toLowerCase();
    if (name.includes('ethiopia') || name.includes('cbe')) {
      return { bg: 'bg-gradient-to-br from-amber-400 to-amber-600', text: 'text-slate-900', badge: 'CBE', icon: Coins };
    }
    if (name.includes('tele') || name.includes('birr')) {
      return { bg: 'bg-gradient-to-br from-cyan-400 to-cyan-600', text: 'text-white', badge: 'TB', icon: Smartphone };
    }
    if (name.includes('dashen')) {
      return { bg: 'bg-gradient-to-br from-red-500 to-red-700', text: 'text-white', badge: 'DB', icon: CreditCard };
    }
    if (name.includes('awash')) {
      return { bg: 'bg-gradient-to-br from-emerald-500 to-emerald-700', text: 'text-white', badge: 'AB', icon: ShieldCheck };
    }
    if (name.includes('abyssinia') || name.includes('boa')) {
      return { bg: 'bg-gradient-to-br from-yellow-500 to-yellow-700', text: 'text-slate-900', badge: 'BoA', icon: TrendingUp };
    }
    if (name.includes('coop') || name.includes('cooperative')) {
      return { bg: 'bg-gradient-to-br from-green-600 to-green-800', text: 'text-white', badge: 'COOP', icon: Users };
    }
    return { bg: 'bg-gradient-to-br from-violet-500 to-violet-700', text: 'text-white', badge: bankName.substring(0, 3).toUpperCase(), icon: Banknote };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-slate-950 via-zinc-950 to-black transition-colors duration-500">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-slate-300 font-medium">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-between p-4 bg-gradient-to-tr from-slate-950 via-zinc-950 to-black transition-colors duration-500">
        <div className="w-full max-w-md my-auto relative z-10">
          <div className="p-8 rounded-[24px] bg-zinc-900/40 border border-zinc-800/30 shadow-2xl backdrop-blur-xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-950/30 text-red-400 rounded-full flex items-center justify-center">
              <X className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t.errorTitle}</h1>
            <p className="text-slate-300 mb-6">{t.errorText}</p>
            <a
              href="/staff"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-black bg-emerald-500 hover:bg-emerald-600 transition duration-300 font-semibold"
            >
              {t.staffPortal}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-between p-4 bg-gradient-to-tr from-slate-950 via-zinc-950 to-black transition-colors duration-500">
      {/* Blurred out-of-focus background gradient mesh */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none"></div>

      {/* Top Bar Navigation & Controls */}
      <header className="w-full max-w-md flex items-center justify-between py-3 px-1 relative z-20">
        <div className="flex gap-2">
          <button
            onClick={() => setShowAbout(true)}
            id="nav-about-btn"
            className="flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold bg-zinc-900/60 border border-zinc-800/40 text-slate-300 hover:bg-emerald-500/15 transition shadow-sm cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            {t.about}
          </button>
          
          <button
            onClick={() => setLang(l => l === 'EN' ? 'AM' : 'EN')}
            id="nav-lang-btn"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-zinc-900/60 border border-zinc-800/40 text-slate-300 hover:bg-emerald-500/15 transition shadow-sm cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'EN' ? 'አማርኛ' : 'English'}
          </button>
        </div>
      </header>

      {/* Main Glassmorphism Centerpiece */}
      <main className="w-full max-w-md my-auto py-6 relative z-10" id="main-content-public">
        <div className="p-8 rounded-[32px] bg-white/45 dark:bg-zinc-900/45 border border-white/55 dark:border-zinc-800/50 shadow-2xl backdrop-blur-xl flex flex-col items-center">
          
          {/* Business Logo / Initials Badge */}
          <div className="w-24 h-24 rounded-[24px] bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-white/60 dark:border-zinc-800/50 flex items-center justify-center mb-5 shadow-inner">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.businessName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[24px]"
              />
            ) : (
              <Building2 className="w-12 h-12 text-emerald-500" />
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight text-center mb-2">
            {business.businessName}
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium max-w-[280px] leading-relaxed mb-8">
            {t.instruction}
          </p>

          {/* Payment Stack */}
          <div className="w-full space-y-3" id="payment-stack">
            {business.banks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm italic">
                No active mobile banking profiles listed.
              </div>
            ) : (
              business.banks.map(bank => {
                return (
                  <button
                    key={bank.id}
                    onClick={() => {
                      setSelectedBank(bank);
                      setCopied(false);
                    }}
                    id={`bank-row-${bank.id}`}
                    className="w-full group flex items-center justify-between p-4 rounded-[20px] bg-white/40 dark:bg-zinc-950/20 border border-white/50 dark:border-zinc-850/30 shadow-sm hover:bg-white/85 dark:hover:bg-zinc-900/60 hover:scale-[1.01] hover:border-emerald-500/30 dark:hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Brand Logo replacing letter circle */}
                      <BankLogo bankName={bank.bankName} className="w-11 h-11" />
                      
                      <div className="text-left">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {bank.bankName}
                        </div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          {bank.accountNumber}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-black px-3 py-1.5 rounded-full shadow-sm transition duration-300">
                      {t.payNow}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Footer Credentials */}
      <footer className="w-full max-w-md text-center py-4 px-2 border-t border-slate-200/20 dark:border-zinc-900/40 relative z-20 flex flex-col items-center gap-1 text-[10px] text-slate-500 font-medium">
        <p>© 2026 Mobile Banking Directory Platform. All rights reserved.</p>
        <p className="text-emerald-450 dark:text-emerald-400 font-semibold">build BY NEBIYOU DANIEL (Website designer and Developer.)</p>
      </footer>

      {/* Expanded Payment Details Modal (Frosted Glass Overlay Drawer) */}
      {selectedBank && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition duration-300"
          onClick={() => setSelectedBank(null)}
        >
          <div 
            className="w-full max-w-sm rounded-[28px] bg-white/95 dark:bg-zinc-900/95 border border-white/60 dark:border-zinc-800/50 shadow-2xl backdrop-blur-2xl p-6 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
            id="payment-details-modal"
          >
            <button
              onClick={() => setSelectedBank(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mt-3 mb-6">
              <BankLogo bankName={selectedBank.bankName} className="w-16 h-16 mx-auto mb-3" />
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">
                {selectedBank.bankName}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">{t.paymentDetails}</p>
            </div>

            {/* Display Box */}
            <div className="bg-slate-50/50 dark:bg-black/40 border border-slate-100 dark:border-zinc-800/40 rounded-[20px] p-5 text-center mb-5 relative group">
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">{t.accountNum}</p>
              
              <div className="text-xl font-mono font-extrabold text-slate-800 dark:text-white tracking-wide break-all my-2 select-all">
                {selectedBank.accountNumber}
              </div>
              
              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-1">
                {t.tapToCopy}
              </p>
            </div>

            {/* Actions Panel */}
            <div className="space-y-2.5">
              <button
                onClick={() => copyToClipboard(selectedBank.accountNumber)}
                id="copy-account-btn"
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition shadow duration-300 cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-emerald-500 text-black hover:bg-emerald-600 shadow-emerald-500/10'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t.copySuccess : t.copyText}
              </button>

              {selectedBank.payLink && (
                <a
                  href={selectedBank.payLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-900 transition"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-500" />
                  {t.openApp}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* About App Info Drawer/Modal */}
      {showAbout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition duration-300"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="w-full max-w-sm rounded-[28px] bg-white/95 dark:bg-zinc-900/95 border border-white/60 dark:border-zinc-800/40 shadow-2xl backdrop-blur-2xl p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            id="about-modal"
          >
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-3">
              {t.aboutTitle}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {t.aboutText}
            </p>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Developer</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mb-0.5">Nebiyou Daniel</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 font-semibold uppercase tracking-wider">Personal Website Designer and Developer</p>
              
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Info</p>
              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-350">
                <p>
                  <span className="font-semibold text-slate-500">Telegram:</span>{" "}
                  <a href="https://t.me/NebiyouDaniel" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium hover:underline transition-colors">
                    @NebiyouDaniel
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-slate-500">Instagram:</span>{" "}
                  <a href="https://instagram.com/aka_neba" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium hover:underline transition-colors">
                    @aka_neba
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-slate-500">Phone:</span>{" "}
                  <a href="tel:+251956797970" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium hover:underline transition-colors">
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

            {business && business.createdAt && (
              <div className="bg-slate-100 dark:bg-zinc-800 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Account Created</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {new Date(business.createdAt).toLocaleDateString(lang === 'EN' ? 'en-US' : 'am-ET', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            <button
              onClick={() => setShowAbout(false)}
              className="w-full py-2.5 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-zinc-850 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
