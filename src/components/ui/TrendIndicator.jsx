import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * TrendIndicator — custom, no Tremor dependency
 * @param {number}  value    — numeric %, positive = up
 * @param {boolean} inverse  — flip semantics (e.g. bounce rate: up = bad)
 */
export function TrendIndicator({ value, inverse = false, className }) {
  if (value === undefined || value === null) return null;

  if (value === 0) {
    return (
      <span className={cn(
        "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10.5px] font-medium tabular-nums",
        "bg-muted text-muted-foreground",
        className
      )}>
        <Minus size={9} strokeWidth={2.5} />
        0%
      </span>
    );
  }

  const isGood = inverse ? value < 0 : value > 0;
  const sign = value > 0 ? "+" : "";

  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10.5px] font-medium tabular-nums",
      isGood
        ? "bg-emerald-500/10 text-emerald-500"
        : "bg-red-500/10 text-red-500",
      className
    )}>
      {isGood
        ? <TrendingUp size={9} strokeWidth={2.5} />
        : <TrendingDown size={9} strokeWidth={2.5} />
      }
      {sign}{value}%
    </span>
  );
}
