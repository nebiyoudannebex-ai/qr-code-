import React, { useState, useEffect } from 'react';
import {
  LogOut,
  User as UserIcon,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  QrCode,
  Download,
  Copy,
  Settings,
  Lock,
  Globe,
  RefreshCw,
  Building,
  AlertCircle,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { User, BankingDetail } from '../types';
import BankLogo from './BankLogo';

export const ETHIOPIAN_BANKS_PRESETS = [
  'Commercial Bank of Ethiopia (CBE)',
  'Telebirr Mobile Wallet',
  'Dashen Bank (Amole)',
  'Awash Bank (Awash Birr)',
  'Bank of Abyssinia (BoA)',
  'Cooperative Bank of Oromia (Coopay)',
  'Hibret Bank (Hila)',
  'Wegagen Bank (Efoy)',
  'Nib International Bank (Nib Birr)',
  'Bunna Bank (Bunna)',
  'Zemen Bank (Zemen)',
  'Oromia Bank (Oromia)',
  'Berhan Bank (Berhan)',
  'Abay Bank (Abay)',
  'Lion International Bank (Anbesa)',
  'Global Bank Ethiopia (Global)',
  'Enat Bank (Enat)'
];

interface MerchantDashboardProps {
  user: User;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function MerchantDashboard({ user, onLogout, darkMode, setDarkMode }: MerchantDashboardProps) {
  const [currentUser, setCurrentUser] = useState<User>(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'payments' | 'qr' | 'settings'>('payments');
  
  // Banking details state
  const [banks, setBanks] = useState<BankingDetail[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [bankingError, setBankingError] = useState<string | null>(null);

  // Modals / Form states for Banks
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingBank, setEditingBank] = useState<BankingDetail | null>(null);
  const [bankToDelete, setBankToDelete] = useState<{ id: string; bankName: string } | null>(null);
  const [deletingBank, setDeletingBank] = useState(false);
  const [deleteBankError, setDeleteBankError] = useState<string | null>(null);
  const [bankName, setBankName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [payLink, setPayLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [savingBank, setSavingBank] = useState(false);

  // Settings states
  const [businessName, setBusinessName] = useState(user.businessName);
  const [username, setUsername] = useState(user.username);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Maintenance state
  const [acknowledging, setAcknowledging] = useState(false);

  // QR Code state
  const [copiedLink, setCopiedLink] = useState(false);

  // STRIP PROTOCOL FOR LIVE ENVIRONMENT AND FIX SYNTAX TYPO
  const cleanDomain = window.location.origin.replace(/^https?:\/\//, '');
  const publicUrl = `${window.location.origin}/u/${currentUser.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${cleanDomain}/u/${currentUser.id}`)}`;

  const handleAcknowledgeMaintenance = async () => {
    setAcknowledging(true);
    try {
      const response = await fetch('/api/merchant/acknowledge-maintenance', {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm maintenance');
      }
      if (data.user) {
        setCurrentUser(data.user);
      }
      alert('Thank you! Your monthly active status has been registered.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAcknowledging(false);
    }
  };

  // Fetch bank details
  const fetchBanks = () => {
    setLoadingBanks(true);
    fetch('/api/merchant/banks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBanks(data);
          setBankingError(null);
        } else {
          setBanks([]);
          setBankingError(data?.error || 'Failed to parse mobile banking profiles format.');
        }
      })
      .catch(err => {
        console.error(err);
        setBankingError('Failed to fetch mobile banking profiles.');
      })
      .finally(() => {
        setLoadingBanks(false);
      });
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      onLogout();
    } catch (err) {
      console.error(err);
      onLogout(); // Fallback
    }
  };

  // Profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, businessName })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      setProfileSuccess('Profile updated successfully! Refreshing details...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update password');

      setPasswordSuccess('Password successfully updated!');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Toggle active bank status directly from the list
  const handleToggleBankActive = async (bank: BankingDetail) => {
    try {
      const response = await fetch(`/api/merchant/banks/${bank.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: bank.bankName,
          accountNumber: bank.accountNumber,
          payLink: bank.payLink,
          isActive: !bank.isActive
        })
      });
      if (response.ok) {
        fetchBanks();
      }
    } catch (err) {
      console.error('Failed to toggle bank active state:', err);
    }
  };

  // Open bank form
  const handleOpenBankForm = (bank: BankingDetail | null = null) => {
    if (bank) {
      setEditingBank(bank);
      setBankName(bank.bankName);
      setAccountNumber(bank.accountNumber);
      setPayLink(bank.payLink);
      setIsActive(bank.isActive);
      if (ETHIOPIAN_BANKS_PRESETS.includes(bank.bankName)) {
        setSelectedPreset(bank.bankName);
      } else {
        setSelectedPreset('other');
      }
    } else {
      setEditingBank(null);
      setBankName(ETHIOPIAN_BANKS_PRESETS[0]);
      setSelectedPreset(ETHIOPIAN_BANKS_PRESETS[0]);
      setAccountNumber('');
      setPayLink('');
      setIsActive(true);
    }
    setShowBankForm(true);
  };

  // Save bank
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountNumber) return;

    setSavingBank(true);
    const url = editingBank ? `/api/merchant/banks/${editingBank.id}` : '/api/merchant/banks';
    const method = editingBank ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankName, accountNumber, payLink, isActive })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save bank info');

      setShowBankForm(false);
      fetchBanks();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingBank(false);
    }
  };

  // Delete bank
  const handleDeleteBank = (id: string, bankName: string) => {
    setDeleteBankError(null);
    setBankToDelete({ id, bankName });
  };

  const executeDeleteBank = async () => {
    if (!bankToDelete) return;
    setDeletingBank(true);
    setDeleteBankError(null);

    try {
      const response = await fetch(`/api/merchant/banks/${bankToDelete.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setBankToDelete(null);
        fetchBanks();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete payment option');
      }
    } catch (err: any) {
      setDeleteBankError(err.message);
    } finally {
      setDeletingBank(false);
    }
  };

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const downloadQrCode = () => {
    // Generate simple download trigger for QR
    fetch(qrCodeUrl)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${user.businessName.replace(/\s+/g, '_')}_payment_QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(err => {
        console.error('Failed to download QR code image directly', err);
        // Fallback open in new window
        window.open(qrCodeUrl, '_blank');
      });
  };

  // Check if monthly maintenance review is due for permanent accounts
  const lastActionDate = currentUser.lastNotified || currentUser.createdAt;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const isMaintenanceDue = currentUser.accountType === 'permanent' && 
    (Date.now() - new Date(lastActionDate).getTime() > thirtyDaysMs);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* Expiry / Paused Full-screen Lock Overlay */}
      {currentUser.accountStatus === 'paused' && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-zinc-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Temporary Access Paused</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your 1-month temporary portal access has expired. All of your public business billing and scan-to-pay profiles are temporarily offline.
            </p>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-400">
              Please contact your System Administrator to settle payment and permanently upgrade your business portal.
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 text-white font-bold rounded-xl transition cursor-pointer text-sm border border-zinc-800"
            >
              Logout & Exit Portal
            </button>
          </div>
        </div>
      )}

      {/* Top Header with Brand */}
      <header className="sticky top-0 z-30 w-full bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border-b border-slate-200/55 dark:border-zinc-800/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-black font-extrabold shadow-sm shadow-emerald-500/20">
            {currentUser.businessName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">
              {currentUser.businessName}
            </h1>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase mt-1 block">
              Merchant Dashboard (ID: {currentUser.id})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/50 rounded-full text-[10px] font-bold">
            <span className={`w-1.5 h-1.5 rounded-full ${currentUser.accountType === 'permanent' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
            <span className="text-slate-600 dark:text-slate-300 capitalize">{currentUser.accountType} Billing</span>
          </div>
          <button
            onClick={handleLogout}
            id="logout-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Primary Layout Structure */}
      <div className="max-w-4xl w-full mx-auto p-4 md:p-6 flex-grow flex flex-col gap-6">
        
        {/* Monthly Maintenance Banner */}
        {isMaintenanceDue && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md animate-pulse">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-300">Monthly Website Maintenance Required</h4>
                <p className="mt-0.5 text-amber-200/80 leading-relaxed">
                  Your permanent merchant account is due for its monthly service validation review. Acknowledge this notice to confirm active maintenance.
                </p>
              </div>
            </div>
            <button
              onClick={handleAcknowledgeMaintenance}
              disabled={acknowledging}
              id="ack-maintenance-btn"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition shrink-0 cursor-pointer text-xs disabled:opacity-50"
            >
              {acknowledging ? 'Confirming...' : 'Acknowledge Maintenance'}
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left column / Sidebar Navigation */}
        <aside className="w-full md:w-56 shrink-0 space-y-1.5">
          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-left transition cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <Building className="w-4.5 h-4.5" />
            Payment Directory
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-left transition cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <QrCode className="w-4.5 h-4.5" />
            QR Code Gateway
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-left transition cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <Settings className="w-4.5 h-4.5" />
            Account Settings
          </button>
        </aside>

        {/* Right column / Content panel */}
        <main className="flex-grow">
          {activeTab === 'payments' && (
            <section className="space-y-4" id="payments-tab-section">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Mobile Banking Profiles
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage active payment options customers see when they scan your QR
                  </p>
                </div>
                <button
                  onClick={() => handleOpenBankForm()}
                  id="add-bank-btn"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-extrabold bg-emerald-500 hover:bg-emerald-600 text-black shadow shadow-emerald-500/15 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Bank Option
                </button>
              </div>

              {loadingBanks ? (
                <div className="p-12 text-center text-slate-400 animate-pulse">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                  Loading payment directories...
                </div>
              ) : bankingError ? (
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  {bankingError}
                </div>
              ) : banks.length === 0 ? (
                <div className="p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-zinc-800 text-center">
                  <Building className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No payment options yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Add your mobile banking details (CBE, Telebirr, Dashen, etc.) to start accepting payments.
                  </p>
                  <button
                    onClick={() => handleOpenBankForm()}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition cursor-pointer"
                  >
                    Add your first bank
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {banks.map(bank => (
                    <div
                      key={bank.id}
                      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/55 dark:border-zinc-800/40 shadow-sm flex items-center justify-between group hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition"
                    >
                      <div className="flex items-center gap-3">
                        <BankLogo bankName={bank.bankName} className="w-10 h-10 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {bank.bankName}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              bank.isActive
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400'
                            }`}>
                              {bank.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-slate-500 mt-1">
                            {bank.accountNumber}
                          </p>
                          {bank.payLink && (
                            <span className="text-[10px] text-slate-400 mt-1 block max-w-sm truncate">
                              App link: {bank.payLink}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle Active status directly */}
                        <button
                          onClick={() => handleToggleBankActive(bank)}
                          title={bank.isActive ? 'Disable payment option' : 'Enable payment option'}
                          className="p-2 rounded-full text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          {bank.isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                        </button>

                        <button
                          onClick={() => handleOpenBankForm(bank)}
                          className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBank(bank.id, bank.bankName)}
                          className="p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'qr' && (
            <section className="space-y-4" id="qr-tab-section">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  QR Code Gateway
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  This QR code points directly to your centralized public payments directory
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/55 dark:border-zinc-800/40 shadow-sm flex flex-col items-center text-center">
                
                {/* QR Code display */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-md mb-4 flex items-center justify-center">
                  <img
                    src={qrCodeUrl}
                    alt="Payments Directory QR Code"
                    className="w-48 h-48 rounded"
                  />
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Scan to Pay {user.businessName}
                </h3>
                
                <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl p-3 flex items-center justify-between gap-2 mt-2">
                  <span className="text-xs font-mono truncate text-slate-500 dark:text-slate-400 select-all">
                    {publicUrl}
                  </span>
                  <button
                    onClick={copyPublicLink}
                    className="shrink-0 p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 mt-6">
                  <button
                    onClick={downloadQrCode}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-600 transition shadow shadow-emerald-500/10 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Image
                  </button>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
                  >
                    <Eye className="w-4 h-4 text-emerald-500" />
                    Preview Directory
                  </a>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="space-y-6" id="settings-tab-section">
              {/* Profile Details */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/55 dark:border-zinc-800/40 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
                  Account Management
                </h3>

                {profileSuccess && (
                  <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black transition cursor-pointer"
                  >
                    {updatingProfile ? 'Updating...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>

              {/* Password Change */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/55 dark:border-zinc-800/40 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
                  Update Security Password
                </h3>

                {passwordSuccess && (
                  <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                    {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-slate-800 dark:text-white placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                        New Secure Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        placeholder="Min 5 characters"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-slate-800 dark:text-white placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black transition cursor-pointer"
                  >
                    {updatingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>

      {/* Slide-Up Mobile Banking Form Drawer / Dialog (Liquid Glass Modal) */}
      {showBankForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setShowBankForm(false)}
        >
          <div 
            className="w-full max-w-md rounded-[28px] bg-zinc-900 border border-zinc-800 shadow-2xl p-6 relative text-white"
            onClick={e => e.stopPropagation()}
            id="banking-detail-form-modal"
          >
            <button
              onClick={() => setShowBankForm(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-extrabold text-white mb-4">
              {editingBank ? 'Edit Banking Detail' : 'Add Banking Detail'}
            </h3>

            <form onSubmit={handleSaveBank} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                  Select Mobile Banking Platform
                </label>
                <select
                  value={selectedPreset}
                  onChange={e => {
                    const val = e.target.value;
                    setSelectedPreset(val);
                    if (val !== 'other') {
                      setBankName(val);
                    } else {
                      setBankName('');
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-white"
                >
                  {ETHIOPIAN_BANKS_PRESETS.map(preset => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                  <option value="other">Other / Custom Platform</option>
                </select>
              </div>

              {selectedPreset === 'other' && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                    Custom Platform Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="e.g., Commercial Bank of Ethiopia, Telebirr"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                  Account Number / Phone Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="e.g., 1000231948574, 0911002233"
                  required
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                  Deep Payment Link / App Launch URL (Optional)
                </label>
                <input
                  type="url"
                  value={payLink}
                  onChange={e => setPayLink(e.target.value)}
                  placeholder="e.g., telebirr:// or quickpay.com/pay"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-white animate-fadeIn"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Allows customers to launch mobile app or load transaction automatically if supported.
                </span>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="isActive-checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="isActive-checkbox" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
                  Make this payment profile active and visible immediately
                </label>
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBankForm(false)}
                  className="flex-grow py-2.5 rounded-xl font-semibold text-sm bg-zinc-800 hover:bg-zinc-700 text-slate-200 transition cursor-pointer border border-zinc-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBank}
                  className="flex-grow py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-black transition disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {savingBank ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Banking Option Deletion Modal */}
      {bankToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition duration-300"
          onClick={() => setBankToDelete(null)}
          id="custom-delete-bank-modal"
        >
          <div 
            className="w-full max-w-md rounded-[28px] bg-zinc-900 border border-red-500/30 shadow-2xl p-6 relative text-white"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setBankToDelete(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertCircle className="w-6 h-6 animate-pulse" />
              <h3 className="text-lg font-extrabold">
                Delete Payment Option
              </h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              Are you sure you want to remove the mobile banking profile for <span className="text-white font-bold underline decoration-red-500/40">"{bankToDelete.bankName}"</span>?
            </p>

            <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-red-400 font-semibold space-y-1 mb-6">
              <p>• Customers will no longer see this payment option on your gateway page.</p>
              <p>• Active transfers on this profile will be hidden.</p>
              <p>• This action is safe, and you can re-add it at any time.</p>
            </div>

            {deleteBankError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {deleteBankError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBankToDelete(null)}
                className="flex-grow py-2.5 rounded-xl font-semibold text-sm bg-zinc-800 hover:bg-zinc-700 text-slate-200 transition cursor-pointer border border-zinc-750"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteBank}
                disabled={deletingBank}
                className="flex-grow py-2.5 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50 cursor-pointer shadow-lg shadow-red-500/10"
              >
                {deletingBank ? 'Deleting...' : 'Delete Option'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
