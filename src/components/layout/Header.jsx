import { Bell } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { ALERTS_DATA, NAV } from "@/data/mockData";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function Header({ page, time }) {
  const criticalCount = ALERTS_DATA.filter(a => a.level === "critical" || a.level === "high").length;
  const currentNav = NAV.find(n => n.id === page);

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-border">
      <div>
        <h1 className="text-base font-bold text-foreground tracking-tight">{currentNav?.label}</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {time.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          {" · "}
          {time.toLocaleTimeString("id-ID")} WIB
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        {page !== "settings" && (
          <select className="text-xs bg-muted border border-border text-muted-foreground rounded-md px-3 py-1.5 outline-none cursor-pointer">
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        )}
        <ThemeToggle />
        <button className="relative w-8 h-8 flex items-center justify-center bg-muted border border-border rounded-md">
          <Bell size={13} className="text-muted-foreground" />
          {criticalCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
              {criticalCount}
            </span>
          )}
        </button>
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">A</div>
      </div>
    </header>
  );
}
