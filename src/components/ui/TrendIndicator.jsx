import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function TrendIndicator({ value, inverse = false }) {
  if (value === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const positive = inverse ? value < 0 : value > 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-xs font-semibold",
      positive ? "text-emerald-500" : "text-red-500"
    )}>
      <Icon size={11} />{Math.abs(value)}%
    </span>
  );
}

function cn(...c) { return c.filter(Boolean).join(" "); }
