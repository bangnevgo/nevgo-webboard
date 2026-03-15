import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { ALERTS_DATA, NAV } from "@/data/mockData";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function Header({ page, dateRange, onDateRangeChange }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const criticalCount = ALERTS_DATA.filter(
    a => a.level === "critical" || a.level === "high"
  ).length;
  const currentNav = NAV.find(n => n.id === page);

  const DATE_OPTIONS = [
    { value: "1",   label: "Last 24 hours" },
    { value: "7",   label: "Last 7 days" },
    { value: "30",  label: "Last 30 days" },
    { value: "90",  label: "Last 3 months" },
    { value: "180", label: "Last 6 months" },
    { value: "365", label: "Last 1 year" },
  ];

  const dateStr = time.toLocaleDateString("id-ID", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <header className="flex-shrink-0 flex items-center justify-between h-[52px] px-6 bg-card border-b border-border gap-4">
      {/* Left — page title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-[14px] font-semibold text-foreground leading-tight truncate">
            {currentNav?.label ?? "Dashboard"}
          </h1>
          <p className="text-[11px] text-muted-foreground leading-tight">
            {dateStr}
          </p>
        </div>
      </div>

      {/* Center — Search */}
      <div className="flex-1 max-w-[260px]">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-[30px] pl-8 pr-3 text-[12px] bg-muted border border-border rounded-md
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-1 focus:ring-ring/40
              transition-colors"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/50 font-medium pointer-events-none hidden sm:block">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {page !== "settings" && (
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="h-[30px] text-[12px] w-[130px] bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value} className="text-[12px]">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Summary button */}
        <button className="h-[30px] px-3 text-[12px] font-medium text-muted-foreground border border-border rounded-md bg-muted hover:bg-muted/80 transition-colors hidden md:flex items-center gap-1.5">
          <span className="text-[11px]">📄</span>
          Summary
        </button>

        {/* ThemeToggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative h-[30px] w-[30px] flex items-center justify-center border border-border rounded-md bg-muted hover:bg-muted/80 transition-colors">
          <Bell size={13} className="text-muted-foreground" />
          {criticalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-[14px] h-[14px] bg-red-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center ring-2 ring-card">
              {criticalCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div className="w-[30px] h-[30px] rounded-full bg-[hsl(24,95%,58%)] flex items-center justify-center text-white font-semibold text-[12px] cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}
