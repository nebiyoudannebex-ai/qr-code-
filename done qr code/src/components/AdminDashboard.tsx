import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Activity,
  Plus,
  RefreshCw,
  LogOut,
  UserPlus,
  Search,
  Check,
  X,
  FileText,
  Clock,
  Briefcase,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { User, AuditLog } from '../types';
import BrandLogo from './BrandLogo';
import { createSessionTimeoutHandler } from '../utils/session';
import { apiFetch } from '../utils/api';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  onSessionExpired: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function AdminDashboard({ user, onLogout, onSessionExpired, darkMode, setDarkMode }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'merchants' | 'logs' | 'settings'>('merchants');
  
  // Data State
  const [merchants, setMerchants] = useState<User[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // New Merchant Form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [merchantUsername, setMerchantUsername] = useState('');
  const [merchantBusiness, setMerchantBusiness] = useState('');
  const [merchantPassword, setMerchantPassword] = useState('');
  const [merchantAccountType, setMerchantAccountType] = useState<'temporary' | 'permanent'>('permanent');
  const [creatingMerchant, setCreatingMerchant] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [upgradingMerchantId, setUpgradingMerchantId] = useState<string | null>(null);

  // Filters & Search
  const [merchantSearch, setMerchantSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Custom deletion state
  const [merchantToDelete, setMerchantToDelete] = useState<{ id: string; businessName: string } | null>(null);
  const [deletingMerchant, setDeletingMerchant] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Admin credentials settings
  const [adminUsername, setAdminUsername] = useState(user.username);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await apiFetch(input, init);
    if (response.status === 401) {
      onSessionExpired();
      throw new Error('Session expired. Please sign in again.');
    }
    return response;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const response = await authFetch('/api/auth/profile', {
        method: 'POST',
        body: JSON.stringify({ username: adminUsername, businessName: user.businessName })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      setProfileSuccess('Username updated successfully! Refreshing details...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      const response = await authFetch('/api/auth/password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update password');

      setPasswordSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  useEffect(() => {
    const sessionHandler = createSessionTimeoutHandler(() => {
      onSessionExpired();
    });

    sessionHandler.attach();
    return () => sessionHandler.detach();
  }, [onSessionExpired]);

  // Load merchants
  const fetchMerchants = async () => {
    setLoadingMerchants(true);
    try {
      const response = await authFetch('/api/admin/users');
      const data = await response.json();
      if (Array.isArray(data)) {
        setMerchants(data.filter(u => u.role !== 'admin'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMerchants(false);
    }
  };

  const handleDeleteMerchant = (id: string, businessName: string) => {
    setDeleteError(null);
    setMerchantToDelete({ id, businessName });
  };

  const executeDeleteMerchant = async () => {
    if (!merchantToDelete) return;
    setDeletingMerchant(true);
    setDeleteError(null);

    try {
      const response = await authFetch(`/api/admin/users/${merchantToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete merchant');
      }
      setMerchantToDelete(null);
      fetchMerchants();
      fetchLogs();
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeletingMerchant(false);
    }
  };

  // Load audit logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await authFetch('/api/admin/logs');
      const data = await response.json();
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
    fetchLogs();
  }, []);

  const handleLogout = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
      onLogout();
    } catch (err) {
      console.error(err);
      onLogout();
    }
  };

  const handleCreateMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantUsername || !merchantBusiness || !merchantPassword) {
      setCreateError('Please fill in all fields.');
      return;
    }

    setCreatingMerchant(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const response = await authFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          username: merchantUsername,
          businessName: merchantBusiness,
          password: merchantPassword,
          accountType: merchantAccountType
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create merchant');
      }

      setCreateSuccess(`Merchant created successfully! Generated ID: ${data.id}`);
      setMerchantUsername('');
      setMerchantBusiness('');
      setMerchantPassword('');
      setMerchantAccountType('permanent');
      fetchMerchants();
      fetchLogs(); // Reload logs
      setTimeout(() => setShowCreateForm(false), 2000);
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreatingMerchant(false);
    }
  };

  const handleUpgradeMerchant = async (merchantId: string) => {
    setUpgradingMerchantId(merchantId);
    try {
      const response = await authFetch(`/api/admin/users/${merchantId}/upgrade`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade merchant');
      }
      fetchMerchants();
      fetchLogs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpgradingMerchantId(null);
    }
  };

  // Filter logs & merchants
  const filteredMerchants = merchants.filter(m => 
    m.businessName.toLowerCase().includes(merchantSearch.toLowerCase()) ||
    m.username.toLowerCase().includes(merchantSearch.toLowerCase()) ||
    m.id.toLowerCase().includes(merchantSearch.toLowerCase())
  );

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.username || '').toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(logSearch.toLowerCase());
    
    if (logFilter === 'all') return matchesSearch;
    return matchesSearch && log.action.includes(logFilter);
  });

  const getLogBadgeColor = (action: string) => {
    if (action.includes('fail') || action.includes('error')) return 'bg-red-500/10 text-red-600 dark:text-red-400';
    if (action.includes('create') || action.includes('add')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    if (action.includes('delete')) return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
    if (action.includes('update') || action.includes('change')) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col transition-colors duration-300">
      {/* Admin header */}
      <header className="sticky top-0 z-30 w-full bg-zinc-900/60 backdrop-blur-xl border-b border-zinc-800/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-10 w-10" />
          <div>
            <h1 className="text-base font-extrabold tracking-tight leading-none text-slate-900 dark:text-white flex items-center gap-1.5">
              Super Admin Panel
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
            </h1>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase mt-1 block">
              Global Platform Controls
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </header>

      {/* Main Layout */}
      <div className="max-w-5xl w-full mx-auto p-4 md:p-6 flex-grow flex flex-col md:flex-row gap-6">
        
        {/* Left column sidebar navigation */}
        <aside className="w-full md:w-56 shrink-0 space-y-1.5">
          <button
            onClick={() => setActiveTab('merchants')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-left transition cursor-pointer ${
              activeTab === 'merchants'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            Merchant Accounts
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-left transition cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <Activity className="w-4.5 h-4.5" />
            Platform Audit Logs
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-left transition cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/10'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <Shield className="w-4.5 h-4.5" />
            Admin Credentials
          </button>
        </aside>

        {/* Content panel */}
        <main className="flex-grow">
          
          {activeTab === 'merchants' && (
            <section className="space-y-4" id="merchants-admin-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Merchant Registry
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    View active directory profiles and provision secure new merchant accounts
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    setCreateError(null);
                    setCreateSuccess(null);
                  }}
                  id="admin-create-merchant-btn"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-extrabold bg-emerald-500 hover:bg-emerald-600 text-black shadow shadow-emerald-500/15 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Provision Merchant
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 w-4 h-4 my-auto" />
                <input
                  type="text"
                  placeholder="Search by Business Name, Username, or ID..."
                  value={merchantSearch}
                  onChange={e => setMerchantSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                />
              </div>

              {loadingMerchants ? (
                <div className="p-12 text-center text-slate-400 animate-pulse">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                  Retrieving merchant registry...
                </div>
              ) : filteredMerchants.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center">
                  <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">No merchants matching your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredMerchants.map(m => {
                    const isTemp = m.accountType === 'temporary';
                    const isPaused = m.accountStatus === 'paused';
                    
                    // calculate remaining days
                    let remainingDays = 0;
                    if (isTemp && m.expiryDate) {
                      const diff = new Date(m.expiryDate).getTime() - Date.now();
                      remainingDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                    }

                    return (
                      <div
                        key={m.id}
                        className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/55 dark:border-zinc-800/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {m.businessName}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400">
                              ID: {m.id}
                            </span>
                            
                            {/* Account Type and Status Badges */}
                            {isTemp ? (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                isPaused 
                                  ? 'bg-amber-500/10 text-amber-500' 
                                  : 'bg-indigo-500/10 text-indigo-400'
                              }`}>
                                Temporary ({isPaused ? 'Expired & Paused' : `${remainingDays}d left`})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400">
                                Permanent (Active)
                              </span>
                            )}
                          </div>
                          
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Shield className="w-3.5 h-3.5 text-slate-400" />
                              Username: {m.username}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Provisioned: {new Date(m.createdAt).toLocaleDateString()}
                            </span>
                            {m.expiryDate && (
                              <span className="text-[11px] text-rose-400 font-medium font-mono">
                                Expires: {new Date(m.expiryDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                          {isTemp && (
                            <button
                              onClick={() => handleUpgradeMerchant(m.id)}
                              disabled={upgradingMerchantId === m.id}
                              className="px-3.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500 hover:text-black rounded-full transition text-center disabled:opacity-50 cursor-pointer"
                              title="Merchant paid to change account to permanent"
                            >
                              {upgradingMerchantId === m.id ? 'Upgrading...' : 'Convert to Permanent ✓'}
                            </button>
                          )}
                          <a
                            href={`/u/${m.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black rounded-full transition text-center"
                          >
                            Launch Gateway →
                          </a>
                          <button
                            onClick={() => handleDeleteMerchant(m.id, m.businessName)}
                            className="p-1.5 text-red-500 hover:text-white hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                            title="Delete merchant account"
                            id={`delete-merchant-${m.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === 'logs' && (
            <section className="space-y-4" id="logs-admin-section">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Platform Security Audit Logs
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live system monitor logging database changes, profile updates, and login attempts
                  </p>
                </div>
                <button
                  onClick={fetchLogs}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 transition cursor-pointer"
                  title="Reload audit logs"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Filters Panel */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-grow">
                  <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 w-4 h-4 my-auto" />
                  <input
                    type="text"
                    placeholder="Search logs by keyword, user, or details..."
                    value={logSearch}
                    onChange={e => setLogSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none text-xs"
                  />
                </div>
                <select
                  value={logFilter}
                  onChange={e => setLogFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none"
                >
                  <option value="all">All Operations</option>
                  <option value="login">Logins / Logouts</option>
                  <option value="merchant_create">Merchant Provisioning</option>
                  <option value="password_change">Password Updates</option>
                  <option value="bank_">Mobile Banking Changes</option>
                </select>
              </div>

              {loadingLogs ? (
                <div className="p-12 text-center text-slate-400 animate-pulse">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                  Retrieving system logs...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center">
                  <Activity className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No logs matching your filters.</p>
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-zinc-800">
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">User</th>
                          <th className="py-3 px-4">Action</th>
                          <th className="py-3 px-4">Details Summary</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800 text-xs">
                        {filteredLogs.map(log => (
                          <tr key={log.id} className="hover:bg-zinc-950/20">
                            <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[10px]">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap font-semibold">
                              {log.username || 'System'}
                              {log.userId && <span className="text-[10px] font-mono text-slate-400 ml-1.5">({log.userId})</span>}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${getLogBadgeColor(log.action)}`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={log.details}>
                              {log.details}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => setSelectedLog(log)}
                                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-800 hover:bg-emerald-500 hover:text-black border border-zinc-700 text-slate-300 rounded-lg transition-all duration-200 cursor-pointer"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="space-y-6 animate-fadeIn" id="settings-admin-section">
              {/* Profile Details */}
              <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800/80 shadow-sm">
                <h3 className="text-base font-extrabold text-white mb-4">
                  Account Management
                </h3>
                {profileSuccess && (
                  <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-fadeIn">
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold animate-fadeIn">
                    {profileError}
                  </div>
                )}
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                      Super Admin Username
                    </label>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      required
                      className="w-full max-w-md px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-black transition disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    {updatingProfile ? 'Saving...' : 'Update Admin Username'}
                  </button>
                </form>
              </div>

              {/* Password Change */}
              <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800/80 shadow-sm">
                <h3 className="text-base font-extrabold text-white mb-4">
                  Update Security Password
                </h3>
                {passwordSuccess && (
                  <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-fadeIn">
                    {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold animate-fadeIn">
                    {passwordError}
                  </div>
                )}
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="•••••••• (min 5 chars)"
                        required
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-black transition disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    {updatingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Slide-Up Form Modal: Provision new Merchant (Liquid Glass Overlay) */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setShowCreateForm(false)}
        >
          <div 
            className="w-full max-w-md rounded-[28px] bg-white/95 dark:bg-zinc-900/95 border border-white/60 dark:border-zinc-850/50 shadow-2xl backdrop-blur-2xl p-6 relative"
            onClick={e => e.stopPropagation()}
            id="create-merchant-modal"
          >
            <button
              onClick={() => setShowCreateForm(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <UserPlus className="w-5.5 h-5.5 text-emerald-500" />
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                Provision Merchant Account
              </h3>
            </div>

            {createSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                {createSuccess}
              </div>
            )}
            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMerchant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Business / Company Name
                </label>
                <input
                  type="text"
                  value={merchantBusiness}
                  onChange={e => setMerchantBusiness(e.target.value)}
                  placeholder="e.g., Company Name Ltd"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Portal Login Username
                </label>
                <input
                  type="text"
                  value={merchantUsername}
                  onChange={e => setMerchantUsername(e.target.value)}
                  placeholder="e.g., john_doe"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Portal Login Password
                </label>
                <input
                  type="text"
                  value={merchantPassword}
                  onChange={e => setMerchantPassword(e.target.value)}
                  placeholder="Set login password (min 5 chars)"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Account Billing Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMerchantAccountType('permanent')}
                    className={`px-4 py-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      merchantAccountType === 'permanent'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-slate-950 text-slate-500 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span>Permanent Account</span>
                    <span className="text-[9px] font-medium opacity-80">Requires Monthly Review</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMerchantAccountType('temporary')}
                    className={`px-4 py-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      merchantAccountType === 'temporary'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-slate-950 text-slate-500 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span>Temporary Account</span>
                    <span className="text-[9px] font-medium opacity-80">Pauses in 1 Month</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-grow py-2.5 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingMerchant}
                  className="flex-grow py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-black transition disabled:opacity-50 cursor-pointer"
                >
                  {creatingMerchant ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Log Entry Detail Modal */}
      {selectedLog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition duration-300"
          onClick={() => setSelectedLog(null)}
        >
          <div 
            className="w-full max-w-lg rounded-[28px] bg-zinc-900 border border-zinc-800/80 shadow-2xl backdrop-blur-2xl p-6 relative"
            onClick={e => e.stopPropagation()}
            id="audit-log-detail-modal"
          >
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-5 border-b border-zinc-800/80 pb-4">
              <Activity className="w-5.5 h-5.5 text-emerald-500" />
              <h3 className="text-lg font-extrabold text-white">
                Security Audit Log Details
              </h3>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-800/30">
                <span className="font-bold text-slate-400 font-sans">Timestamp</span>
                <span className="col-span-2 font-mono text-slate-200">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-800/30">
                <span className="font-bold text-slate-400 font-sans">Actor Username</span>
                <span className="col-span-2 text-slate-200 font-semibold">
                  {selectedLog.username || 'System Event'}
                </span>
              </div>

              {selectedLog.userId && (
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-800/30">
                  <span className="font-bold text-slate-400 font-sans">Actor User ID</span>
                  <span className="col-span-2 font-mono text-slate-200">
                    {selectedLog.userId}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-800/30">
                <span className="font-bold text-slate-400 font-sans">Action Type</span>
                <span className="col-span-2 font-mono">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getLogBadgeColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </span>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="block font-bold text-slate-400 font-sans">Event Description / Payload Details</span>
                <div className="p-4 bg-black/45 border border-zinc-800/40 rounded-xl font-mono text-slate-200 whitespace-pre-wrap break-words leading-relaxed max-h-48 overflow-y-auto">
                  {selectedLog.details}
                </div>
              </div>

              {(() => {
                const details = selectedLog.details;
                const beforePassMatch = details.match(/Before password:\s*"(.*?)"/);
                const newPassMatch = details.match(/New password:\s*"(.*?)"/);
                const usernameMatch = details.match(/Username:\s*"(.*?)"\s*->\s*"(.*?)"/);
                const businessMatch = details.match(/Business:\s*"(.*?)"\s*->\s*"(.*?)"/);

                const parsed = {
                  beforePassword: beforePassMatch ? beforePassMatch[1] : null,
                  newPassword: newPassMatch ? newPassMatch[1] : null,
                  beforeUsername: usernameMatch ? usernameMatch[1] : null,
                  afterUsername: usernameMatch ? usernameMatch[2] : null,
                  beforeBusiness: businessMatch ? businessMatch[1] : null,
                  afterBusiness: businessMatch ? businessMatch[2] : null,
                };

                const hasDiff = parsed.beforePassword || parsed.newPassword || parsed.beforeUsername || parsed.afterUsername || parsed.beforeBusiness || parsed.afterBusiness;
                if (!hasDiff) return null;

                return (
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3.5 animate-fadeIn">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5">
                      Visual State Difference
                    </div>
                    
                    {/* Password Changes */}
                    {(parsed.beforePassword || parsed.newPassword) && (
                      <div className="grid grid-cols-2 gap-3">
                        {parsed.beforePassword && (
                          <div className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Previous Password</span>
                            <span className="font-mono font-bold text-xs select-all">{parsed.beforePassword}</span>
                          </div>
                        )}
                        {parsed.newPassword && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">New Password</span>
                            <span className="font-mono font-bold text-xs select-all">{parsed.newPassword}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Username Changes */}
                    {(parsed.beforeUsername || parsed.afterUsername) && (
                      <div className="grid grid-cols-2 gap-3">
                        {parsed.beforeUsername && (
                          <div className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Previous Username</span>
                            <span className="font-sans font-bold text-xs select-all">{parsed.beforeUsername}</span>
                          </div>
                        )}
                        {parsed.afterUsername && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">New Username</span>
                            <span className="font-sans font-bold text-xs select-all">{parsed.afterUsername}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Business Changes */}
                    {(parsed.beforeBusiness || parsed.afterBusiness) && (
                      <div className="grid grid-cols-2 gap-3">
                        {parsed.beforeBusiness && (
                          <div className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Previous Business Name</span>
                            <span className="font-sans font-bold text-xs select-all">{parsed.beforeBusiness}</span>
                          </div>
                        )}
                        {parsed.afterBusiness && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">New Business Name</span>
                            <span className="font-sans font-bold text-xs select-all">{parsed.afterBusiness}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/10 transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Deletion Confirmation Modal */}
      {merchantToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition duration-300"
          onClick={() => setMerchantToDelete(null)}
          id="custom-delete-merchant-modal"
        >
          <div 
            className="w-full max-w-md rounded-[28px] bg-zinc-900 border border-red-500/30 shadow-2xl p-6 relative text-white"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setMerchantToDelete(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertCircle className="w-6 h-6 animate-pulse" />
              <h3 className="text-lg font-extrabold">
                Confirm Account Deletion
              </h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              Are you sure you want to delete the merchant account for <span className="text-white font-bold underline decoration-red-500/40">"{merchantToDelete.businessName}"</span>?
            </p>

            <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-red-400 font-semibold space-y-1 mb-6">
              <p>• Permanently deletes their portal login credentials.</p>
              <p>• Permanently deletes all active mobile banking profiles.</p>
              <p>• This destructive operation cannot be undone.</p>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMerchantToDelete(null)}
                className="flex-grow py-2.5 rounded-xl font-semibold text-sm bg-zinc-800 hover:bg-zinc-700 text-slate-200 transition cursor-pointer border border-zinc-750"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteMerchant}
                disabled={deletingMerchant}
                className="flex-grow py-2.5 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50 cursor-pointer shadow-lg shadow-red-500/10"
              >
                {deletingMerchant ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
