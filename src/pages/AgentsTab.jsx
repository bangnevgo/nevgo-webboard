import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { Chip } from "@/components/ui/Chip";
import { AGENTS } from "@/data/mockData";

export function AgentsTab() {
  return (
    <div className="flex flex-col gap-5">
      {/* Agent cards — 3 col grid, exact master layout */}
      <div className="grid grid-cols-3 gap-4">
        {AGENTS.map((a, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
            {/* Glow blob */}
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-[0.07]" style={{ background: a.color }} />
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: a.color + "22" }}>
                <a.icon size={19} style={{ color: a.color }} />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b98180]" />
                <span className="text-[10px] font-bold tracking-widest text-emerald-500">ACTIVE</span>
              </div>
            </div>
            <p className="text-sm font-bold text-foreground mb-3.5">{a.name}</p>
            <div className="flex gap-5">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Last Run</p>
                <p className="text-xs font-semibold text-muted-foreground">{a.lastRun}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Tasks Today</p>
                <p className="text-lg font-bold" style={{ color: a.color }}>{a.tasks}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Health */}
      <SectionCard>
        <CardTitle title="System Health" sub="Infrastruktur agent monitoring" />
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Agents Running", value: "9 / 9", color: "#10b981" },
            { label: "API Calls Today", value: "1,247", color: "#06b6d4" },
            { label: "Tasks Completed", value: "552", color: "#7c3aed" },
            { label: "Error Rate", value: "0.02%", color: "#10b981" },
          ].map((s, i) => (
            <div key={i} className="p-4 bg-muted rounded-lg border border-border text-center">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Integration Status */}
      <SectionCard>
        <CardTitle title="Integration Status" sub="API connections & data sources" />
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { name: "Google Analytics 4", status: "Connected", ok: true },
            { name: "Google Search Console", status: "Connected", ok: true },
            { name: "WooCommerce API", status: "Connected", ok: true },
            { name: "Email Platform (ConvertKit)", status: "Connected", ok: true },
            { name: "WhatsApp Business API", status: "Connected", ok: true },
            { name: "Midtrans Payment API", status: "Connected", ok: true },
            { name: "SEMrush API", status: "Pending Setup", ok: false },
            { name: "Hotjar Heatmaps", status: "Pending Setup", ok: false },
          ].map((s, i) => (
            <div key={i} className="flex justify-between items-center px-3 py-2.5 bg-muted rounded-lg border border-border">
              <div className="flex items-center gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? "bg-emerald-500 shadow-[0_0_5px_#10b98166]" : "bg-amber-500"}`} />
                <span className="text-xs text-muted-foreground">{s.name}</span>
              </div>
              <Chip label={s.status} level={s.ok ? "good" : "warning"} />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
