import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LEVEL_STYLES = {
  critical:       "bg-red-500/10 text-red-400 border-red-500/15",
  high:           "bg-orange-500/10 text-orange-400 border-orange-500/15",
  medium:         "bg-blue-500/10 text-blue-400 border-blue-500/15",
  low:            "bg-zinc-500/10 text-zinc-400 border-zinc-500/15",
  good:           "bg-teal-500/10 text-teal-400 border-teal-500/15",
  warning:        "bg-amber-500/10 text-amber-400 border-amber-500/15",
  "needs-update": "bg-amber-500/10 text-amber-400 border-amber-500/15",
};

export function Chip({ label, level = "medium" }) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.medium;
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium px-1.5 py-0 h-[18px] rounded-md",
        "border uppercase tracking-wide",
        style
      )}
    >
      {label}
    </Badge>
  );
}
