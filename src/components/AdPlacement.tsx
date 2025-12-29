import { cn } from "@/lib/utils";

interface AdPlacementProps {
  size: "banner" | "rectangle" | "leaderboard" | "skyscraper";
  className?: string;
  id: string;
}

const sizeConfig = {
  banner: { width: "468px", height: "60px", label: "468×60" },
  rectangle: { width: "300px", height: "250px", label: "300×250" },
  leaderboard: { width: "728px", height: "90px", label: "728×90" },
  skyscraper: { width: "160px", height: "600px", label: "160×600" },
};

const AdPlacement = ({ size, className, id }: AdPlacementProps) => {
  const config = sizeConfig[size];

  return (
    <div
      id={id}
      className={cn(
        "mx-auto flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 text-muted-foreground/50 text-sm font-medium transition-colors hover:border-muted-foreground/30 hover:bg-muted/40",
        className
      )}
      style={{
        maxWidth: config.width,
        height: config.height,
        width: "100%",
      }}
    >
      <span className="text-center px-2">
        Ad Space<br />
        <span className="text-xs opacity-70">{config.label}</span>
      </span>
    </div>
  );
};

export default AdPlacement;
