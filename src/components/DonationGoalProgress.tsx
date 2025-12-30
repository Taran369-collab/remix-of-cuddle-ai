import { useEffect, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface DonationGoal {
  id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  currency: string;
}

interface DonationGoalProgressProps {
  compact?: boolean;
}

const DonationGoalProgress = ({ compact = false }: DonationGoalProgressProps) => {
  const [goal, setGoal] = useState<DonationGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const fetchActiveGoal = async () => {
      const { data, error } = await supabase
        .from("donation_goals")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .single();

      if (!error && data) {
        setGoal(data as DonationGoal);
        if (data.current_amount >= data.target_amount) {
          setShowCelebration(true);
        }
      }
      setIsLoading(false);
    };

    fetchActiveGoal();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("donation_goals_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donation_goals" },
        () => fetchActiveGoal()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading || !goal) return null;

  const percentage = Math.min(
    Math.round((goal.current_amount / goal.target_amount) * 100),
    100
  );

  const formatAmount = (amount: number, currency: string) => {
    if (currency === "INR") return `₹${amount.toLocaleString("en-IN")}`;
    if (currency === "BTC") return `${amount} BTC`;
    if (currency === "ETH") return `${amount} ETH`;
    return `${amount} ${currency}`;
  };

  if (compact) {
    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-4 w-4 text-rose fill-rose animate-pulse" />
          <span className="text-sm font-medium text-foreground">{goal.goal_name}</span>
        </div>
        <Progress value={percentage} className="h-2 mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatAmount(goal.current_amount, goal.currency)}</span>
          <span>{percentage}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-rose-light/30 via-card to-love-light/30 rounded-2xl p-6 border border-rose/20 shadow-romantic overflow-hidden">
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-amber-400 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.7,
              }}
              size={16}
            />
          ))}
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose/20 rounded-full">
              <Heart className="h-6 w-6 text-rose fill-rose animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{goal.goal_name}</h3>
              <p className="text-sm text-muted-foreground">Help us reach our goal!</p>
            </div>
          </div>
          {showCelebration && (
            <span className="bg-gradient-to-r from-amber-400 to-rose text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce">
              🎉 Goal Reached!
            </span>
          )}
        </div>

        <div className="mb-3">
          <Progress value={percentage} className="h-4" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {formatAmount(goal.current_amount, goal.currency)}
            </span>
            <span className="text-muted-foreground">
              of {formatAmount(goal.target_amount, goal.currency)}
            </span>
          </div>
          <span className="text-xl font-bold text-rose">{percentage}%</span>
        </div>

        {percentage >= 25 && percentage < 50 && (
          <p className="mt-3 text-sm text-muted-foreground text-center">
            💖 Great start! We're making progress!
          </p>
        )}
        {percentage >= 50 && percentage < 75 && (
          <p className="mt-3 text-sm text-muted-foreground text-center">
            💕 Halfway there! Thank you for your support!
          </p>
        )}
        {percentage >= 75 && percentage < 100 && (
          <p className="mt-3 text-sm text-muted-foreground text-center">
            💗 Almost there! Just a little more!
          </p>
        )}
      </div>
    </div>
  );
};

export default DonationGoalProgress;
