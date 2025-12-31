import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminCheckResult {
  isAdmin: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

export const useServerAdminCheck = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [serverAdminStatus, setServerAdminStatus] = useState<boolean | null>(null);

  const verifyAdminStatus = useCallback(async (): Promise<AdminCheckResult> => {
    setIsVerifying(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setServerAdminStatus(false);
        return { isAdmin: false, error: 'No active session' };
      }

      const { data, error } = await supabase.functions.invoke('verify-admin', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error verifying admin status:', error);
        setServerAdminStatus(false);
        return { isAdmin: false, error: error.message };
      }

      const isAdmin = data?.isAdmin === true;
      setServerAdminStatus(isAdmin);
      
      return {
        isAdmin,
        userId: data?.userId,
        email: data?.email,
      };
    } catch (err) {
      console.error('Failed to verify admin status:', err);
      setServerAdminStatus(false);
      return { isAdmin: false, error: 'Failed to verify admin status' };
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return {
    verifyAdminStatus,
    isVerifying,
    serverAdminStatus,
  };
};