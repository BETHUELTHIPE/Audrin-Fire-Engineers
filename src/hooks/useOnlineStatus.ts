import { useState, useEffect, useCallback } from 'react';

const SIMULATED_OFFLINE_KEY = 'audrin_simulated_offline';

export function useOnlineStatus() {
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isRealOnline, setIsRealOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsRealOnline(true);
    };

    const handleOffline = () => {
      setIsRealOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSimulatedOffline = useCallback((forceState?: boolean) => {
    setIsSimulatedOffline((prev) => {
      const next = typeof forceState === 'boolean' ? forceState : !prev;
      try {
        localStorage.setItem(SIMULATED_OFFLINE_KEY, next ? 'true' : 'false');
      } catch (err) {
        console.error('Failed to set simulated offline state', err);
      }
      // Dispatch custom event to alert sync services
      window.dispatchEvent(new CustomEvent('audrin-network-simulation-change', { detail: { isSimulatedOffline: next } }));
      return next;
    });
  }, []);

  const isOnline = isRealOnline && !isSimulatedOffline;

  return {
    isOnline,
    isRealOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
  };
}
