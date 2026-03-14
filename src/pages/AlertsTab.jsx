import { SectionCard } from "@/components/ui/SectionCard";
import { Chip } from "@/components/ui/Chip";
import { ALERTS_DATA } from "@/data/mockData";

const levelColors = { critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#10b981" };

export function AlertsTab() {
  const levels = ["critical", "high", "medium", "low"];
  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="flex gap-5 items-center px-4 py-3 bg-card border border-border rounded-xl">
        {levels.map(l => {
          const count = ALERTS_DATA.filter(a => a.level === l).length;
          return (
            <div key={l} className="flex gap-2 items-center">
              <div className="w-2 h-2 rounded-full" style={{ background: levelColors[l] }} />
              <span className="text-xs text-muted-foreground">{l.charAt(0).toUpperCase() + l.slice(1)}: </span>
              <span className="text-sm font-bold" style={{ color: levelColors[l] }}>{count}</span>
            </div>
          );
        })}
        <div className="ml-auto text-xs text-muted-foreground">Total: {ALERTS_DATA.length} alerts</div>
      </div>

      {/* Grouped by level */}
      {levels.map(level => {
        const levelAlerts = ALERTS_DATA.filter(a => a.level === level);
        if (!levelAlerts.length) return null;
        const col = levelColors[level];
        return (
          <SectionCard key={level} className="border" style={{ borderColor: col + "30" }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: col }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: col }}>
                {level} Priority — {levelAlerts.length} alert{levelAlerts.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {levelAlerts.map(a => (
                <div key={a.id} className="flex justify-between items-center px-4 py-3 bg-muted rounded-lg border" style={{ borderColor: col + "20" }}>
                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-1">
                      <p className="text-sm font-semibold text-foreground">{a.title}</p>
                      <Chip label={a.agent} level="medium" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{a.msg}</p>
                    <span className="text-[10px] text-muted-foreground">{a.time}</span>
                  </div>
                  <button className="ml-4 px-3.5 py-1.5 rounded-lg text-xs font-semibold border shrink-0 transition-colors"
                    style={{ background: col + "22", color: col, borderColor: col + "44" }}>
                    {a.action}
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}
