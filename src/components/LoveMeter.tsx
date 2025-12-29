import { useState, useEffect } from "react";
import { Heart, Sparkles, Stars } from "lucide-react";
import { Button } from "@/components/ui/button";

const loveMessages = [
  { min: 90, message: "Soulmates Forever! 💕", emoji: "🔥" },
  { min: 75, message: "True Love Connection!", emoji: "💖" },
  { min: 60, message: "Growing Strong Together", emoji: "🌹" },
  { min: 45, message: "Sweet Beginnings", emoji: "🌸" },
  { min: 30, message: "Sparks Are Flying!", emoji: "✨" },
  { min: 0, message: "Love Is Brewing...", emoji: "💫" },
];

const LoveMeter = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [loveScore, setLoveScore] = useState<number | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const getLoveMessage = (score: number) => {
    return loveMessages.find((m) => score >= m.min) || loveMessages[loveMessages.length - 1];
  };

  const spinMeter = () => {
    setIsSpinning(true);
    setShowResult(false);
    setDisplayScore(0);
    
    // Generate random score between 65-99 for better UX
    const newScore = Math.floor(Math.random() * 35) + 65;
    
    setTimeout(() => {
      setLoveScore(newScore);
      setIsSpinning(false);
      
      // Animate the score counting up
      let current = 0;
      const increment = newScore / 30;
      const timer = setInterval(() => {
        current += increment;
        if (current >= newScore) {
          setDisplayScore(newScore);
          setShowResult(true);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, 50);
    }, 2000);
  };

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative max-w-sm mx-auto">
      {/* Glow background */}
      <div className="absolute -inset-6 bg-gradient-to-r from-rose-light via-love to-rose-light rounded-full opacity-20 blur-3xl animate-pulse-soft" />
      
      <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-card border border-rose-light/30">
        {/* Decorative elements */}
        <div className="absolute -top-3 -right-3">
          <div className="relative">
            <Stars className="text-amber w-8 h-8 animate-pulse-soft" />
            <Sparkles className="absolute -bottom-2 -left-2 text-love w-5 h-5 animate-sparkle" />
          </div>
        </div>
        
        <h3 className="font-display text-xl text-center text-foreground mb-6">
          Love Compatibility <span className="text-gradient-romantic">Meter</span>
        </h3>

        {/* Circular gauge */}
        <div className="relative w-44 h-44 mx-auto mb-6">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
            />
            {/* Progress circle */}
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
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isSpinning ? (
              <div className="relative">
                <Heart className="w-12 h-12 text-rose animate-spin" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber animate-pulse" />
              </div>
            ) : loveScore !== null ? (
              <>
                <span className="font-display text-4xl text-gradient-romantic font-bold">
                  {displayScore}%
                </span>
                <span className="text-2xl mt-1">{getLoveMessage(displayScore).emoji}</span>
              </>
            ) : (
              <div className="text-center">
                <Heart className="w-10 h-10 text-rose-light mx-auto mb-2" />
                <span className="text-sm text-muted-foreground">Tap to reveal</span>
              </div>
            )}
          </div>
          
          {/* Floating hearts when spinning */}
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

        {/* Result message */}
        {showResult && loveScore !== null && (
          <div className="text-center mb-4 animate-fade-in">
            <p className="font-display text-lg text-foreground">
              {getLoveMessage(loveScore).message}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Your bears are meant to be! 🧸❤️🧸
            </p>
          </div>
        )}

        {/* Spin button */}
        <Button
          onClick={spinMeter}
          disabled={isSpinning}
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
      </div>
    </div>
  );
};

export default LoveMeter;
