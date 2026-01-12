import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const APP_VERSION = '1.0.0';
const MIN_SUPPORTED_VERSION = '1.0.0';
const VERSION_CHECK_KEY = 'godavari_version';

export const useAppHealth = () => {
  const { toast } = useToast();
  const lastHealthCheck = useRef<number>(0);

  // Check if app version is supported
  const checkVersion = useCallback(() => {
    const savedVersion = localStorage.getItem(VERSION_CHECK_KEY);
    
    if (savedVersion && savedVersion !== APP_VERSION) {
      // Version changed - might need migration
      console.log(`App updated from ${savedVersion} to ${APP_VERSION}`);
    }
    
    localStorage.setItem(VERSION_CHECK_KEY, APP_VERSION);

    // Compare versions
    const compare = (v1: string, v2: string) => {
      const parts1 = v1.split('.').map(Number);
      const parts2 = v2.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if (parts1[i] > parts2[i]) return 1;
        if (parts1[i] < parts2[i]) return -1;
      }
      return 0;
    };

    if (compare(APP_VERSION, MIN_SUPPORTED_VERSION) < 0) {
      return { isOutdated: true, currentVersion: APP_VERSION, minVersion: MIN_SUPPORTED_VERSION };
    }

    return { isOutdated: false, currentVersion: APP_VERSION };
  }, []);

  // Perform health check (refresh data, check connections)
  const performHealthCheck = useCallback(async () => {
    const now = Date.now();
    
    // Debounce - don't check more than once per minute
    if (now - lastHealthCheck.current < 60000) return;
    lastHealthCheck.current = now;

    try {
      // Check Supabase connection
      if (navigator.onLine) {
        const { error } = await supabase.from('menu_items').select('id').limit(1);
        if (error) {
          console.warn('Health check: Database connection issue', error);
        }
      }
    } catch (error) {
      console.warn('Health check failed:', error);
    }
  }, []);

  // Handle app resume from background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('App resumed - performing health check');
        performHealthCheck();
      }
    };

    const handleFocus = () => {
      performHealthCheck();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [performHealthCheck]);

  // Check session validity
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return false;
      }

      // Check if token is expired
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      if (expiresAt < Date.now()) {
        // Try to refresh
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    checkVersion,
    performHealthCheck,
    checkSession,
    appVersion: APP_VERSION,
  };
};
