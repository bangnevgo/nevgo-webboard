import { cn } from "@/lib/utils";

export function SectionCard({ children, className }) {
  return (
    <div className={cn(
      "bg-white dark:bg-zinc-900",
      "border border-slate-200/60 dark:border-zinc-800",
      "rounded-lg shadow-sm",
      "p-6",
      className
    )}>
      {children}
    </div>
  );
}

export function CardTitle({ title, sub }) {
  return (
    <div className="mb-4">
      <p className="font-semibold text-sm text-foreground">{title}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
