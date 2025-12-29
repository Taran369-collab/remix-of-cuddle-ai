import { forwardRef } from "react";
import { Heart, Sparkles } from "lucide-react";

interface LoveCardProps {
  name1: string;
  name2: string;
  score: number;
  message: string;
  emoji: string;
}

const LoveCard = forwardRef<HTMLDivElement, LoveCardProps>(
  ({ name1, name2, score, message, emoji }, ref) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div
        ref={ref}
        className="w-[360px] h-[480px] p-6 rounded-3xl relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #fdf2f4 0%, #fce7f3 50%, #fff7ed 100%)",
        }}
      >
        {/* Decorative hearts background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <Heart
              key={i}
              className="absolute fill-current"
              style={{
                color: i % 2 === 0 ? "#fda4af" : "#f9a8d4",
                opacity: 0.15,
                width: 20 + Math.random() * 30,
                height: 20 + Math.random() * 30,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 45 - 22}deg)`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-between">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" style={{ color: "#f59e0b" }} />
              <span
                className="font-serif text-sm tracking-widest uppercase"
                style={{ color: "#be185d" }}
              >
                Love Certificate
              </span>
              <Sparkles className="w-5 h-5" style={{ color: "#f59e0b" }} />
            </div>
            <h2
              className="font-serif text-2xl font-bold"
              style={{ color: "#881337" }}
            >
              Bear Love
            </h2>
          </div>

          {/* Score circle */}
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#fecdd3"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#cardGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
              <defs>
                <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-serif text-3xl font-bold"
                style={{ color: "#be185d" }}
              >
                {score}%
              </span>
              <span className="text-2xl">{emoji}</span>
            </div>
          </div>

          {/* Names */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span
                className="font-serif text-xl font-semibold"
                style={{ color: "#881337" }}
              >
                {name1}
              </span>
              <Heart
                className="w-6 h-6 fill-current"
                style={{ color: "#f43f5e" }}
              />
              <span
                className="font-serif text-xl font-semibold"
                style={{ color: "#881337" }}
              >
                {name2}
              </span>
            </div>
            <p
              className="font-serif text-lg italic"
              style={{ color: "#be185d" }}
            >
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs" style={{ color: "#9f1239" }}>
              🧸 Made with love at Bear Love 🧸
            </p>
            <p className="text-xs mt-1" style={{ color: "#be185d", opacity: 0.7 }}>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

LoveCard.displayName = "LoveCard";

export default LoveCard;
