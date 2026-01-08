import { useState } from "react";
import { Heart, ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: number;
  question: string;
  emoji: string;
  options: { label: string; value: number; emoji: string }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "How do you prefer to spend a weekend together?",
    emoji: "🌅",
    options: [
      { label: "Adventure outdoors", value: 25, emoji: "🏔️" },
      { label: "Cozy movie marathon", value: 20, emoji: "🎬" },
      { label: "Trying new restaurants", value: 22, emoji: "🍽️" },
      { label: "Relaxing at home", value: 18, emoji: "🏠" },
    ],
  },
  {
    id: 2,
    question: "What's your love language?",
    emoji: "💝",
    options: [
      { label: "Words of affirmation", value: 24, emoji: "💬" },
      { label: "Quality time", value: 26, emoji: "⏰" },
      { label: "Physical touch", value: 23, emoji: "🤗" },
      { label: "Acts of service", value: 22, emoji: "🎁" },
    ],
  },
  {
    id: 3,
    question: "How do you handle disagreements?",
    emoji: "🤝",
    options: [
      { label: "Talk it out immediately", value: 25, emoji: "🗣️" },
      { label: "Take space then discuss", value: 24, emoji: "🌙" },
      { label: "Write down feelings first", value: 22, emoji: "📝" },
      { label: "Hug it out", value: 23, emoji: "🫂" },
    ],
  },
  {
    id: 4,
    question: "What matters most in a relationship?",
    emoji: "💫",
    options: [
      { label: "Trust & honesty", value: 26, emoji: "🔐" },
      { label: "Fun & laughter", value: 24, emoji: "😂" },
      { label: "Deep conversations", value: 25, emoji: "🌌" },
      { label: "Shared goals", value: 23, emoji: "🎯" },
    ],
  },
  {
    id: 5,
    question: "Your ideal date night?",
    emoji: "✨",
    options: [
      { label: "Candlelit dinner", value: 24, emoji: "🕯️" },
      { label: "Stargazing picnic", value: 26, emoji: "🌟" },
      { label: "Dancing together", value: 23, emoji: "💃" },
      { label: "Cooking together", value: 25, emoji: "👨‍🍳" },
    ],
  },
];

interface CompatibilityQuizProps {
  name1: string;
  name2: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

const CompatibilityQuiz = ({ name1, name2, onComplete, onBack }: CompatibilityQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const question = quizQuestions[currentQuestion];
  const totalQuestions = quizQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleSelectOption = (value: number, index: number) => {
    setSelectedOption(index);
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        // Calculate final score
        const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
        // Normalize to 0-100 range with some randomness for fun
        const normalizedScore = Math.min(100, Math.max(50, totalScore + Math.floor(Math.random() * 15)));
        onComplete(normalizedScore);
      }
      setIsAnimating(false);
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion((prev) => prev - 1);
        setSelectedOption(null);
        setIsAnimating(false);
      }, 300);
    } else {
      onBack();
    }
  };

  return (
    <div className="relative max-w-md mx-auto">
      <div className="absolute -inset-6 bg-gradient-to-r from-love via-rose to-love rounded-3xl opacity-20 blur-3xl animate-pulse-soft" />
      
      <div className="relative bg-card/90 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-rose-light/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-love fill-current animate-heartbeat" />
            <span className="font-display text-lg text-gradient-romantic">
              Compatibility Quiz
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} / {totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose via-love to-rose rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Names display */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="px-3 py-1 bg-rose-light/30 rounded-full text-sm font-medium text-rose">
            {name1}
          </span>
          <Sparkles className="w-4 h-4 text-amber animate-pulse" />
          <span className="px-3 py-1 bg-love/20 rounded-full text-sm font-medium text-love">
            {name2}
          </span>
        </div>

        {/* Question */}
        <div className={cn(
          "transition-all duration-300",
          isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
        )}>
          <div className="text-center mb-6">
            <span className="text-4xl mb-3 block">{question.emoji}</span>
            <h3 className="font-display text-lg text-foreground">
              {question.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectOption(option.value, index)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 text-left",
                  selectedOption === index
                    ? "border-love bg-love/10 shadow-glow"
                    : "border-border hover:border-rose-light/50 hover:bg-secondary/50"
                )}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className={cn(
                  "flex-1 font-medium",
                  selectedOption === index ? "text-love" : "text-foreground"
                )}>
                  {option.label}
                </span>
                {selectedOption === index && (
                  <CheckCircle2 className="w-5 h-5 text-love animate-scale-in" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentQuestion === 0 ? "Back" : "Previous"}
          </Button>
          <Button
            variant="romantic"
            onClick={handleNext}
            disabled={selectedOption === null}
            className="flex-1"
          >
            {currentQuestion === totalQuestions - 1 ? (
              <>
                <Heart className="w-4 h-4 mr-2" />
                See Results
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityQuiz;
