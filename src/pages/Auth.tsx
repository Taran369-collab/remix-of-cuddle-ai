import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Sparkles, Lock, Mail, ArrowLeft, User, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Factor } from "@supabase/supabase-js";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, signIn, signUp, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 2FA state
  const [show2FAChallenge, setShow2FAChallenge] = useState(false);
  const [mfaFactors, setMfaFactors] = useState<Factor[]>([]);
  const [totpCode, setTotpCode] = useState("");
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Redirect authenticated users to home (only if fully authenticated)
  useEffect(() => {
    if (!authLoading && user && !show2FAChallenge) {
      navigate("/");
    }
  }, [user, authLoading, navigate, show2FAChallenge]);

  const checkMFARequirement = async () => {
    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    if (aalError) {
      console.error("Error checking AAL:", aalError);
      return false;
    }

    // If nextLevel is aal2 but currentLevel is aal1, user needs to verify 2FA
    if (aalData?.nextLevel === "aal2" && aalData?.currentLevel === "aal1") {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const verifiedFactors = factorsData?.totp?.filter((f) => f.status === "verified") || [];
      
      if (verifiedFactors.length > 0) {
        setMfaFactors(verifiedFactors);
        setShow2FAChallenge(true);
        return true;
      }
    }
    
    return false;
  };

  const handleVerify2FA = async () => {
    if (totpCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsVerifying2FA(true);

    try {
      const factor = mfaFactors[0];
      
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factor.id,
      });

      if (challengeError) {
        toast.error(challengeError.message);
        setIsVerifying2FA(false);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challengeData.id,
        code: totpCode,
      });

      if (verifyError) {
        toast.error("Invalid verification code");
        setIsVerifying2FA(false);
        return;
      }

      // Save or remove email based on remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      toast.success("Welcome back!");
      setShow2FAChallenge(false);
      setTotpCode("");
      navigate("/");
    } catch (error) {
      toast.error("Failed to verify 2FA code");
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        toast.error(error.message);
      }
    } catch {
      toast.error("Failed to sign in with Google");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset link sent! Check your email.");
        setShowForgotPassword(false);
      }
    } catch {
      toast.error("Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }

        // Check if 2FA is required
        const needs2FA = await checkMFARequirement();
        if (needs2FA) {
          setIsLoading(false);
          return;
        }

        // Save or remove email based on remember me
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        toast.success("Welcome back!");
        navigate("/");
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created successfully!");
          navigate("/");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dreamy flex items-center justify-center p-4">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="text-rose animate-heartbeat fill-current" size={28} />
            <Sparkles className="text-amber animate-pulse-soft" size={20} />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
            Bear <span className="text-gradient-romantic">Love</span>
          </h1>
          <p className="text-muted-foreground">
            {show2FAChallenge
              ? "Enter your verification code"
              : showForgotPassword 
                ? "Reset your password" 
                : isLogin 
                  ? "Welcome back!" 
                  : "Create your account"}
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-card border border-rose-light/30">
          <div className="flex items-center justify-center gap-2 mb-6">
            {show2FAChallenge ? (
              <Shield className="text-rose" size={20} />
            ) : (
              <User className="text-rose" size={20} />
            )}
            <span className="font-medium text-foreground">
              {show2FAChallenge
                ? "Two-Factor Authentication"
                : showForgotPassword 
                  ? "Password Reset" 
                  : "User Account"}
            </span>
          </div>

          {show2FAChallenge ? (
            // 2FA Challenge Form
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Enter the 6-digit code from your authenticator app.
              </p>

              <div className="space-y-2">
                <Label htmlFor="totp-code" className="text-foreground">
                  Verification Code
                </Label>
                <Input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-lg tracking-widest bg-background/50 border-rose-light/30 focus:border-rose"
                  autoFocus
                />
              </div>

              <Button
                variant="romantic"
                size="lg"
                className="w-full mt-6"
                onClick={handleVerify2FA}
                disabled={isVerifying2FA || totpCode.length !== 6}
              >
                {isVerifying2FA ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify & Sign In
                  </>
                )}
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShow2FAChallenge(false);
                    setTotpCode("");
                    supabase.auth.signOut();
                  }}
                  className="text-sm text-muted-foreground hover:text-rose transition-colors"
                >
                  Use a different account
                </button>
              </div>
            </div>
          ) : showForgotPassword ? (
            // Forgot Password Form
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 border-rose-light/30 focus:border-rose"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="romantic"
                size="lg"
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-sm text-muted-foreground hover:text-rose transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            // Login/Signup Form
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background/50 border-rose-light/30 focus:border-rose"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-rose-light/30 focus:border-rose"
                      required
                    />
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        Remember me
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-rose hover:text-rose/80 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="romantic"
                  size="lg"
                  className="w-full mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Please wait..."
                  ) : isLogin ? (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-rose-light/30"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-rose-light/30 hover:bg-rose-light/10"
                onClick={handleGoogleSignIn}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-rose transition-colors"
                >
                  {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
