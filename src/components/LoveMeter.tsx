import { useState, useEffect, forwardRef } from "react";
import { Heart, Sparkles, Stars, User, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

// Validation schema for names
const nameSchema = z.string()
  .min(1, "Name is required")
  .max(20, "Name must be 20 characters or less")
  .regex(/^[a-zA-Z0-9\s\-']+$/, "Name contains invalid characters");

interface LoveResult {
  id: string;
  name1: string;
  name2: string;
  score: number;
  message: string;
  created_at: string;
}

const loveMessages = [
  { min: 90, message: "Soulmates Forever!", emoji: "🔥" },
  { min: 75, message: "True Love Connection!", emoji: "💖" },
  { min: 60, message: "Growing Strong Together", emoji: "🌹" },
  { min: 45, message: "Sweet Beginnings", emoji: "🌸" },
  { min: 30, message: "Sparks Are Flying!", emoji: "✨" },
  { min: 0, message: "Love Is Brewing...", emoji: "💫" },
];

const LoveMeter = forwardRef<HTMLDivElement>((_, ref) => {
  const { user } = useAuth();
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [loveScore, setLoveScore] = useState<number | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<LoveResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const getLoveMessage = (score: number) => {
    return loveMessages.find((m) => score >= m.min) || loveMessages[loveMessages.length - 1];
  };

  const canSpin = name1.trim().length > 0 && name2.trim().length > 0;

  const fetchHistory = async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("love_results" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory((data as unknown as LoveResult[]) || []);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error fetching history:", error);
      toast.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveResult = async (n1: string, n2: string, score: number, message: string) => {
    if (!user) return;
    
    // Validate names before saving
    const name1Result = nameSchema.safeParse(n1);
    const name2Result = nameSchema.safeParse(n2);
    
    if (!name1Result.success || !name2Result.success) {
      toast.error("Invalid name format");
      return;
    }
    
    try {
      const { error } = await supabase.from("love_results" as any).insert({
        user_id: user.id,
        name1: n1.substring(0, 100), // Enforce max length
        name2: n2.substring(0, 100),
        score,
        message: message.substring(0, 500),
      });

      if (error) throw error;
      toast.success("Result saved to your history!");
      fetchHistory();
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error saving result:", error);
      toast.error("Failed to save result");
    }
  };

  const deleteResult = async (id: string) => {
    try {
      const { error } = await supabase.from("love_results" as any).delete().eq("id", id);
      if (error) throw error;
      toast.success("Deleted from history");
      fetchHistory();
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error deleting result:", error);
      toast.error("Failed to delete");
    }
  };

  useEffect(() => {
    if (user && showHistory) {
      fetchHistory();
    }
  }, [user, showHistory]);

  const spinMeter = () => {
    if (!canSpin) return;
    
    setIsSpinning(true);
    setShowResult(false);
    setDisplayScore(0);
    
    const newScore = Math.floor(Math.random() * 35) + 65;
    
    setTimeout(() => {
      setLoveScore(newScore);
      setIsSpinning(false);
      
      let current = 0;
      const increment = newScore / 30;
      const timer = setInterval(() => {
        current += increment;
        if (current >= newScore) {
          setDisplayScore(newScore);
          setShowResult(true);
          clearInterval(timer);
          
          if (user) {
            const msg = getLoveMessage(newScore);
            saveResult(name1.trim(), name2.trim(), newScore, msg.message);
          }
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, 50);
    }, 2000);
  };

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const displayName1 = name1.trim() || "Partner 1";
  const displayName2 = name2.trim() || "Partner 2";

  return (
    <div ref={ref} className="relative max-w-sm mx-auto">
      <div className="absolute -inset-6 bg-gradient-to-r from-rose-light via-love to-rose-light rounded-full opacity-20 blur-3xl animate-pulse-soft" />
      
      <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-card border border-rose-light/30">
        <div className="absolute -top-3 -right-3">
          <div className="relative">
            <Stars className="text-amber w-8 h-8 animate-pulse-soft" />
            <Sparkles className="absolute -bottom-2 -left-2 text-love w-5 h-5 animate-sparkle" />
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-foreground">
            Love <span className="text-gradient-romantic">Meter</span>
          </h3>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-muted-foreground hover:text-foreground"
            >
              <History className="w-4 h-4" />
            </Button>
          )}
        </div>

        {showHistory && user ? (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Your History</h4>
            {loadingHistory ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No results yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {result.name1} & {result.name2}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.score}% • {result.message}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteResult(result.id)}
                      className="text-muted-foreground hover:text-destructive ml-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(false)}
              className="w-full"
            >
              Back to Meter
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose" />
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name1}
                  onChange={(e) => setName1(e.target.value.slice(0, 20))}
                  className="pl-10 bg-secondary/50 border-rose-light/30 focus:border-rose placeholder:text-muted-foreground/60"
                  maxLength={20}
                />
              </div>
              <div className="flex items-center justify-center">
                <Heart className="w-5 h-5 text-love fill-current animate-heartbeat" />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-love" />
                <Input
                  type="text"
                  placeholder="Partner's name"
                  value={name2}
                  onChange={(e) => setName2(e.target.value.slice(0, 20))}
                  className="pl-10 bg-secondary/50 border-rose-light/30 focus:border-rose placeholder:text-muted-foreground/60"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="relative w-40 h-40 mx-auto mb-5">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="url(#loveGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 ease-out"
                />
                <defs>
                  <linearGradient id="loveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--rose))" />
                    <stop offset="50%" stopColor="hsl(var(--love-pink))" />
                    <stop offset="100%" stopColor="hsl(var(--warm-amber))" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isSpinning ? (
                  <div className="relative">
                    <Heart className="w-10 h-10 text-rose animate-spin" />
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber animate-pulse" />
                  </div>
                ) : loveScore !== null ? (
                  <>
                    <span className="font-display text-3xl text-gradient-romantic font-bold">
                      {displayScore}%
                    </span>
                    <span className="text-xl mt-1">{getLoveMessage(displayScore).emoji}</span>
                  </>
                ) : (
                  <div className="text-center px-2">
                    <Heart className="w-8 h-8 text-rose-light mx-auto mb-1" />
                    <span className="text-xs text-muted-foreground">Enter names above</span>
                  </div>
                )}
              </div>
              
              {isSpinning && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <Heart
                      key={i}
                      className="absolute text-love fill-current animate-drift"
                      size={12 + Math.random() * 8}
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        animationDuration: `${2 + Math.random() * 2}s`,
                        animationDelay: `${i * 0.2}s`,
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </>
              )}
            </div>

            {showResult && loveScore !== null && (
              <div className="text-center mb-4 animate-fade-in">
                <p className="font-display text-base text-foreground">
                  {displayName1} & {displayName2}
                </p>
                <p className="font-display text-lg text-gradient-romantic">
                  {getLoveMessage(loveScore).message}
                </p>
                {user && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Saved to your history! 🧸❤️🧸
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={spinMeter}
              disabled={isSpinning || !canSpin}
              variant="romantic"
              className="w-full"
            >
              {isSpinning ? (
                <>
                  <Heart className="mr-2 h-4 w-4 animate-heartbeat" />
                  Calculating love...
                </>
              ) : loveScore !== null ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Try Again
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Check Your Love
                </>
              )}
            </Button>
            
            {!user && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                Sign in to save your love history
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
});

LoveMeter.displayName = "LoveMeter";

export default LoveMeter;
