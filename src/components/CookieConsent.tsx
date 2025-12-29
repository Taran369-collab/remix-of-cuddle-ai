import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "cookie_consent";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-secondary rounded-full shrink-0">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">We use cookies</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to personalize content, provide social media features, 
                and analyze our traffic. We also share information about your use of our site with our 
                advertising partners including Google AdSense.{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Learn more
                </Link>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="flex-1 md:flex-none"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="flex-1 md:flex-none"
            >
              Accept All
            </Button>
          </div>
          
          <button
            onClick={handleDecline}
            className="absolute top-3 right-3 md:hidden text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
