import { Bell } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { ALERTS_DATA, NAV } from "@/data/mockData";

export function Header({ page, time, dateRange, onDateRangeChange }) {
  const criticalCount = ALERTS_DATA.filter(a => a.level === "critical" || a.level === "high").length;
  const currentNav = NAV.find(n => n.id === page);

  const DATE_OPTIONS = [
    { value: "1",   label: "Last 24 hours" },
    { value: "7",   label: "Last 7 days" },
    { value: "30",  label: "Last 30 days" },
    { value: "90",  label: "Last 3 months" },
    { value: "180", label: "Last 6 months" },
    { value: "365", label: "Last 1 year" },
  ];

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
          <select
            value={dateRange}
            onChange={e => onDateRangeChange(e.target.value)}
            className="text-xs bg-muted border border-border text-muted-foreground rounded-md px-3 py-1.5 outline-none cursor-pointer"
          >
            {DATE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
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
