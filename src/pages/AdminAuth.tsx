import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Lock, Mail, ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const { user, isAdmin, signIn, signUp, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Check if any admin exists in the system
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        // Try to call bootstrap - if it fails with "already exists", an admin exists
        // This is a safe way to check without exposing user_roles data
        const { error } = await supabase.rpc("bootstrap_first_admin");
        if (error) {
          if (error.message.includes("already exists") || error.message.includes("must be signed in")) {
            setAdminExists(true);
          } else {
            setAdminExists(false);
          }
        } else {
          // If bootstrap succeeded, we just made current user admin
          setAdminExists(true);
          toast.success("You are now an admin!");
          window.location.href = "/#/admin";
        }
      } catch {
        // If we're not signed in, we can't determine yet
        setAdminExists(null);
      }
    };

    if (user) {
      checkAdminExists();
    } else {
      // For non-authenticated users, we show the login form
      // They'll see the bootstrap option after signing in if no admin exists
      setAdminExists(null);
    }
  }, [user]);

  // Redirect authenticated admins to admin dashboard
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleBootstrapAdmin = async () => {
    setIsBootstrapping(true);
    try {
      const { error } = await supabase.rpc("bootstrap_first_admin");
      if (error) {
        if (error.message.includes("already exists")) {
          toast.error("An admin already exists. Contact them for access.");
          setAdminExists(true);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("You are now an admin!");
        window.location.href = "/#/admin";
      }
    } catch {
      toast.error("Failed to set up admin role");
    } finally {
      setIsBootstrapping(false);
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
        } else {
          toast.success("Welcome back!");
          // After login, useEffect will check admin status and redirect accordingly
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created! You can now become admin if you're the first.");
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
            <Shield className="text-rose" size={28} />
            <Sparkles className="text-amber animate-pulse-soft" size={20} />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
            Admin <span className="text-gradient-romantic">Portal</span>
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? "Sign in to access admin features" : "Create your account"}
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-card border border-rose-light/30">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Lock className="text-rose" size={20} />
            <span className="font-medium text-foreground">Admin Access</span>
          </div>

          {/* Show bootstrap option for signed-in users who aren't admin yet, if no admin exists */}
          {user && !isAdmin && adminExists === false && (
            <div className="mb-6 p-4 bg-secondary/50 rounded-2xl border border-rose-light/20">
              <p className="text-sm text-muted-foreground mb-3 text-center">
                No admin exists yet. As the first user, you can become admin:
              </p>
              <Button
                onClick={handleBootstrapAdmin}
                variant="romantic"
                size="lg"
                className="w-full"
                disabled={isBootstrapping}
              >
                {isBootstrapping ? (
                  "Setting up..."
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Become First Admin
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Show info for signed-in non-admin users when admin already exists */}
          {user && !isAdmin && adminExists === true && (
            <div className="mb-6 p-4 bg-secondary/50 rounded-2xl border border-rose-light/20">
              <p className="text-sm text-muted-foreground text-center">
                You're signed in but don't have admin privileges. Contact an existing admin to get access.
              </p>
            </div>
          )}

          {/* Login/Signup form for non-authenticated users */}
          {!user && (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
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
                      <Lock className="mr-2 h-4 w-4" />
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

export default AdminAuth;
