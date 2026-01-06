import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PasswordCheckResult {
  leaked: boolean;
  error?: string;
}

export const usePasswordCheck = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkPassword = async (password: string): Promise<PasswordCheckResult> => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-password", {
        body: { password },
      });

      if (error) {
        console.error("Password check error:", error);
        return { leaked: false, error: "Password check service unavailable" };
      }

      if (data?.error) {
        return { leaked: false, error: data.error };
      }

      return { leaked: data?.leaked ?? false };
    } catch (err) {
      console.error("Password check failed:", err);
      return { leaked: false, error: "Password check service unavailable" };
    } finally {
      setIsChecking(false);
    }
  };

  return { checkPassword, isChecking };
};
