import { Heart } from "lucide-react";

const loveMessages = [
  "Forever & Always",
  "Two Hearts, One Love",
  "Together is Our Favorite Place",
  "You're My Everything",
  "Love You to the Moon & Back",
  "Cuddle Buddies Forever",
  "Made for Each Other",
  "Always Better Together",
];

interface LoveMessageProps {
  messageIndex: number;
}

const LoveMessage = ({ messageIndex }: LoveMessageProps) => {
  const message = loveMessages[messageIndex % loveMessages.length];

  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <Heart className="text-rose animate-heartbeat fill-current" size={20} />
      <p className="font-display text-2xl md:text-3xl text-gradient-romantic tracking-wide">
        {message}
      </p>
      <Heart className="text-rose animate-heartbeat fill-current" size={20} style={{ animationDelay: "0.3s" }} />
    </div>
  );
};

export default LoveMessage;
