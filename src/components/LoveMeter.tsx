import { useState, useRef } from "react";
import { Heart, Sparkles, Stars, User, Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import LoveCard from "./LoveCard";

const loveMessages = [
  { min: 90, message: "Soulmates Forever!", emoji: "🔥" },
  { min: 75, message: "True Love Connection!", emoji: "💖" },
  { min: 60, message: "Growing Strong Together", emoji: "🌹" },
  { min: 45, message: "Sweet Beginnings", emoji: "🌸" },
  { min: 30, message: "Sparks Are Flying!", emoji: "✨" },
  { min: 0, message: "Love Is Brewing...", emoji: "💫" },
];

const LoveMeter = () => {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [loveScore, setLoveScore] = useState<number | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getLoveMessage = (score: number) => {
    return loveMessages.find((m) => score >= m.min) || loveMessages[loveMessages.length - 1];
  };

  const canSpin = name1.trim().length > 0 && name2.trim().length > 0;

  const spinMeter = () => {
    if (!canSpin) return;
    
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

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsGeneratingImage(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `love-card-${name1.trim()}-${name2.trim()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Love card downloaded!");
    } catch (error) {
      toast.error("Failed to generate image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    
    setIsGeneratingImage(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to generate image");
          return;
        }
        
        const file = new File([blob], "love-card.png", { type: "image/png" });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${name1.trim()} & ${name2.trim()} - Love Compatibility`,
            text: `Our love compatibility is ${loveScore}%! 💕`,
            files: [file],
          });
          toast.success("Shared successfully!");
        } else {
          // Fallback: copy to clipboard or show social links
          const url = canvas.toDataURL("image/png");
          await navigator.clipboard.writeText(
            `${name1.trim()} & ${name2.trim()} have ${loveScore}% love compatibility! 💕 Check yours at Bear Love!`
          );
          toast.success("Link copied to clipboard!");
        }
      }, "image/png");
    } catch (error) {
      toast.error("Failed to share");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const displayName1 = name1.trim() || "Partner 1";
  const displayName2 = name2.trim() || "Partner 2";

  return (
    <>
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
          
          <h3 className="font-display text-xl text-center text-foreground mb-5">
            Love Compatibility <span className="text-gradient-romantic">Meter</span>
          </h3>

          {/* Name inputs */}
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

          {/* Circular gauge */}
          <div className="relative w-40 h-40 mx-auto mb-5">
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
              <p className="font-display text-base text-foreground">
                {displayName1} & {displayName2}
              </p>
              <p className="font-display text-lg text-gradient-romantic">
                {getLoveMessage(loveScore).message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                A perfect match made in heaven! 🧸❤️🧸
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
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

            {/* Share button - only show after result */}
            {showResult && loveScore !== null && (
              <Button
                onClick={() => setShowShareDialog(true)}
                variant="outline"
                className="w-full border-rose-light/50 text-foreground hover:bg-rose-light/10"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Your Love Card
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md bg-card border-rose-light/30 p-0 overflow-hidden">
          <DialogTitle className="sr-only">Share Your Love Card</DialogTitle>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-foreground">Your Love Card</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareDialog(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Card Preview */}
            <div className="flex justify-center mb-4 overflow-hidden rounded-2xl">
              <div className="transform scale-[0.85] origin-top">
                <LoveCard
                  ref={cardRef}
                  name1={displayName1}
                  name2={displayName2}
                  score={loveScore || 0}
                  message={getLoveMessage(loveScore || 0).message}
                  emoji={getLoveMessage(loveScore || 0).emoji}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleDownload}
                disabled={isGeneratingImage}
                variant="romantic"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                {isGeneratingImage ? "Generating..." : "Download"}
              </Button>
              <Button
                onClick={handleShare}
                disabled={isGeneratingImage}
                variant="outline"
                className="flex-1 border-rose-light/50"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoveMeter;
