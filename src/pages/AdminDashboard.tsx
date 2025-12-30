import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Shield, LogOut, Image, MessageSquare, Users, BarChart3, Eye } from "lucide-react";
import { useSecurityLog } from "@/hooks/useSecurityLog";

const AdminDashboard = () => {
  const { user, signOut, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { logSecurityEvent } = useSecurityLog();
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    if (isLoading || hasLoggedRef.current) return;
    
    hasLoggedRef.current = true;
    
    if (isAdmin) {
      logSecurityEvent('admin_access_granted', true, { page: 'dashboard' });
    } else {
      logSecurityEvent('admin_access_denied', false, { page: 'dashboard' });
    }
  }, [isAdmin, isLoading, logSecurityEvent]);

  const handleSignOut = async () => {
    logSecurityEvent('sign_out', true);
    await signOut();
    navigate("/");
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-dreamy flex items-center justify-center p-4">
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-card border border-rose-light/30 text-center max-w-md">
          <Shield className="mx-auto text-rose mb-4" size={48} />
          <h1 className="font-display text-2xl text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges to access this page.
          </p>
          <Button variant="romantic" onClick={() => navigate("/")}>
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dreamy">
      {/* Header */}
      <header className="bg-card/60 backdrop-blur-sm border-b border-rose-light/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="text-rose fill-current" size={24} />
            <span className="font-display text-xl text-foreground">
              Bear <span className="text-gradient-romantic">Love</span>
            </span>
            <span className="px-2 py-1 bg-rose/10 text-rose text-xs font-medium rounded-full">
              Admin
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              View Site
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
            Welcome, Admin!
          </h1>
          <p className="text-muted-foreground">
            Manage your Bear Love website from here.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Manage Images */}
          <Link to="/admin/images" className="block">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-light/20 shadow-romantic hover:shadow-glow transition-all duration-300 h-full">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <Image className="text-rose" size={24} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">Teddy Images</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload and manage teddy bear couple images.
              </p>
              <Button variant="romantic" size="sm" className="w-full">
                Manage Images
              </Button>
            </div>
          </Link>

          {/* Manage Messages */}
          <Link to="/admin/messages" className="block">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-light/20 shadow-romantic hover:shadow-glow transition-all duration-300 h-full">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <MessageSquare className="text-rose" size={24} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">Love Messages</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Edit and customize the romantic messages.
              </p>
              <Button variant="romantic" size="sm" className="w-full">
                Manage Messages
              </Button>
            </div>
          </Link>

          {/* User Management */}
          <Link to="/admin/users" className="block">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-light/20 shadow-romantic hover:shadow-glow transition-all duration-300 h-full">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <Users className="text-rose" size={24} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">User Management</h3>
              <p className="text-sm text-muted-foreground mb-4">
                View registered users and manage roles.
              </p>
              <Button variant="romantic" size="sm" className="w-full">
                View Users
              </Button>
            </div>
          </Link>

          {/* Analytics */}
          <Link to="/admin/analytics" className="block">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-light/20 shadow-romantic hover:shadow-glow transition-all duration-300 h-full">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <BarChart3 className="text-rose" size={24} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Track love calculations and usage stats.
              </p>
              <Button variant="romantic" size="sm" className="w-full">
                View Analytics
              </Button>
            </div>
          </Link>

          {/* Viewer Analytics */}
          <Link to="/admin/viewers" className="block">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-romantic hover:shadow-glow transition-all duration-300 h-full">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                <Eye className="text-green-600" size={24} />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">Viewer Stats</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Track page views and generate income insights.
              </p>
              <Button variant="outline" size="sm" className="w-full border-green-500/30 text-green-600 hover:bg-green-500/10">
                View Stats
              </Button>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
