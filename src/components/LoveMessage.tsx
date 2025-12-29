import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const defaultMessages = [
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
  const [messages, setMessages] = useState<string[]>(defaultMessages);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("love_messages")
          .select("message")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setMessages(data.map(m => m.message));
        }
      } catch (err) {
        // Silently fall back to default messages
        console.error("Failed to load messages:", err);
      }
    };

    fetchMessages();
  }, []);

  const message = messages[messageIndex % messages.length];

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