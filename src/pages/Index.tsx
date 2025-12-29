import { useState, useCallback } from "react";
import { Heart, Sparkles, Star } from "lucide-react";
import FloatingHearts from "@/components/FloatingHearts";
import TeddyCard from "@/components/TeddyCard";
import LoveMessage from "@/components/LoveMessage";
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
  const [currentImage, setCurrentImage] = useState(teddyHeroImage);
  const [currentPose, setCurrentPose] = useState("Cuddling Together");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

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

  return (
    <>
      <Helmet>
        <title>Bear Love - Couples Virtual Teddy Bears</title>
        <meta name="description" content="Experience the sweetest virtual couples experience with adorable teddy bears hugging, cuddling, and sharing love. Generate romantic poses for your special someone." />
      </Helmet>

      <div className="min-h-screen bg-gradient-dreamy relative overflow-hidden">
        <FloatingHearts />

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

          {/* Teddy Card */}
          <div className="max-w-lg mx-auto mb-16">
            <TeddyCard
              imageSrc={currentImage}
              pose={currentPose}
              onGenerateNew={handleGenerateNew}
              isGenerating={isGenerating}
            />
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

          {/* Footer */}
          <footer className="text-center mt-16 pt-8 border-t border-rose-light/20">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <span className="font-body text-sm">Made with</span>
              <Heart className="text-rose animate-heartbeat fill-current" size={16} />
              <span className="font-body text-sm">for couples everywhere</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Index;
