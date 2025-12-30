import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Sparkles, Star, Shield, LogOut, User, RotateCcw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import FloatingHearts from "@/components/FloatingHearts";
import TeddyCard from "@/components/TeddyCard";
import LoveMessage from "@/components/LoveMessage";
import LoveMeter from "@/components/LoveMeter";
import AdPlacement from "@/components/AdPlacement";
import { Button } from "@/components/ui/button";
import teddyHeroImage from "@/assets/teddy-couple-hero.png";
import { Helmet } from "react-helmet-async";

const poses = [
  "Cuddling Together",
  "Sweet Hug",
  "Gentle Kiss",
  "Holding Paws",
  "Nose to Nose",
  "Bear Embrace",
];

const Index = () => {
  const { user, isAdmin, signOut, isLoading } = useAuth();
  const [currentImage, setCurrentImage] = useState(teddyHeroImage);
  const [currentPose, setCurrentPose] = useState("Cuddling Together");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!user) {
        setAvatarUrl(null);
        return;
      }
      
      try {
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("user_id", user.id)
          .single();

        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        } else {
          setAvatarUrl(user.user_metadata?.avatar_url || null);
        }
      } catch {
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
    };

    fetchAvatar();
  }, [user]);

  const handleGenerateNew = useCallback(() => {
    setIsGenerating(true);
    
    // Simulate generation with new pose
    setTimeout(() => {
      const newPoseIndex = Math.floor(Math.random() * poses.length);
      setCurrentPose(poses[newPoseIndex]);
      setMessageIndex((prev) => prev + 1);
      setIsGenerating(false);
    }, 2000);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <Helmet>
        <title>Bear Love - Couples Virtual Teddy Bears</title>
        <meta name="description" content="Experience the sweetest virtual couples experience with adorable teddy bears hugging, cuddling, and sharing love. Generate romantic poses for your special someone." />
      </Helmet>

      <div className="min-h-screen bg-gradient-dreamy relative overflow-hidden">
        <FloatingHearts />

        {/* Admin Header */}
        {!isLoading && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
            {user ? (
              <>
                {/* User Avatar and Email - Clickable to Profile */}
                <Link to="/profile" className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full pl-1 pr-3 py-1 border border-rose-light/30 hover:bg-card/90 transition-colors cursor-pointer">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={avatarUrl || user.user_metadata?.avatar_url} alt={user.email || "User"} />
                    <AvatarFallback className="bg-rose-light text-rose text-xs">
                      <User size={14} />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground max-w-[120px] truncate hidden sm:block">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="soft" size="sm">
                      <Shield size={16} className="mr-1" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut size={16} />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="soft" size="sm">
                  <Shield size={16} className="mr-1" />
                  Admin Login
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 text-rose-light opacity-30 animate-float">
          <Star size={40} fill="currentColor" />
        </div>
        <div className="absolute top-40 right-20 text-amber opacity-20 animate-float" style={{ animationDelay: "2s" }}>
          <Star size={30} fill="currentColor" />
        </div>
        <div className="absolute bottom-40 left-20 text-love opacity-25 animate-float" style={{ animationDelay: "4s" }}>
          <Heart size={35} fill="currentColor" />
        </div>

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
          {/* Top Leaderboard Ad */}
          <div className="mb-8 hidden md:block">
            <AdPlacement size="leaderboard" id="ad-top-leaderboard" adSlot="YOUR_AD_SLOT_1" />
          </div>
          <div className="mb-6 md:hidden">
            <AdPlacement size="banner" id="ad-top-mobile" adSlot="YOUR_AD_SLOT_2" />
          </div>

          {/* Header */}
          <header className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <Heart className="text-rose animate-heartbeat fill-current" size={32} />
              <Sparkles className="text-amber animate-pulse-soft" size={24} />
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground mb-4 tracking-tight">
              Bear <span className="text-gradient-romantic">Love</span>
            </h1>
            
            <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Two adorable teddy bears sharing the sweetest moments together. 
              Generate endless poses of love, cuddles, and warm embraces.
            </p>
          </header>

          {/* Love Message */}
          <LoveMessage messageIndex={messageIndex} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto mb-8 items-start">
            {/* Teddy Card */}
            <div className="lg:order-1">
              <TeddyCard
                imageSrc={currentImage}
                pose={currentPose}
                onGenerateNew={handleGenerateNew}
                isGenerating={isGenerating}
              />
            </div>
            
            {/* Love Meter */}
            <div className="lg:order-2">
              <LoveMeter />
            </div>
          </div>

          {/* Mid-Content Rectangle Ad */}
          <div className="mb-12 flex justify-center">
            <AdPlacement size="rectangle" id="ad-mid-rectangle" adSlot="YOUR_AD_SLOT_3" />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Heart, title: "Endless Love", desc: "Generate infinite poses" },
              { icon: Sparkles, title: "Pure Magic", desc: "AI-powered sweetness" },
              { icon: Star, title: "Made Together", desc: "Share with your love" },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-rose-light/20 shadow-romantic hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-4">
                  <feature.icon className="text-rose" size={24} />
                </div>
                <h3 className="font-display text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom Banner Ad */}
          <div className="mt-12 hidden md:block">
            <AdPlacement size="leaderboard" id="ad-bottom-leaderboard" adSlot="YOUR_AD_SLOT_4" />
          </div>
          <div className="mt-8 md:hidden">
            <AdPlacement size="banner" id="ad-bottom-mobile" adSlot="YOUR_AD_SLOT_5" />
          </div>

          {/* Footer */}
          <footer className="text-center mt-16 pt-8 border-t border-rose-light/20">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
              <span className="font-body text-sm">Made with</span>
              <Heart className="text-rose animate-heartbeat fill-current" size={16} />
              <span className="font-body text-sm">for couples everywhere</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm mb-4">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw size={14} className="mr-1" />
              Reset App
            </Button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Index;
