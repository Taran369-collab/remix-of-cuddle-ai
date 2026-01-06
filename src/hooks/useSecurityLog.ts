import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type SecurityAction = 
  | 'admin_access_attempt'
  | 'admin_access_granted'
  | 'admin_access_denied'
  | 'sign_in'
  | 'sign_out';

export const useSecurityLog = () => {
  const logSecurityEvent = useCallback(async (
    action: SecurityAction,
    success: boolean,
    details?: Record<string, string | number | boolean>
  ) => {
    try {
      // Get auth token if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Call Edge Function for server-side logging
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-security-event`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action,
          success,
          details: details || null,
          page_path: window.location.pathname + window.location.hash,
        }),
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, []);

  return { logSecurityEvent };
};
