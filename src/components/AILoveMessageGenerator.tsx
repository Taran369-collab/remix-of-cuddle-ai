import { useState } from "react";
import { Heart, Sparkles, Copy, RefreshCw, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const occasions = [
  { value: "everyday", label: "Everyday Love" },
  { value: "anniversary", label: "Anniversary" },
  { value: "birthday", label: "Birthday" },
  { value: "valentines", label: "Valentine's Day" },
  { value: "apology", label: "Making Up" },
  { value: "missing", label: "Missing You" },
  { value: "gratitude", label: "Thank You" },
  { value: "goodnight", label: "Good Night" },
  { value: "goodmorning", label: "Good Morning" },
];

const tones = [
  { value: "sweet", label: "Sweet & Tender" },
  { value: "passionate", label: "Passionate & Intense" },
  { value: "playful", label: "Playful & Fun" },
  { value: "poetic", label: "Poetic & Dreamy" },
  { value: "sincere", label: "Sincere & Heartfelt" },
  { value: "romantic", label: "Classic Romantic" },
];

const AILoveMessageGenerator = () => {
  const { user } = useAuth();
  const [recipientName, setRecipientName] = useState("");
  const [occasion, setOccasion] = useState("everyday");
  const [tone, setTone] = useState("romantic");
  const [interests, setInterests] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMessage = async () => {
    if (!user) {
      toast.error("Please sign in to generate love messages");
      return;
    }

    setIsGenerating(true);
    setGeneratedMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-love-message", {
        body: {
          recipientName: recipientName.trim().slice(0, 100) || undefined,
          occasion,
          tone,
          interests: interests.trim().slice(0, 500) || undefined,
        },
      });

      if (error) {
        console.error("Function error:", error);
        if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
          toast.error("Please sign in again to continue.");
        } else {
          toast.error("Failed to generate message. Please try again.");
        }
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.message) {
        setGeneratedMessage(data.message);
        toast.success("Love message generated!");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      toast.success("Message copied to clipboard!");
    } catch {
      toast.error("Failed to copy message");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-rose/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-rose animate-pulse" />
          <CardTitle className="text-2xl font-display text-gradient-romantic">
            AI Love Message Generator
          </CardTitle>
          <Sparkles className="h-6 w-6 text-rose animate-pulse" />
        </div>
        <CardDescription>
          Create personalized romantic messages powered by AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!user ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">
              Sign in to generate personalized love messages with AI
            </p>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-rose to-pink-500 hover:from-rose/90 hover:to-pink-500/90 text-white">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In to Continue
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipient">Their Name (optional)</Label>
                <Input
                  id="recipient"
                  placeholder="e.g., Sarah"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  maxLength={100}
                  className="border-rose/20 focus:border-rose"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger id="occasion" className="border-rose/20 focus:border-rose">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {occasions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone & Style</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone" className="border-rose/20 focus:border-rose">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Their Interests (optional)</Label>
              <Textarea
                id="interests"
                placeholder="e.g., loves stargazing, coffee, hiking, reading poetry..."
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                maxLength={500}
                className="border-rose/20 focus:border-rose min-h-[80px] resize-none"
              />
            </div>

            <Button
              onClick={generateMessage}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-rose to-pink-500 hover:from-rose/90 hover:to-pink-500/90 text-white font-semibold py-6"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Crafting Your Message...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-5 w-5" />
                  Generate Love Message
                </>
              )}
            </Button>

            {generatedMessage && (
              <div className="relative p-6 rounded-xl bg-gradient-to-br from-rose/10 to-pink-500/10 border border-rose/20">
                <div className="absolute -top-3 left-4 bg-background px-2 text-sm text-rose font-medium">
                  Your Message
                </div>
                <p className="text-lg leading-relaxed text-foreground italic">
                  "{generatedMessage}"
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="border-rose/30 hover:bg-rose/10"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateMessage}
                    disabled={isGenerating}
                    className="border-rose/30 hover:bg-rose/10"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AILoveMessageGenerator;
