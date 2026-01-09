import { useState } from "react";
import { Heart, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeddyCardProps {
  imageSrc: string;
  pose: string;
  onGenerateNew: () => void;
  isGenerating: boolean;
}

const TeddyCard = ({ imageSrc, pose, onGenerateNew, isGenerating }: TeddyCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-rose-light via-love to-rose-light rounded-3xl opacity-30 blur-2xl group-hover:opacity-50 transition-opacity duration-500" />
      
      {/* Card container */}
      <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-rose-light/30 overflow-hidden">
        {/* Decorative sparkles */}
        <div className="absolute top-4 right-4 text-amber animate-pulse-soft">
          <Sparkles size={24} />
        </div>
        <div className="absolute bottom-4 left-4 text-love animate-pulse-soft" style={{ animationDelay: "0.5s" }}>
          <Sparkles size={20} />
        </div>

        {/* Image container */}
        <div className="relative rounded-2xl overflow-hidden shadow-romantic">
          <img
            src={imageSrc}
            srcSet={`${imageSrc} 438w, ${imageSrc} 1024w`}
            sizes="(max-width: 480px) 300px, 438px"
            alt={`Teddy bears ${pose}`}
            width={438}
            height={438}
            fetchPriority="high"
            className={`w-full h-auto object-cover transition-transform duration-700 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
          />
          
          {/* Love overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-rose/20 to-transparent transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className="text-primary-foreground animate-heartbeat fill-current"
                  size={24}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pose label */}
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-secondary-foreground font-medium text-sm">
            <Heart size={14} className="text-rose fill-current" />
            {pose}
          </span>
        </div>

        {/* Generate button */}
        <div className="mt-4 flex justify-center">
          <Button
            onClick={onGenerateNew}
            disabled={isGenerating}
            variant="romantic"
            size="lg"
            className="group/btn"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating magic...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4 group-hover/btn:animate-wiggle" />
                Generate New Pose
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeddyCard;
