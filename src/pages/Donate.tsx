import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart, ArrowLeft, Bitcoin, IndianRupee, Copy, Check, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDonationTracking } from "@/hooks/useDonationTracking";
import DonationGoalProgress from "@/components/DonationGoalProgress";

const PAYMENT_OPTIONS = {
  UPI: "ramansasan6@oksbi",
  BTC: "bc1q3h3z9gg5q0u86vayjjdjm598djzx540czn9qr7",
  ETH: "0x9EF8145CF17D5e92BE4c7777a54869b4287E3AA5",
};

const Donate = () => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const { trackCopyAddress, trackPageView } = useDonationTracking();

  useEffect(() => {
    // Track page view for each payment method
    trackPageView('UPI');
  }, []);

  const copyToClipboard = async (address: string, type: "UPI" | "BTC" | "ETH") => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(type);
      trackCopyAddress(type);
      toast.success(`${type} address copied!`);
      setShowThankYou(true);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      toast.error("Failed to copy address");
    }
  };

  const generateQRUrl = (address: string, type: "BTC" | "ETH" | "UPI") => {
    if (type === "UPI") {
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${address}&pn=BearLove&cu=INR`)}&bgcolor=fff5f7&color=e11d48`;
    }
    const prefix = type === "BTC" ? "bitcoin:" : "ethereum:";
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(prefix + address)}&bgcolor=fff5f7&color=e11d48`;
  };

  return (
    <>
      <Helmet>
        <title>Donate - Support Bear Love</title>
        <meta name="description" content="Support Bear Love with your donation. Accept UPI, Bitcoin, and Ethereum payments." />
      </Helmet>

      <div className="min-h-screen bg-gradient-dreamy">
        {/* Header */}
        <header className="bg-card/60 backdrop-blur-sm border-b border-rose-light/20 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft size={18} />
                </Button>
              </Link>
              <Heart className="text-rose fill-current" size={24} />
              <span className="font-display text-xl text-foreground">
                Support <span className="text-gradient-romantic">Bear Love</span>
              </span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose/10 rounded-full mb-6">
              <Gift className="text-rose" size={18} />
              <span className="text-rose font-medium">Your Support Matters</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              Help Us Spread <span className="text-gradient-romantic">Love</span>
            </h1>
            
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your generous donation helps us keep Bear Love running and spreading joy to couples around the world. Every contribution, big or small, makes a difference!
            </p>
          </div>

          {/* Donation Goal Progress */}
          <div className="mb-8">
            <DonationGoalProgress />
          </div>

          {/* Thank You Message */}
          {showThankYou && (
            <div className="bg-gradient-to-r from-rose/20 to-rose-light/20 rounded-2xl p-6 mb-8 text-center border border-rose/30 animate-fade-in">
              <Sparkles className="mx-auto text-rose mb-3" size={32} />
              <h3 className="font-display text-2xl text-foreground mb-2">Thank You So Much!</h3>
              <p className="text-muted-foreground">
                Your kindness means the world to us. You are helping spread love and happiness!
              </p>
            </div>
          )}

          {/* Payment Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {/* UPI - Featured */}
            <div className="lg:col-span-1 bg-gradient-to-br from-orange-500/10 to-green-500/10 rounded-2xl p-6 border border-orange-500/20 shadow-romantic">
              <div className="flex items-center justify-center gap-2 mb-4">
                <IndianRupee className="text-orange-600" size={24} />
                <h3 className="font-display text-xl text-foreground">UPI (India)</h3>
              </div>
              
              <div className="flex justify-center mb-4">
                <img
                  src={generateQRUrl(PAYMENT_OPTIONS.UPI, "UPI")}
                  alt="UPI QR Code"
                  className="w-48 h-48 rounded-xl bg-white p-2 shadow-lg"
                />
              </div>
              
              <div className="text-center mb-4">
                <p className="text-lg font-semibold text-orange-600 mb-1">₹1 - ₹9</p>
                <p className="text-sm text-muted-foreground">Suggested donation</p>
              </div>
              
              <div className="bg-white/50 rounded-lg p-3 mb-4">
                <p className="text-sm font-mono text-center text-foreground break-all">
                  {PAYMENT_OPTIONS.UPI}
                </p>
              </div>
              
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white"
                onClick={() => copyToClipboard(PAYMENT_OPTIONS.UPI, "UPI")}
              >
                {copiedAddress === "UPI" ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-2" />
                    Copy UPI ID
                  </>
                )}
              </Button>
            </div>

            {/* Bitcoin */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-amber/20 shadow-romantic">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Bitcoin className="text-amber" size={24} />
                <h3 className="font-display text-xl text-foreground">Bitcoin</h3>
              </div>
              
              <div className="flex justify-center mb-4">
                <img
                  src={generateQRUrl(PAYMENT_OPTIONS.BTC, "BTC")}
                  alt="BTC QR Code"
                  className="w-48 h-48 rounded-xl bg-white p-2 shadow-lg"
                />
              </div>
              
              <div className="text-center mb-4">
                <p className="text-lg font-semibold text-amber mb-1">Any Amount</p>
                <p className="text-sm text-muted-foreground">BTC donations welcome</p>
              </div>
              
              <div className="bg-secondary/50 rounded-lg p-3 mb-4">
                <p className="text-xs font-mono text-center text-foreground break-all">
                  {PAYMENT_OPTIONS.BTC}
                </p>
              </div>
              
              <Button
                variant="outline"
                className="w-full border-amber/30 text-amber hover:bg-amber/10"
                onClick={() => copyToClipboard(PAYMENT_OPTIONS.BTC, "BTC")}
              >
                {copiedAddress === "BTC" ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-2" />
                    Copy Address
                  </>
                )}
              </Button>
            </div>

            {/* Ethereum */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-[#627EEA]/20 shadow-romantic">
              <div className="flex items-center justify-center gap-2 mb-4">
                <svg className="w-6 h-6 text-[#627EEA]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1.5L5.25 12.1875L12 16.125L18.75 12.1875L12 1.5ZM12 17.625L5.25 13.6875L12 22.5L18.75 13.6875L12 17.625Z" />
                </svg>
                <h3 className="font-display text-xl text-foreground">Ethereum</h3>
              </div>
              
              <div className="flex justify-center mb-4">
                <img
                  src={generateQRUrl(PAYMENT_OPTIONS.ETH, "ETH")}
                  alt="ETH QR Code"
                  className="w-48 h-48 rounded-xl bg-white p-2 shadow-lg"
                />
              </div>
              
              <div className="text-center mb-4">
                <p className="text-lg font-semibold text-[#627EEA] mb-1">Any Amount</p>
                <p className="text-sm text-muted-foreground">ETH/ERC-20 accepted</p>
              </div>
              
              <div className="bg-secondary/50 rounded-lg p-3 mb-4">
                <p className="text-xs font-mono text-center text-foreground break-all">
                  {PAYMENT_OPTIONS.ETH}
                </p>
              </div>
              
              <Button
                variant="outline"
                className="w-full border-[#627EEA]/30 text-[#627EEA] hover:bg-[#627EEA]/10"
                onClick={() => copyToClipboard(PAYMENT_OPTIONS.ETH, "ETH")}
              >
                {copiedAddress === "ETH" ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-2" />
                    Copy Address
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Why Donate Section */}
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-rose-light/20 text-center">
            <Heart className="mx-auto text-rose fill-current mb-4" size={40} />
            <h2 className="font-display text-2xl text-foreground mb-4">Why Your Support Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="text-center">
                <div className="w-12 h-12 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🐻</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Keep Bears Cuddling</h3>
                <p className="text-sm text-muted-foreground">Help us maintain and improve the teddy bear animations</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💕</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Spread More Love</h3>
                <p className="text-sm text-muted-foreground">Enable us to add more romantic features and messages</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Keep It Free</h3>
                <p className="text-sm text-muted-foreground">Your donation helps keep Bear Love free for everyone</p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            All donations go directly towards maintaining and improving Bear Love. Thank you for your generosity! 💖
          </p>
        </main>
      </div>
    </>
  );
};

export default Donate;
