import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useServerAdminCheck } from "@/hooks/useServerAdminCheck";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, ShieldCheck, ShieldAlert, ExternalLink, CheckCircle2 } from "lucide-react";

const AdminSecuritySettings = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { verifyAdminStatus, isVerifying } = useServerAdminCheck();
  const [serverVerified, setServerVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;
    
    const verify = async () => {
      if (user) {
        const result = await verifyAdminStatus();
        setServerVerified(result.isAdmin);
      } else {
        setServerVerified(false);
      }
    };
    
    verify();
  }, [user, isLoading, verifyAdminStatus]);

  if (isLoading || isVerifying || serverVerified === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!serverVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-2" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const securityItems = [
    {
      id: "rls_policies",
      name: "Row Level Security (RLS)",
      description: "All database tables have RLS enabled with proper policies",
      status: "enabled",
      severity: "success",
    },
    {
      id: "storage_policies",
      name: "Storage Bucket Policies",
      description: "Avatar and teddy-images buckets have proper access controls",
      status: "enabled",
      severity: "success",
    },
    {
      id: "auth_functions",
      name: "Secure Auth Functions",
      description: "Admin verification uses server-side Edge Functions",
      status: "enabled",
      severity: "success",
    },
    {
      id: "security_definer",
      name: "SECURITY DEFINER Functions",
      description: "All privileged functions have proper safeguards (advisory locks, role checks)",
      status: "reviewed",
      severity: "success",
    },
    {
      id: "leaked_password",
      name: "Leaked Password Protection",
      description: "Prevents users from using passwords found in data breaches",
      status: "configure",
      severity: "info",
      action: "Configure in Cloud settings under Authentication",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Helmet>
        <title>Security Settings - Admin | Bear Love</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Security Settings
            </h1>
            <p className="text-muted-foreground">Manage security configurations for your application</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                Security Status Overview
              </CardTitle>
              <CardDescription>
                Current security posture of your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge
                          variant={
                            item.severity === "success"
                              ? "default"
                              : item.severity === "info"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            item.severity === "success"
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : ""
                          }
                        >
                          {item.status === "enabled" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      {item.action && (
                        <p className="text-sm text-primary mt-2 flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {item.action}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>
                Best practices for maintaining application security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>All database tables have Row Level Security enabled</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Admin verification uses server-side Edge Functions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Storage buckets have proper upload/access policies</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Account deletion uses secure self-service Edge Function</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSecuritySettings;
