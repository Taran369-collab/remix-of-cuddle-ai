import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Heart, ArrowLeft, Loader2, TrendingUp, CalendarIcon, 
  BarChart3, Users, Sparkles, Download
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

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

interface LoveResult {
  id: string;
  name1: string;
  name2: string;
  score: number;
  message: string;
  user_id: string;
  created_at: string;
}

const AdminAnalytics = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [allResults, setAllResults] = useState<LoveResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/");
      return;
    }
    fetchAnalytics();
  }, [authLoading, isAdmin, navigate]);

  const fetchAnalytics = async () => {
    try {
      const { data: results, error } = await supabase
        .from("love_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllResults(results || []);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and compute analytics based on date range
  const { filteredResults, analytics } = useMemo(() => {
    const filterStart = startDate ? startOfDay(startDate) : null;
    const filterEnd = endDate ? endOfDay(endDate) : null;

    const filtered = allResults.filter(r => {
      const created = new Date(r.created_at);
      if (filterStart && created < filterStart) return false;
      if (filterEnd && created > filterEnd) return false;
      return true;
    });

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfDay(subDays(now, 7));

    const totalCalculations = filtered.length;
    const todayCalculations = filtered.filter(r => new Date(r.created_at) >= todayStart).length;
    const weekCalculations = filtered.filter(r => new Date(r.created_at) >= weekStart).length;
    const averageScore = filtered.length > 0
      ? Math.round(filtered.reduce((sum, r) => sum + r.score, 0) / filtered.length)
      : 0;
    const uniqueUsers = new Set(filtered.map(r => r.user_id)).size;

    // Calculate daily stats for selected range
    const chartStart = filterStart || subDays(now, 6);
    const chartEnd = filterEnd || now;
    const days = eachDayOfInterval({ start: chartStart, end: chartEnd });
    
    const dailyStats: DailyStats[] = days.map(date => {
      const count = filtered.filter(r => isSameDay(new Date(r.created_at), date)).length;
      return { date: format(date, days.length > 14 ? "MM/dd" : "EEE"), count };
    });

    return {
      filteredResults: filtered,
      analytics: { totalCalculations, todayCalculations, weekCalculations, averageScore, uniqueUsers, dailyStats }
    };
  }, [allResults, startDate, endDate]);

  const exportToCsv = () => {
    if (filteredResults.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Date", "Name 1", "Name 2", "Score", "Message", "User ID"];
    const csvContent = [
      headers.join(","),
      ...filteredResults.map(result => [
        format(new Date(result.created_at), "yyyy-MM-dd HH:mm:ss"),
        `"${result.name1.replace(/"/g, '""')}"`,
        `"${result.name2.replace(/"/g, '""')}"`,
        result.score,
        `"${result.message.replace(/"/g, '""')}"`,
        result.user_id,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `love-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    toast.success("Analytics exported successfully");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dreamy flex items-center justify-center">
        <Loader2 className="animate-spin text-rose" size={32} />
      </div>
    );
  }

  const maxCount = Math.max(...(analytics.dailyStats.map(d => d.count) || [1]), 1);

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
          <div className="flex items-center gap-2">
            {/* Date Range Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn(!startDate && "text-muted-foreground")}>
                  <CalendarIcon size={16} className="mr-1" />
                  {startDate ? format(startDate, "MMM d") : "Start"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => (endDate ? date > endDate : false) || date > new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground text-sm">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn(!endDate && "text-muted-foreground")}>
                  <CalendarIcon size={16} className="mr-1" />
                  {endDate ? format(endDate, "MMM d") : "End"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => (startDate ? date < startDate : false) || date > new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportToCsv}
              disabled={filteredResults.length === 0}
            >
              <Download size={16} className="mr-1" />
              Export CSV
            </Button>
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
            <p className="text-2xl font-display text-rose">{analytics.totalCalculations}</p>
            <p className="text-xs text-muted-foreground">Total Calculations</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-rose-light/20 text-center">
            <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-2">
              <CalendarIcon className="text-amber" size={20} />
            </div>
            <p className="text-2xl font-display text-rose">{analytics.todayCalculations}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-rose-light/20 text-center">
            <div className="w-10 h-10 rounded-full bg-love/10 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="text-love" size={20} />
            </div>
            <p className="text-2xl font-display text-rose">{analytics.weekCalculations}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-rose-light/20 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-light/30 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="text-rose" size={20} />
            </div>
            <p className="text-2xl font-display text-rose">{analytics.averageScore}%</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-rose-light/20 text-center col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
              <Users className="text-rose" size={20} />
            </div>
            <p className="text-2xl font-display text-rose">{analytics.uniqueUsers}</p>
            <p className="text-xs text-muted-foreground">Unique Users</p>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-light/20">
          <h2 className="font-display text-xl text-foreground mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-rose" />
            {startDate && endDate 
              ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`
              : "Selected Period"}
          </h2>

          {analytics.totalCalculations === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Heart size={48} className="mx-auto mb-4 opacity-50" />
              <p>No love calculations in this period</p>
              <p className="text-sm">Try adjusting the date range or wait for more data.</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-1 h-48 overflow-x-auto">
              {analytics.dailyStats.map((day, index) => (
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