import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Sparkles, ArrowLeft, User, Mail, Calendar, Save
} from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [joinedDate, setJoinedDate] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      setDisplayName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      setJoinedDate(
        new Date(user.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }
  }, [user, authLoading, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName },
      });

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-dreamy flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-dreamy flex items-center justify-center p-4">
      {/* Back button */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="text-rose animate-heartbeat fill-current" size={28} />
            <Sparkles className="text-amber animate-pulse-soft" size={20} />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
            Your <span className="text-gradient-romantic">Profile</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your account information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-card border border-rose-light/30">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <Avatar className="h-24 w-24 mb-4 ring-4 ring-rose-light/30">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={displayName || "User"} />
              <AvatarFallback className="bg-rose-light text-rose text-2xl">
                <User size={40} />
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar size={14} />
              Joined {joinedDate}
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-foreground">
                Display Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10 bg-background/50 border-rose-light/30 focus:border-rose"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="pl-10 bg-background/30 border-rose-light/30 cursor-not-allowed opacity-70"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <Button
              type="submit"
              variant="romantic"
              size="lg"
              className="w-full mt-6"
              disabled={isUpdating}
            >
              {isUpdating ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
