import React, { useState } from 'react';
import { Lock, User as UserIcon, LogIn, AlertCircle, ArrowLeft, Sun, Moon } from 'lucide-react';
import { User } from '../types';
import BrandLogo from './BrandLogo';
import { apiFetch } from '../utils/api';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;  // Now receives full login response
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onBackToDirectory: () => void;
  isAdminOnly?: boolean;
}

export default function LoginView({ onLoginSuccess, darkMode, setDarkMode, onBackToDirectory, isAdminOnly = false }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid username or password');
      }

      // Check role constraints based on which portal is accessed
      if (isAdminOnly && data.user.role !== 'admin') {
        throw new Error('This login is for administrators only.');
      }

      if (!isAdminOnly && data.user.role === 'admin') {
        throw new Error('Administrators must login at the Admin Portal (/staff/admin).');
      }

      // Pass full login response including bankingDetails for instant dashboard load
      onLoginSuccess(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-between p-4 bg-gradient-to-tr from-slate-950 via-zinc-950 to-black transition-colors duration-500">
      {/* Background Gradient Mesh */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none"></div>

      {/* Header controls */}
      <header className="w-full max-w-md flex items-center justify-between py-3 px-1 relative z-20">
        <button
          onClick={onBackToDirectory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-900/60 border border-zinc-800/40 text-slate-300 hover:bg-emerald-500/15 transition shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Customer Gateway
        </button>
      </header>

      {/* Login Card */}
      <main className="w-full max-w-md my-auto py-6 relative z-10" id="login-form-container">
        <div className="p-8 rounded-[32px] bg-zinc-900/45 border border-zinc-800/50 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <BrandLogo className="h-14 w-14" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isAdminOnly ? 'Super Admin Portal' : 'Staff Portal'}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              {isAdminOnly ? 'Securely access Super Admin Panel' : 'Securely access Merchant Dashboard'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-2.5 text-xs font-medium animate-shake" id="login-error-alert">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4.5 h-4.5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoFocus
                  required
                  id="login-username-input"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/30 hover:bg-zinc-950/50 focus:bg-zinc-950 border border-zinc-800/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-white placeholder-slate-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  id="login-password-input"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950/30 hover:bg-zinc-950/50 focus:bg-zinc-950 border border-zinc-800/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-white placeholder-slate-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black shadow-lg shadow-emerald-500/10 active:scale-[0.99] transition duration-200 mt-6 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" />
                  Sign In to Portal
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer credit */}
      <footer className="w-full max-w-md text-center py-4 px-1 relative z-20 space-y-1">
        <p className="text-[10px] text-slate-500 font-medium">
          Protected by cryptographic password hashing & secure session management
        </p>
        <p className="text-[10px] text-emerald-455 dark:text-emerald-400 font-semibold">
          build BY NEBIYOU DANIEL (Website designer and Developer.)
        </p>
      </footer>
    </div>
  );
}
