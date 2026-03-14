import { cn } from "@/lib/utils";

export function MetricCard({ title, value, delta, sub, children, className }) {
  return (
    <div className={cn(
      "bg-white dark:bg-zinc-900",
      "border border-slate-200/60 dark:border-zinc-800",
      "rounded-lg shadow-sm p-6",
      className
    )}>
      <p className="text-xs text-muted-foreground mb-2">{title}</p>
      <p className="text-2xl font-bold font-mono text-foreground leading-none">{value}</p>
      <div className="flex items-center justify-between mt-2">
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        {delta}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
