import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageTracker } from "@/components/PageTracker";
import CookieConsent from "@/components/CookieConsent";

// Eagerly load Index for LCP optimization
import Index from "./pages/Index";

// Lazy load all other routes for code splitting
const Auth = lazy(() => import("./pages/Auth"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminTeddyImages = lazy(() => import("./pages/AdminTeddyImages"));
const AdminLoveMessages = lazy(() => import("./pages/AdminLoveMessages"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminViewers = lazy(() => import("./pages/AdminViewers"));
const AdminDonations = lazy(() => import("./pages/AdminDonations"));
const AdminRevenue = lazy(() => import("./pages/AdminRevenue"));
const AdminDonationGoals = lazy(() => import("./pages/AdminDonationGoals"));
const AdminSecuritySettings = lazy(() => import("./pages/AdminSecuritySettings"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Donate = lazy(() => import("./pages/Donate"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <PageTracker />
            <CookieConsent />
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin-auth" element={<AdminAuth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/images" element={<AdminTeddyImages />} />
                <Route path="/admin/messages" element={<AdminLoveMessages />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/viewers" element={<AdminViewers />} />
                <Route path="/admin/donations" element={<AdminDonations />} />
                <Route path="/admin/revenue" element={<AdminRevenue />} />
                <Route path="/admin/donation-goals" element={<AdminDonationGoals />} />
                <Route path="/admin/security" element={<AdminSecuritySettings />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/donate" element={<Donate />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </HashRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
