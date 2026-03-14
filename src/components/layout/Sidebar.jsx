import {
  Activity, Bell, Cpu, DollarSign, Eye, FileText,
  Mail, MessageSquare, Search, Server, Settings, Target, Users,
} from "lucide-react";
import { NAV } from "@/data/mockData";
import { ALERTS_DATA } from "@/data/mockData";

const ICONS = {
  overview: Activity, revenue: DollarSign, traffic: Search,
  students: Users, conversion: Target, email: Mail,
  health: Server, competitors: Eye, alerts: Bell,
  agents: Cpu, "ai-insight": MessageSquare, settings: Settings,
};

export function Sidebar({ page, setPage }) {
  const criticalCount = ALERTS_DATA.filter(a => a.level === "critical" || a.level === "high").length;

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-white dark:bg-zinc-900 border-r border-border">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">N</div>
          <div>
            <p className="text-xs font-bold tracking-widest text-foreground">NEVGO</p>
            <p className="text-[9px] text-muted-foreground tracking-widest uppercase">Agent Control</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {NAV.map((n) => {
          const Icon = ICONS[n.id];
          const active = n.id === page;
          const badgeCount = n.id === "alerts" ? criticalCount : n.badge;
          return (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors group ${
                active
                  ? "bg-violet-50 dark:bg-violet-950/50 border-l-2 border-violet-600"
                  : "border-l-2 border-transparent hover:bg-muted"
              }`}
            >
              {Icon && <Icon size={13} className={active ? "text-violet-600" : "text-muted-foreground group-hover:text-foreground"} />}
              <span className={`text-xs flex-1 ${active ? "text-violet-700 dark:text-violet-400 font-semibold" : "text-muted-foreground group-hover:text-foreground"}`}>
                {n.label}
              </span>
              {badgeCount && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  n.id === "alerts" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                }`}>
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status footer */}
      <div className="p-3 border-t border-border">
        <div className="bg-muted rounded-md px-3 py-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">All Systems Active</span>
          </div>
          <p className="text-[9px] text-muted-foreground">9 agents · 0 errors</p>
        </div>
      </div>
    </aside>
  );
}
