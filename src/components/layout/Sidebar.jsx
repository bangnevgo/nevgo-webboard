import {
  Activity, Bell, Cpu, DollarSign, Eye,
  HelpCircle, Mail, MessageSquare, Palette,
  Search, Server, Settings, Target, Users,
  ChevronRight,
} from "lucide-react";
import { NAV, ALERTS_DATA } from "@/data/mockData";
import { cn } from "@/lib/utils";

const ICONS = {
  overview:    Activity,
  revenue:     DollarSign,
  traffic:     Search,
  students:    Users,
  conversion:  Target,
  email:       Mail,
  health:      Server,
  competitors: Eye,
  alerts:      Bell,
  agents:      Cpu,
  "ai-insight": MessageSquare,
  components:  Palette,
  settings:    Settings,
};

const ANALYTICS_IDS = ["overview", "revenue", "traffic", "students", "conversion"];
const TOOLS_IDS     = ["email", "health", "competitors", "agents", "ai-insight"];
const OTHER_IDS     = ["alerts", "components", "settings"];

export function Sidebar({ page, setPage }) {
  const criticalCount = ALERTS_DATA.filter(
    a => a.level === "critical" || a.level === "high"
  ).length;

  function NavSection({ label, ids }) {
    return (
      <div className="mb-4">
        {label && (
          <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60 select-none">
            {label}
          </p>
        )}
        {ids.map(id => {
          const nav   = NAV.find(n => n.id === id);
          if (!nav) return null;
          const Icon  = ICONS[id];
          const active = id === page;
          const badge = id === "alerts" ? criticalCount : nav.badge;

          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-[6px] rounded-md text-left",
                "transition-colors duration-100 group",
                active
                  ? "nav-active"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {Icon && (
                <Icon
                  size={14}
                  className={cn(
                    "shrink-0 transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground/60 group-hover:text-foreground"
                  )}
                  strokeWidth={active ? 2 : 1.75}
                />
              )}
              <span className={cn(
                "flex-1 text-[12.5px] truncate",
                active ? "text-foreground font-medium" : "font-normal"
              )}>
                {nav.label}
              </span>
              {badge ? (
                <span className={cn(
                  "text-[10px] font-semibold min-w-[18px] h-[18px] rounded-full",
                  "flex items-center justify-center tabular-nums px-1",
                  id === "alerts"
                    ? "bg-red-500/15 text-red-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  {badge}
                </span>
              ) : active ? (
                <ChevronRight size={11} className="text-muted-foreground/40 shrink-0" />
              ) : null}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col bg-card border-r border-border h-full">
      {/* Logo / Workspace */}
      <div className="px-4 py-4 border-b border-border">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-[30px] h-[30px] rounded-lg bg-foreground flex items-center justify-center shrink-0">
            <span className="text-background font-bold text-sm leading-none">N</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground leading-tight">Nevgo</p>
            <p className="text-[10px] text-muted-foreground">Agent Control</p>
          </div>
        </div>

        {/* Workspace selector */}
        <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors group">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[hsl(180,58%,42%)] shrink-0" />
            <span className="text-[12px] font-medium text-foreground truncate max-w-[110px]">
              Studio Ding
            </span>
          </div>
          <ChevronRight size={11} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <NavSection label="Analytics"  ids={ANALYTICS_IDS} />
        <NavSection label="Tools"      ids={TOOLS_IDS} />
        <NavSection label=""           ids={OTHER_IDS} />
      </nav>

      {/* Bottom: Help + User */}
      <div className="border-t border-border px-2 py-2">
        <button
          className="w-full flex items-center gap-2.5 px-3 py-[6px] rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mb-0.5"
          onClick={() => setPage("settings")}
        >
          <HelpCircle size={14} className="shrink-0" strokeWidth={1.75} />
          <span className="text-[12.5px]">Help & Info</span>
        </button>
        <button
          className="w-full flex items-center gap-2.5 px-3 py-[6px] rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          onClick={() => setPage("settings")}
        >
          <Settings size={14} className="shrink-0" strokeWidth={1.75} />
          <span className="text-[12.5px]">Settings</span>
        </button>

        {/* User row */}
        <div className="mt-2 flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-muted transition-colors cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-[hsl(24,95%,58%)] flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-foreground truncate leading-tight">Admin</p>
          </div>
          <ChevronRight size={11} className="text-muted-foreground/40 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
