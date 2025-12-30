import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Bell, BellOff, Download, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { Helmet } from "react-helmet-async";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem("notifications") !== "false";
  });
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleThemeChange = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
    document.documentElement.classList.toggle("dark", checked);
    toast({
      title: "Theme updated",
      description: `Switched to ${checked ? "dark" : "light"} mode`,
    });
  };

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem("notifications", String(checked));
    toast({
      title: "Notifications updated",
      description: checked ? "Notifications enabled" : "Notifications disabled",
    });
  };

  const handleExportData = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to export your data",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const { data: loveResults, error } = await supabase
        .from("love_results")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          email: user.email,
          createdAt: user.created_at,
        },
        loveResults: loveResults || [],
        preferences: {
          theme: darkMode ? "dark" : "light",
          notifications,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bear-love-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your data has been downloaded successfully",
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // Delete user's love results
      await supabase.from("love_results").delete().eq("user_id", user.id);
      
      // Delete user's profile
      await supabase.from("profiles").delete().eq("user_id", user.id);

      // Call edge function to delete auth user
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId: user.id },
      });

      if (error) throw error;

      // Clear local storage
      localStorage.clear();
      
      // Sign out
      await signOut();

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      });

      navigate("/");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearLocalData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <>
      <Helmet>
        <title>Settings | Bear Love</title>
        <meta name="description" content="Manage your Bear Love preferences and account settings" />
        <link rel="canonical" href={`${window.location.origin}/#/settings`} />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-rose-light/30 via-background to-love-light/20">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-display font-bold text-foreground mb-8">Settings</h1>

          {/* Appearance */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                Appearance
              </CardTitle>
              <CardDescription>Customize how Bear Love looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="flex flex-col gap-1">
                  <span>Dark Mode</span>
                  <span className="text-sm text-muted-foreground">
                    Use dark theme for the app
                  </span>
                </Label>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={handleThemeChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {notifications ? <Bell size={20} /> : <BellOff size={20} />}
                Notifications
              </CardTitle>
              <CardDescription>Manage notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="flex flex-col gap-1">
                  <span>Enable Notifications</span>
                  <span className="text-sm text-muted-foreground">
                    Receive updates and reminders
                  </span>
                </Label>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={handleNotificationsChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download size={20} />
                Data Management
              </CardTitle>
              <CardDescription>Export or manage your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Export Your Data</span>
                  <span className="text-sm text-muted-foreground">
                    Download all your love results and preferences
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  disabled={isExporting || !user}
                >
                  <Download size={16} className="mr-2" />
                  {isExporting ? "Exporting..." : "Export"}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Clear Local Data</span>
                  <span className="text-sm text-muted-foreground">
                    Reset app state and cached data
                  </span>
                </div>
                <Button variant="outline" onClick={handleClearLocalData}>
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {user && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 size={20} />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">Sign Out</span>
                    <span className="text-sm text-muted-foreground">
                      Log out of your account
                    </span>
                  </div>
                  <Button variant="outline" onClick={signOut}>
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-destructive">Delete Account</span>
                    <span className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isDeleting}>
                        <Trash2 size={16} className="mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Delete Account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}

          {!user && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Sign in to access more settings and manage your account
                </p>
                <Button onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Settings;
