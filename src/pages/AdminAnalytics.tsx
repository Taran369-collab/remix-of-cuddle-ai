import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Heart, ArrowLeft, Loader2, TrendingUp, Calendar, 
  BarChart3, Users, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface DailyStats {
  date: string;
  count: number;
}

interface Analytics {
  totalCalculations: number;
  todayCalculations: number;
  weekCalculations: number;
  averageScore: number;
  uniqueUsers: number;
  dailyStats: DailyStats[];
}

const AdminAnalytics = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
      return;
    }
    fetchAnalytics();
  }, [authLoading, isAdmin, navigate]);

  const fetchAnalytics = async () => {
    try {
      // Fetch all love results
      const { data: results, error } = await supabase
        .from("love_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const now = new Date();
      const todayStart = startOfDay(now);
      const weekStart = startOfDay(subDays(now, 7));

      // Calculate stats
      const totalCalculations = results?.length || 0;
      
      const todayCalculations = results?.filter(r => 
        new Date(r.created_at) >= todayStart
      ).length || 0;

      const weekCalculations = results?.filter(r => 
        new Date(r.created_at) >= weekStart
      ).length || 0;

      const averageScore = results && results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        : 0;

      const uniqueUsers = new Set(results?.map(r => r.user_id)).size;

      // Calculate daily stats for last 7 days
      const dailyStats: DailyStats[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const count = results?.filter(r => {
          const created = new Date(r.created_at);
          return created >= dayStart && created <= dayEnd;
        }).length || 0;

        dailyStats.push({
          date: format(date, "EEE"),
          count,
        });
      }

      setAnalytics({
        totalCalculations,
        todayCalculations,
        weekCalculations,
        averageScore,
        uniqueUsers,
        dailyStats,
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dreamy flex items-center justify-center">
        <Loader2 className="animate-spin text-rose" size={32} />
      </div>
    );
  }

  const maxCount = Math.max(...(analytics?.dailyStats.map(d => d.count) || [1]), 1);

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
              Analytics
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-rose-light/20 text-center">
            <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center mx-auto mb-2">
              <Heart className="text-rose" size={20} />
            </div>
            <p className="text-2xl font-display text-rose">{analytics?.totalCalculations || 0}</p>
            <p className="text-xs text-muted-foreground">Total Calculations</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-rose-light/20 text-center">
            <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-2">
              <Calendar className="text-amber" size={20} />
            </div>
            <p className="text-2xl font-display text-rose">{analytics?.todayCalculations || 0}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-rose-light/20 text-center">
            <div className="w-10 h-10 rounded-full bg-love/10 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="text-love" size={20} />
            </div>
            <p className="text-2xl font-display text-rose">{analytics?.weekCalculations || 0}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-rose-light/20 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-light/30 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="text-rose" size={20} />
            </div>
            <p className="text-2xl font-display text-rose">{analytics?.averageScore || 0}%</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-rose-light/20 text-center col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
              <Users className="text-rose" size={20} />
            </div>
            <p className="text-2xl font-display text-rose">{analytics?.uniqueUsers || 0}</p>
            <p className="text-xs text-muted-foreground">Unique Users</p>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-light/20">
          <h2 className="font-display text-xl text-foreground mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-rose" />
            Last 7 Days
          </h2>

          {analytics?.totalCalculations === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Heart size={48} className="mx-auto mb-4 opacity-50" />
              <p>No love calculations yet</p>
              <p className="text-sm">Data will appear here once users start calculating their love!</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-48">
              {analytics?.dailyStats.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-36">
                    <span className="text-sm font-medium text-rose mb-1">
                      {day.count > 0 ? day.count : ""}
                    </span>
                    <div 
                      className="w-full max-w-12 bg-gradient-to-t from-rose to-rose-light rounded-t-lg transition-all duration-500"
                      style={{ 
                        height: day.count > 0 ? `${(day.count / maxCount) * 100}%` : "4px",
                        minHeight: "4px",
                        opacity: day.count > 0 ? 1 : 0.3,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{day.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;