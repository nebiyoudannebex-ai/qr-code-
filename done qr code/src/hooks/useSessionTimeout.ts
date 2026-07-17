import { useEffect, useRef } from 'react';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  onTimeout: () => void;
  isActive?: boolean;
}

/**
 * Custom hook to auto-logout user after inactivity.
 * Monitors user activity (mouse, clicks, scrolls, keypresses).
 * If inactive for the specified duration, triggers the onTimeout callback.
 *
 * @param options.timeoutMinutes - Inactivity duration in minutes (default: 15)
 * @param options.onTimeout - Callback function to execute when timeout occurs
 * @param options.isActive - Whether the hook should be active (default: true)
 *
 * Example:
 * useSessionTimeout({
 *   timeoutMinutes: 15,
 *   onTimeout: handleSessionExpired,
 *   isActive: !!user
 * });
 */
export function useSessionTimeout({
  timeoutMinutes = 15,
  onTimeout,
  isActive = true,
}: UseSessionTimeoutOptions): void {
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimeout = () => {
    // Clear existing timeout and inactivity timer
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Set new inactivity timeout
    inactivityTimerRef.current = setTimeout(() => {
      console.warn(
        `[Session Timeout] User inactive for ${timeoutMinutes} minutes. Logging out.`
      );
      onTimeout();
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    if (!isActive) {
      // Clean up if hook becomes inactive
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      return;
    }

    // Activity event listeners
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => {
      resetTimeout();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize timeout on mount
    resetTimeout();

    // Cleanup on unmount or when isActive changes
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });

      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isActive, timeoutMinutes, onTimeout]);
}
