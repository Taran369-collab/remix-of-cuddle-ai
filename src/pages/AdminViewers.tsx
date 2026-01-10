import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ArrowLeft, Eye, Users, Globe, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useSecurityLog } from "@/hooks/useSecurityLog";

interface PageView {
  id: string;
  page_path: string;
  user_agent: string | null;
  referrer: string | null;
  session_id: string | null;
  user_id: string | null;
  created_at: string;
}

interface DailyViews {
  date: string;
  views: number;
  uniqueSessions: number;
}

const AdminViewers = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { logSecurityEvent } = useSecurityLog();
  const hasLoggedRef = useRef(false);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date>(new Date());

  useEffect(() => {
    if (authLoading || hasLoggedRef.current) return;
    
    hasLoggedRef.current = true;
    
    if (isAdmin) {
      logSecurityEvent('admin_access_granted', true, { page: 'viewers' });
    } else {
      logSecurityEvent('admin_access_denied', false, { page: 'viewers' });
      navigate("/admin");
    }
  }, [isAdmin, authLoading, navigate, logSecurityEvent]);

  useEffect(() => {
    const fetchPageViews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("page_views")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching page views:", error);
      } else {
        setPageViews(data || []);
      }
      setLoading(false);
    };

    if (isAdmin) {
      fetchPageViews();
    }
  }, [isAdmin]);

  const filteredViews = useMemo(() => {
    return pageViews.filter((view) => {
      const viewDate = new Date(view.created_at);
      return isWithinInterval(viewDate, {
        start: startOfDay(dateFrom),
        end: endOfDay(dateTo),
      });
    });
  }, [pageViews, dateFrom, dateTo]);

  const [realRevenue, setRealRevenue] = useState<number>(0);

  useEffect(() => {
    const fetchRevenue = async () => {
      const { data } = await supabase
        .from("wallet_transactions")
        .select("amount_usd");
      if (data) {
        const total = data.reduce((sum, tx) => sum + (tx.amount_usd || 0), 0);
        setRealRevenue(total);
      }
    };
    if (isAdmin) fetchRevenue();
  }, [isAdmin]);

  const stats = useMemo(() => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const weekStart = subDays(today, 7);
    const monthStart = subDays(today, 30);

    const todayViews = filteredViews.filter(
      (v) => new Date(v.created_at) >= todayStart
    ).length;

    const weekViews = filteredViews.filter(
      (v) => new Date(v.created_at) >= weekStart
    ).length;

    const monthViews = filteredViews.filter(
      (v) => new Date(v.created_at) >= monthStart
    ).length;

    const uniqueSessions = new Set(filteredViews.map((v) => v.session_id)).size;
    const uniqueUsers = new Set(filteredViews.filter((v) => v.user_id).map((v) => v.user_id)).size;

    return {
      total: filteredViews.length,
      today: todayViews,
      week: weekViews,
      month: monthViews,
      uniqueSessions,
      uniqueUsers,
    };
  }, [filteredViews]);

  const dailyData = useMemo((): DailyViews[] => {
    const grouped: Record<string, { views: number; sessions: Set<string> }> = {};

    filteredViews.forEach((view) => {
      const date = format(new Date(view.created_at), "yyyy-MM-dd");
      if (!grouped[date]) {
        grouped[date] = { views: 0, sessions: new Set() };
      }
      grouped[date].views++;
      if (view.session_id) {
        grouped[date].sessions.add(view.session_id);
      }
    });

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date: format(new Date(date), "MMM dd"),
        views: data.views,
        uniqueSessions: data.sessions.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredViews]);

  const topPages = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredViews.forEach((view) => {
      counts[view.page_path] = (counts[view.page_path] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filteredViews]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-dreamy flex items-center justify-center">
        <div className="animate-pulse text-rose">Loading...</div>
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
              <ArrowLeft size={18} />
            </Button>
            <Heart className="text-rose fill-current" size={24} />
            <span className="font-display text-xl text-foreground">
              Viewer Analytics
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar size={16} className="mr-2" />
                  {format(dateFrom, "MMM dd")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={dateFrom}
                  onSelect={(date) => date && setDateFrom(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar size={16} className="mr-2" />
                  {format(dateTo, "MMM dd")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={dateTo}
                  onSelect={(date) => date && setDateTo(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-rose-light/20">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="text-rose" size={20} />
              <span className="text-sm text-muted-foreground">Total Views</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total.toLocaleString()}</p>
          </Card>

          <Card className="p-4 bg-card/80 backdrop-blur-sm border-rose-light/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-500" size={20} />
              <span className="text-sm text-muted-foreground">Today</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.today.toLocaleString()}</p>
          </Card>

          <Card className="p-4 bg-card/80 backdrop-blur-sm border-rose-light/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-blue-500" size={20} />
              <span className="text-sm text-muted-foreground">This Week</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.week.toLocaleString()}</p>
          </Card>

          <Card className="p-4 bg-card/80 backdrop-blur-sm border-rose-light/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-purple-500" size={20} />
              <span className="text-sm text-muted-foreground">This Month</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.month.toLocaleString()}</p>
          </Card>

          <Card className="p-4 bg-card/80 backdrop-blur-sm border-rose-light/20">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="text-orange-500" size={20} />
              <span className="text-sm text-muted-foreground">Sessions</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.uniqueSessions.toLocaleString()}</p>
          </Card>

          <Card className="p-4 bg-card/80 backdrop-blur-sm border-rose-light/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-rose" size={20} />
              <span className="text-sm text-muted-foreground">Logged Users</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.uniqueUsers.toLocaleString()}</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-green-500" size={20} />
              <span className="text-sm text-muted-foreground">Real Revenue</span>
            </div>
            <p className="text-2xl font-bold text-green-600">${realRevenue.toFixed(2)}</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-rose-light/20">
            <h3 className="font-display text-lg text-foreground mb-4">Daily Page Views</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="views" fill="hsl(var(--rose))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-rose-light/20">
            <h3 className="font-display text-lg text-foreground mb-4">Unique Sessions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="uniqueSessions" stroke="hsl(var(--rose))" strokeWidth={2} dot={{ fill: "hsl(var(--rose))" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Pages */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-rose-light/20">
          <h3 className="font-display text-lg text-foreground mb-4">Top Pages</h3>
          <div className="space-y-3">
            {topPages.map(([path, count], index) => (
              <div key={path} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose/20 text-rose text-sm flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="text-foreground font-medium">{path}</span>
                </div>
                <span className="text-muted-foreground">{count.toLocaleString()} views</span>
              </div>
            ))}
            {topPages.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No page views recorded yet</p>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminViewers;
