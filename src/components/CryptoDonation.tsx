import { useState } from "react";
import { Bitcoin, Copy, Check, Heart, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DonationGoalProgress from "@/components/DonationGoalProgress";

const WALLET_ADDRESSES = {
  BTC: "bc1q3h3z9gg5q0u86vayjjdjm598djzx540czn9qr7",
  ETH: "0x9EF8145CF17D5e92BE4c7777a54869b4287E3AA5",
  UPI: "ramansasan6@oksbi",
};

const CryptoDonation = () => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = async (address: string, type: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(type);
      toast.success(`${type} address copied!`);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      toast.error("Failed to copy address");
    }
  };

  const generateQRUrl = (address: string, type: "BTC" | "ETH" | "UPI") => {
    if (type === "UPI") {
      return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${address}&pn=BearLove&cu=INR`)}&bgcolor=fff5f7&color=e11d48`;
    }
    const prefix = type === "BTC" ? "bitcoin:" : "ethereum:";
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(prefix + address)}&bgcolor=fff5f7&color=e11d48`;
  };

  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-rose-light/20 shadow-romantic">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Heart className="text-rose fill-current" size={20} />
        <h3 className="font-display text-xl text-foreground">Support Bear Love</h3>
      </div>

      <p className="text-center text-muted-foreground text-sm mb-4">
        Help us keep spreading love! Donate to support development.
      </p>

      {/* Compact Goal Progress */}
      <div className="mb-4">
        <DonationGoalProgress compact />
      </div>

      {/* UPI Donation - Featured */}
      <div className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-500/10 to-green-500/10 rounded-xl border border-orange-500/20 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <IndianRupee className="text-orange-600" size={20} />
          <span className="font-semibold text-foreground">UPI (India)</span>
        </div>
        
        <img
          src={generateQRUrl(WALLET_ADDRESSES.UPI, "UPI")}
          alt="UPI QR Code"
          className="w-32 h-32 rounded-lg mb-3 bg-white p-1"
        />
        
        <p className="text-sm text-muted-foreground mb-2 text-center">
          Donate ₹1 - ₹9 to show your love!
        </p>
        
        <div className="w-full max-w-xs">
          <p className="text-xs text-muted-foreground mb-2 text-center font-mono">
            {WALLET_ADDRESSES.UPI}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
            onClick={() => copyToClipboard(WALLET_ADDRESSES.UPI, "UPI")}
          >
            {copiedAddress === "UPI" ? (
              <>
                <Check size={14} className="mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} className="mr-1" />
                Copy UPI ID
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* BTC Donation */}
        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Bitcoin className="text-amber" size={20} />
            <span className="font-semibold text-foreground">Bitcoin</span>
          </div>
          
          <img
            src={generateQRUrl(WALLET_ADDRESSES.BTC, "BTC")}
            alt="BTC QR Code"
            className="w-32 h-32 rounded-lg mb-3 bg-white p-1"
          />
          
          <div className="w-full">
            <p className="text-xs text-muted-foreground mb-2 text-center break-all font-mono">
              {WALLET_ADDRESSES.BTC.slice(0, 12)}...{WALLET_ADDRESSES.BTC.slice(-8)}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => copyToClipboard(WALLET_ADDRESSES.BTC, "BTC")}
            >
              {copiedAddress === "BTC" ? (
                <>
                  <Check size={14} className="mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1" />
                  Copy Address
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ETH Donation */}
        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-[#627EEA]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1.5L5.25 12.1875L12 16.125L18.75 12.1875L12 1.5ZM12 17.625L5.25 13.6875L12 22.5L18.75 13.6875L12 17.625Z" />
            </svg>
            <span className="font-semibold text-foreground">Ethereum</span>
          </div>
          
          <img
            src={generateQRUrl(WALLET_ADDRESSES.ETH, "ETH")}
            alt="ETH QR Code"
            className="w-32 h-32 rounded-lg mb-3 bg-white p-1"
          />
          
          <div className="w-full">
            <p className="text-xs text-muted-foreground mb-2 text-center break-all font-mono">
              {WALLET_ADDRESSES.ETH.slice(0, 10)}...{WALLET_ADDRESSES.ETH.slice(-8)}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => copyToClipboard(WALLET_ADDRESSES.ETH, "ETH")}
            >
              {copiedAddress === "ETH" ? (
                <>
                  <Check size={14} className="mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1" />
                  Copy Address
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Thank you for your support! 💕
      </p>
    </div>
  );
};

export default CryptoDonation;
