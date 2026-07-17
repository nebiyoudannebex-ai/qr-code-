import { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';
import { User, BankingDetail } from './types';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { useBeforeUnloadLogout } from './hooks/useBeforeUnloadLogout';
import LandingPage from './components/LandingPage';
import PublicView from './components/PublicView';
import LoginView from './components/LoginView';
import MerchantDashboard from './components/MerchantDashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [cachedBankingDetails, setCachedBankingDetails] = useState<BankingDetail[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  // Simple Router sync with History API
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Dark Mode side effects - Force Dark Mode permanently
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (!sessionNotice) return;
    const timeoutId = window.setTimeout(() => setSessionNotice(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [sessionNotice]);

  // Check auth session on startup
  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(err => {
        console.error('Auth verification error:', err);
        setUser(null);
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, []);

  const handleLoginSuccess = async (loginResponse: any) => {
    try {
      const response = await apiFetch('/api/auth/me');
      const data = await response.json();
      const activeUser = data.user ?? loginResponse.user;

      if (!data.user) {
        setSessionNotice('Session could not be verified. Log in again after confirming Supabase is configured.');
      }

      // Cache banking details from login response for instant dashboard load
      if (loginResponse.bankingDetails && Array.isArray(loginResponse.bankingDetails)) {
        setCachedBankingDetails(loginResponse.bankingDetails);
      }

      setUser(activeUser);
      if (activeUser.role === 'admin') {
        navigateTo('/staff/admin');
      } else {
        navigateTo('/staff');
      }
    } catch (err) {
      console.error('Post-login session verification failed:', err);
      setSessionNotice('Login failed to establish a secure session. Restart the server and try again.');
      setUser(null);
    }
  };

  const handleLogoutSuccess = () => {
    setUser(null);
    setCachedBankingDetails([]);
    navigateTo('/');
  };

  const handleSessionExpired = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Session logout failed:', err);
    }

    setUser(null);
    setSessionNotice('Session expired due to inactivity.');
    if (currentPath.includes('/staff/admin')) {
      navigateTo('/staff/admin');
    } else {
      navigateTo('/staff');
    }
  };

  // Activate 15-minute inactivity session timeout for logged-in users
  useSessionTimeout({
    timeoutMinutes: 15,
    onTimeout: handleSessionExpired,
    isActive: !!user && (currentPath.includes('/staff')),
  });

  // Automatically logout when page unloads (refresh, tab close, navigate away)
  useBeforeUnloadLogout({
    onLogout: handleLogoutSuccess,
    isAuthenticated: !!user,
  });

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-slate-950 via-zinc-950 to-black transition-colors duration-500">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400 font-semibold tracking-wide">
          Verifying secure session gateway...
        </p>
      </div>
    );
  }

  // --- ROUTE MATCHING ---

  // Match /u/:ownerId (Public Customer View)
  const userMatch = currentPath.match(/^\/u\/([a-zA-Z0-9_\-]+)$/);
  if (userMatch) {
    const ownerId = userMatch[1];
    return (
      <PublicView
        ownerId={ownerId}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  // Match /staff/admin (Admin Panel & Login)
  if (currentPath === '/staff/admin' || currentPath.startsWith('/staff/admin')) {
    if (!user || user.role !== 'admin') {
      return (
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onBackToDirectory={() => navigateTo('/')}
          isAdminOnly={true}
        />
      );
    }

    return (
      <>
        {sessionNotice && (
          <div className="fixed top-4 right-4 z-[70] max-w-sm rounded-2xl border border-emerald-400/20 bg-zinc-950/90 px-4 py-3 text-sm font-medium text-emerald-200 shadow-2xl backdrop-blur">
            {sessionNotice}
          </div>
        )}
        <AdminDashboard
          user={user}
          onLogout={handleLogoutSuccess}
          onSessionExpired={handleSessionExpired}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      </>
    );
  }

  // Match /staff (Merchant / User Portal & Login)
  if (currentPath === '/staff' || currentPath.startsWith('/staff')) {
    if (!user || user.role !== 'merchant') {
      return (
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onBackToDirectory={() => navigateTo('/')}
          isAdminOnly={false}
        />
      );
    }

    return (
      <>
        {sessionNotice && (
          <div className="fixed top-4 right-4 z-[70] max-w-sm rounded-2xl border border-emerald-400/20 bg-zinc-950/90 px-4 py-3 text-sm font-medium text-emerald-200 shadow-2xl backdrop-blur">
            {sessionNotice}
          </div>
        )}
        <MerchantDashboard
          user={user}
          onLogout={handleLogoutSuccess}
          onSessionExpired={handleSessionExpired}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          preloadedBankingDetails={cachedBankingDetails}
        />
      </>
    );
  }

  // Fallback to Main Landing Page (e.g. root path `/`)
  return (
    <LandingPage
      onGoToStaff={() => navigateTo('/staff')}
      onGoToAdmin={() => navigateTo('/staff/admin')}
      onGoToDemo={() => navigateTo('/u/m-demo')}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}
