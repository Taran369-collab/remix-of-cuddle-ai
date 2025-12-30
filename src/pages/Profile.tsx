import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Sparkles, ArrowLeft, User, Mail, Calendar, Save, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .limit(1);

      if (error) throw error;

      const avatar = data?.[0]?.avatar_url ?? user.user_metadata?.avatar_url ?? null;
      setAvatarUrl(avatar);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error fetching profile:", error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Create unique file path
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add cache-busting query param
      const avatarUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      // Update profile in database (create row if it doesn't exist)
      const { data: updatedRows, error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrlWithTimestamp })
        .eq("user_id", user.id)
        .select("user_id");

      if (updateError) throw updateError;

      if (!updatedRows || updatedRows.length === 0) {
        const { error: insertError } = await supabase.from("profiles").insert({
          user_id: user.id,
          email: user.email ?? null,
          avatar_url: avatarUrlWithTimestamp,
        });

        if (insertError) throw insertError;
      }

      setAvatarUrl(avatarUrlWithTimestamp);
      toast.success("Avatar updated successfully!");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
      if (import.meta.env.DEV) console.error("Error updating profile:", error);
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
            <div className="relative group">
              <Avatar className="h-24 w-24 mb-4 ring-4 ring-rose-light/30">
                <AvatarImage src={avatarUrl || user.user_metadata?.avatar_url} alt={displayName || "User"} />
                <AvatarFallback className="bg-rose-light text-rose text-2xl">
                  <User size={40} />
                </AvatarFallback>
              </Avatar>
              
              {/* Upload overlay */}
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute inset-0 mb-4 flex items-center justify-center bg-foreground/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-6 w-6 text-background animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-background" />
                )}
              </button>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              Click to upload a new photo
            </p>
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
