import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SectionCard({ children, className, noPadding }) {
  return (
    <Card className={cn("bg-card border border-border rounded-xl", className)}>
      <CardContent className={cn(noPadding ? "p-0" : "p-5")}>
        {children}
      </CardContent>
    </Card>
  );
}

export function CardTitle({ title, sub, action }) {
  return (
    <div className="flex items-start justify-between gap-2 mb-5">
      <div>
        <p className="text-[13px] font-semibold text-foreground leading-tight">{title}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
