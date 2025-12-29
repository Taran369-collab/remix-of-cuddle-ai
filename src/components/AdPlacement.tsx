import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Replace with your AdSense Publisher ID (e.g., "ca-pub-1234567890123456")
const ADSENSE_CLIENT_ID = "";

interface AdPlacementProps {
  size: "banner" | "rectangle" | "leaderboard" | "skyscraper";
  className?: string;
  id: string;
  adSlot?: string; // Your AdSense ad slot ID
}

const sizeConfig = {
  banner: { width: 468, height: 60, label: "468×60" },
  rectangle: { width: 300, height: 250, label: "300×250" },
  leaderboard: { width: 728, height: 90, label: "728×90" },
  skyscraper: { width: 160, height: 600, label: "160×600" },
};

const AdPlacement = ({ size, className, id, adSlot }: AdPlacementProps) => {
  const config = sizeConfig[size];
  const adRef = useRef<HTMLDivElement>(null);
  const isConfigured = ADSENSE_CLIENT_ID && adSlot;

  useEffect(() => {
    // Load AdSense script if not already loaded
    if (isConfigured && !document.getElementById("google-adsense-script")) {
      const script = document.createElement("script");
      script.id = "google-adsense-script";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, [isConfigured]);

  useEffect(() => {
    // Push ad when component mounts
    if (isConfigured && adRef.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [isConfigured]);

  // Show placeholder if AdSense is not configured
  if (!isConfigured) {
    return (
      <div
        id={id}
        className={cn(
          "mx-auto flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 text-muted-foreground/50 text-sm font-medium transition-colors hover:border-muted-foreground/30 hover:bg-muted/40",
          className
        )}
        style={{
          maxWidth: `${config.width}px`,
          height: `${config.height}px`,
          width: "100%",
        }}
      >
        <span className="text-center px-2">
          Ad Space<br />
          <span className="text-xs opacity-70">{config.label}</span>
        </span>
        <span className="text-xs opacity-50 mt-1">Configure AdSense</span>
      </div>
    );
  }

  return (
    <div
      id={id}
      ref={adRef}
      className={cn("mx-auto", className)}
      style={{
        maxWidth: `${config.width}px`,
        width: "100%",
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: `${config.width}px`,
          height: `${config.height}px`,
        }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdPlacement;
