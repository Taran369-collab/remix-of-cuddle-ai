import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthMFAEnrollResponse, AuthMFAVerifyResponse, Factor } from "@supabase/supabase-js";

interface TwoFactorState {
  isEnabled: boolean;
  isLoading: boolean;
  factors: Factor[];
  currentLevel: "aal1" | "aal2" | null;
}

interface EnrollmentData {
  id: string;
  qrCode: string;
  secret: string;
}

export const useTwoFactor = () => {
  const [state, setState] = useState<TwoFactorState>({
    isEnabled: false,
    isLoading: true,
    factors: [],
    currentLevel: null,
  });
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);

  const checkMFAStatus = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        console.error("Error listing MFA factors:", factorsError);
        return;
      }

      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (aalError) {
        console.error("Error getting AAL:", aalError);
        return;
      }

      const verifiedFactors = factorsData?.totp?.filter((f) => f.status === "verified") || [];
      
      setState({
        isEnabled: verifiedFactors.length > 0,
        isLoading: false,
        factors: verifiedFactors,
        currentLevel: aalData?.currentLevel || null,
      });
    } catch (error) {
      console.error("Error checking MFA status:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    checkMFAStatus();
  }, [checkMFAStatus]);

  const startEnrollment = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error }: AuthMFAEnrollResponse = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        setEnrollmentData({
          id: data.id,
          qrCode: data.totp.qr_code,
          secret: data.totp.secret,
        });
        return { success: true };
      }

      return { success: false, error: "Unknown error during enrollment" };
    } catch (error) {
      return { success: false, error: "Failed to start enrollment" };
    }
  };

  const verifyEnrollment = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!enrollmentData) {
      return { success: false, error: "No enrollment in progress" };
    }

    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollmentData.id,
      });

      if (challengeError) {
        return { success: false, error: challengeError.message };
      }

      const { error: verifyError }: AuthMFAVerifyResponse = await supabase.auth.mfa.verify({
        factorId: enrollmentData.id,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        return { success: false, error: verifyError.message };
      }

      setEnrollmentData(null);
      await checkMFAStatus();
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to verify code" };
    }
  };

  const cancelEnrollment = async (): Promise<void> => {
    if (enrollmentData) {
      // Unenroll the pending factor
      await supabase.auth.mfa.unenroll({ factorId: enrollmentData.id });
      setEnrollmentData(null);
    }
  };

  const disable2FA = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const factor = state.factors[0];
      if (!factor) {
        return { success: false, error: "No 2FA factor found" };
      }

      const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });

      if (error) {
        return { success: false, error: error.message };
      }

      await checkMFAStatus();
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to disable 2FA" };
    }
  };

  const verifyChallenge = async (
    factorId: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) {
        return { success: false, error: challengeError.message };
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) {
        return { success: false, error: verifyError.message };
      }

      await checkMFAStatus();
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to verify 2FA code" };
    }
  };

  return {
    ...state,
    enrollmentData,
    startEnrollment,
    verifyEnrollment,
    cancelEnrollment,
    disable2FA,
    verifyChallenge,
    refreshStatus: checkMFAStatus,
  };
};
