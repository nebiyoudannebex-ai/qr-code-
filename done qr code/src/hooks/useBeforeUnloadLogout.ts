import { useEffect } from 'react';

interface UseBeforeUnloadLogoutOptions {
  onLogout: () => void;
  isAuthenticated?: boolean;
}

/**
 * Custom hook to automatically logout user when page unloads (reload, tab close, navigation away).
 * Triggers the logout callback and clears server session via API.
 *
 * @param options.onLogout - Callback function to clear frontend auth state
 * @param options.isAuthenticated - Whether user is currently logged in (default: true)
 *
 * Example:
 * useBeforeUnloadLogout({
 *   onLogout: handleLogoutSuccess,
 *   isAuthenticated: !!user
 * });
 */
export function useBeforeUnloadLogout({
  onLogout,
  isAuthenticated = true,
}: UseBeforeUnloadLogoutOptions): void {
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Perform synchronous logout logic
      // Note: async operations are not reliable in beforeunload, so we use sendBeacon
      
      // Send logout request to server using sendBeacon (works even during unload)
      const logoutData = JSON.stringify({ method: 'POST' });
      navigator.sendBeacon('/api/auth/logout', logoutData);

      // Clear frontend auth state
      onLogout();

      // Optional: show confirmation dialog (comment out if not desired)
      // event.preventDefault();
      // event.returnValue = '';
    };

    const handleUnload = () => {
      // Fallback: ensure logout is called even if beforeunload wasn't triggered
      // This catches cases like tab closure or browser exit
      onLogout();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [isAuthenticated, onLogout]);
}
