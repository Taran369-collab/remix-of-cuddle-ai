import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

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
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('security_logs').insert([{
        user_id: user?.id || null,
        user_email: user?.email || null,
        action,
        page_path: window.location.pathname + window.location.hash,
        user_agent: navigator.userAgent,
        success,
        details: (details || null) as Json,
      }]);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, []);

  return { logSecurityEvent };
};
