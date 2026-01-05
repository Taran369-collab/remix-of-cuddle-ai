import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Heart, ArrowLeft, Users, Loader2, User, Shield, Calendar, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  is_admin?: boolean;
}

const AdminUsers = () => {
  const { isAdmin, isLoading: authLoading, user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
      return;
    }
    fetchUsers();
  }, [authLoading, isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      // Use edge function to fetch users with emails (admin only, secure)
      const { data, error } = await supabase.functions.invoke("get-users-with-emails");

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAdmin = async (userProfile: UserProfile) => {
    // Prevent removing your own admin role
    if (userProfile.user_id === currentUser?.id) {
      toast.error("You cannot modify your own admin status");
      return;
    }

    setTogglingUserId(userProfile.user_id);

    try {
      if (userProfile.is_admin) {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userProfile.user_id)
          .eq("role", "admin");

        if (error) throw error;
        
        toast.success(`Admin role revoked from ${userProfile.email}`);
      } else {
        // Grant admin role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userProfile.user_id, role: "admin" });

        if (error) throw error;
        
        toast.success(`Admin role granted to ${userProfile.email}`);
      }

      // Update local state
      setUsers(prev => 
        prev.map(u => 
          u.user_id === userProfile.user_id 
            ? { ...u, is_admin: !u.is_admin } 
            : u
        )
      );
    } catch (err: any) {
      console.error("Toggle admin error:", err);
      toast.error(err.message || "Failed to update admin status");
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleDeleteUser = async (userProfile: UserProfile) => {
    // Prevent deleting yourself
    if (userProfile.user_id === currentUser?.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${userProfile.email}? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userProfile.user_id);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("delete-user", {
        body: { userId: userProfile.user_id },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to delete user");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success(`User ${userProfile.email} deleted successfully`);
      
      // Remove from local state
      setUsers(prev => prev.filter(u => u.user_id !== userProfile.user_id));
    } catch (err: any) {
      console.error("Delete user error:", err);
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dreamy flex items-center justify-center">
        <Loader2 className="animate-spin text-rose" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dreamy">
      {/* Header */}
      <header className="bg-card/60 backdrop-blur-sm border-b border-rose-light/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <ArrowLeft size={18} className="mr-1" />
              Back
            </Button>
            <Heart className="text-rose fill-current" size={24} />
            <span className="font-display text-xl text-foreground">
              User Management
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-rose-light/20 text-center">
            <p className="text-2xl font-display text-rose">{users.length}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-rose-light/20 text-center">
            <p className="text-2xl font-display text-rose">
              {users.filter(u => u.is_admin).length}
            </p>
            <p className="text-sm text-muted-foreground">Admins</p>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-rose-light/20 text-center col-span-2 md:col-span-1">
            <p className="text-2xl font-display text-rose">
              {users.filter(u => !u.is_admin).length}
            </p>
            <p className="text-sm text-muted-foreground">Regular Users</p>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-light/20">
          <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <Users size={20} className="text-rose" />
            Registered Users
          </h2>

          {users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>No users registered yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const isCurrentUser = user.user_id === currentUser?.id;
                const isToggling = togglingUserId === user.user_id;
                const isDeleting = deletingUserId === user.user_id;

                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-rose-light/20"
                  >
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.email || "User"} />
                      <AvatarFallback className="bg-rose-light text-rose">
                        <User size={20} />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground truncate">
                          {user.email || "No email"}
                        </p>
                        {isCurrentUser && (
                          <span className="shrink-0 text-xs text-muted-foreground">(you)</span>
                        )}
                        {user.is_admin && (
                          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-rose/10 text-rose text-xs font-medium rounded-full">
                            <Shield size={12} />
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        <span>Joined {format(new Date(user.created_at), "MMM d, yyyy")}</span>
                      </div>
                    </div>

                    {/* Admin Toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Label 
                        htmlFor={`admin-toggle-${user.id}`} 
                        className="text-xs text-muted-foreground hidden sm:block"
                      >
                        Admin
                      </Label>
                      <Switch
                        id={`admin-toggle-${user.id}`}
                        checked={user.is_admin}
                        onCheckedChange={() => handleToggleAdmin(user)}
                        disabled={isCurrentUser || isToggling || isDeleting}
                      />
                      {isToggling && (
                        <Loader2 className="animate-spin text-rose" size={16} />
                      )}
                    </div>

                    {/* Delete Button */}
                    {!isCurrentUser && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        disabled={isDeleting || isToggling}
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {isDeleting ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;