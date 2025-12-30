import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Heart, Sparkles, ArrowLeft, User, Mail, Calendar, Save, Camera, Loader2, Lock, Phone, FileText, Trash2, AlertTriangle, Download, Bell } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface NotificationPreferences {
  marketing_emails: boolean;
  love_result_notifications: boolean;
  weekly_digest: boolean;
  security_alerts: boolean;
}


const Profile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [joinedDate, setJoinedDate] = useState<string>("");
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Delete account state
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Export data state
  const [isExportingData, setIsExportingData] = useState(false);
  
  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    marketing_emails: true,
    love_result_notifications: true,
    weekly_digest: false,
    security_alerts: true,
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      setDisplayName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      setBio(user.user_metadata?.bio || "");
      setPhone(user.user_metadata?.phone || "");
      setJoinedDate(
        new Date(user.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
      fetchProfile();
      fetchNotificationPreferences();
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

  const fetchNotificationPreferences = async () => {
    if (!user) return;
    
    setIsLoadingNotifications(true);
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setNotificationPrefs({
          marketing_emails: data[0].marketing_emails,
          love_result_notifications: data[0].love_result_notifications,
          weekly_digest: data[0].weekly_digest,
          security_alerts: data[0].security_alerts,
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error fetching notification preferences:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const saveNotificationPreferences = async () => {
    if (!user) return;
    
    setIsSavingNotifications(true);
    try {
      const { data: existing } = await supabase
        .from("notification_preferences")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from("notification_preferences")
          .update({
            marketing_emails: notificationPrefs.marketing_emails,
            love_result_notifications: notificationPrefs.love_result_notifications,
            weekly_digest: notificationPrefs.weekly_digest,
            security_alerts: notificationPrefs.security_alerts,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notification_preferences")
          .insert({
            user_id: user.id,
            marketing_emails: notificationPrefs.marketing_emails,
            love_result_notifications: notificationPrefs.love_result_notifications,
            weekly_digest: notificationPrefs.weekly_digest,
            security_alerts: notificationPrefs.security_alerts,
          });

        if (error) throw error;
      }

      toast.success("Notification preferences saved!");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error saving notification preferences:", error);
      toast.error("Failed to save notification preferences");
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

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
        data: { 
          full_name: displayName,
          bio: bio,
          phone: phone,
        },
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = passwordSchema.safeParse({ currentPassword, newPassword, confirmPassword });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsChangingPassword(true);

    try {
      // First verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        setIsChangingPassword(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    
    setIsExportingData(true);
    
    try {
      // Fetch all user data from various tables
      const [profileResult, loveResultsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id),
        supabase.from("love_results").select("*").eq("user_id", user.id),
      ]);
      
      const exportData = {
        exportedAt: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
          displayName: user.user_metadata?.full_name || null,
          bio: user.user_metadata?.bio || null,
          phone: user.user_metadata?.phone || null,
        },
        profile: profileResult.data || [],
        loveResults: loveResultsResult.data || [],
      };
      
      // Create and download the JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bear-love-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Your data has been exported successfully!");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error exporting data:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setIsExportingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== email) {
      toast.error("Email does not match. Please enter your email correctly.");
      return;
    }

    setIsDeletingAccount(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to delete your account");
        return;
      }

      const response = await supabase.functions.invoke("delete-own-account", {
        body: { confirmEmail: deleteConfirmEmail },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to delete account");
      }

      toast.success("Your account has been deleted. Goodbye!");
      
      // Sign out and redirect
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteDialog(false);
      setDeleteConfirmEmail("");
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
    <div className="min-h-screen bg-gradient-dreamy py-8 px-4">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <div className="w-full max-w-2xl mx-auto mt-12">
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
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-card border border-rose-light/30">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <Avatar className="h-24 w-24 mb-4 ring-4 ring-rose-light/30">
                <AvatarImage src={avatarUrl || user.user_metadata?.avatar_url} alt={displayName || "User"} />
                <AvatarFallback className="bg-rose-light text-rose text-2xl">
                  <User size={40} />
                </AvatarFallback>
              </Avatar>
              
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
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              Click to upload a new photo (max 2MB)
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar size={14} />
              Joined {joinedDate}
            </p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="danger" className="text-destructive data-[state=active]:text-destructive">Danger</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
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

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 bg-background/50 border-rose-light/30 focus:border-rose"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-foreground">
                    Bio
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-muted-foreground" size={18} />
                    <Textarea
                      id="bio"
                      placeholder="Tell us a little about yourself..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="pl-10 bg-background/50 border-rose-light/30 focus:border-rose min-h-[100px] resize-none"
                      maxLength={200}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {bio.length}/200 characters
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
            </TabsContent>

            <TabsContent value="security">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Change your password to keep your account secure.
                </p>

                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-foreground">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-rose-light/30 focus:border-rose"
                      required
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-rose-light/30 focus:border-rose"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword" className="text-foreground">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    "Changing Password..."
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="space-y-6">
                <div className="flex items-start gap-3 mb-4">
                  <Bell className="text-rose mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose which emails you'd like to receive from us.
                    </p>
                  </div>
                </div>

                {isLoadingNotifications ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing" className="text-foreground font-medium">
                          Marketing Emails
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about new features and promotions.
                        </p>
                      </div>
                      <Switch
                        id="marketing"
                        checked={notificationPrefs.marketing_emails}
                        onCheckedChange={(checked) =>
                          setNotificationPrefs((prev) => ({ ...prev, marketing_emails: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                      <div className="space-y-0.5">
                        <Label htmlFor="loveResults" className="text-foreground font-medium">
                          Love Result Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when you receive new love compatibility results.
                        </p>
                      </div>
                      <Switch
                        id="loveResults"
                        checked={notificationPrefs.love_result_notifications}
                        onCheckedChange={(checked) =>
                          setNotificationPrefs((prev) => ({ ...prev, love_result_notifications: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                      <div className="space-y-0.5">
                        <Label htmlFor="weeklyDigest" className="text-foreground font-medium">
                          Weekly Digest
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a weekly summary of your activity and love tips.
                        </p>
                      </div>
                      <Switch
                        id="weeklyDigest"
                        checked={notificationPrefs.weekly_digest}
                        onCheckedChange={(checked) =>
                          setNotificationPrefs((prev) => ({ ...prev, weekly_digest: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                      <div className="space-y-0.5">
                        <Label htmlFor="securityAlerts" className="text-foreground font-medium">
                          Security Alerts
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Important notifications about your account security.
                        </p>
                      </div>
                      <Switch
                        id="securityAlerts"
                        checked={notificationPrefs.security_alerts}
                        onCheckedChange={(checked) =>
                          setNotificationPrefs((prev) => ({ ...prev, security_alerts: checked }))
                        }
                      />
                    </div>

                    <Button
                      variant="romantic"
                      size="lg"
                      className="w-full mt-6"
                      onClick={saveNotificationPreferences}
                      disabled={isSavingNotifications}
                    >
                      {isSavingNotifications ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="danger">
              <div className="space-y-6">
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-destructive mt-0.5" size={20} />
                    <div>
                      <h3 className="font-semibold text-destructive mb-1">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground">
                        Actions here are permanent and cannot be undone. Please proceed with caution.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Export Data Section */}
                <div className="p-6 border border-border rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a copy of all your data including your profile, love results, and account information.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleExportData}
                    disabled={isExportingData}
                  >
                    {isExportingData ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download My Data
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-6 border border-destructive/30 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be reversed.
                  </p>

                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete My Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle size={20} />
                          Delete Account Permanently?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                          <p>
                            This will permanently delete your account and all your data. This action cannot be undone.
                          </p>
                          <div className="space-y-2">
                            <Label htmlFor="confirmEmail" className="text-foreground">
                              Type your email to confirm: <strong>{email}</strong>
                            </Label>
                            <Input
                              id="confirmEmail"
                              type="email"
                              placeholder="Enter your email"
                              value={deleteConfirmEmail}
                              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                              className="bg-background"
                            />
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmEmail("")}>
                          Cancel
                        </AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={isDeletingAccount || deleteConfirmEmail !== email}
                        >
                          {isDeletingAccount ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete Forever"
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
