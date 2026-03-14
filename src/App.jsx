import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { OverviewTab } from "@/pages/OverviewTab";
import { RevenueTab } from "@/pages/RevenueTab";
import { TrafficTab } from "@/pages/TrafficTab";
import { StudentsTab } from "@/pages/StudentsTab";
import { ConversionTab } from "@/pages/ConversionTab";
import { EmailTab } from "@/pages/EmailTab";
import { SiteHealthTab } from "@/pages/SiteHealthTab";
import { CompetitorsTab } from "@/pages/CompetitorsTab";
import { AlertsTab } from "@/pages/AlertsTab";
import { AgentsTab } from "@/pages/AgentsTab";
import { AIInsightTab } from "@/pages/AIInsightTab";
import { SettingsTab } from "@/pages/SettingsTab";
import { DEFAULT_SETTINGS } from "@/data/mockData";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3002";

export default function App() {
  const [page, setPage] = useState("overview");
  const [time, setTime] = useState(new Date());
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [competitorRefresh, setCompetitorRefresh] = useState(0);
  const [dateRange, setDateRange] = useState("7"); // default: 7 hari

  useEffect(() => {
    fetch(`${API_BASE}/settings`).then(r => r.json()).then(d => {
      if (d && Object.keys(d).length > 0) setSettings(d);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSettingsChange = (section, val) => {
    setSettings(prev => {
      const next = { ...prev, [section]: val };
      fetch(`${API_BASE}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      }).catch(() => {});
      return next;
    });
  };

  const pages = {
    overview:    <OverviewTab settings={settings} dateRange={dateRange} />,
    revenue:     <RevenueTab dateRange={dateRange} />,
    traffic:     <TrafficTab dateRange={dateRange} />,
    students:    <StudentsTab dateRange={dateRange} />,
    conversion:  <ConversionTab />,
    email:       <EmailTab />,
    health:      <SiteHealthTab settings={settings} />,
    competitors: <CompetitorsTab refreshTrigger={competitorRefresh} />,
    alerts:      <AlertsTab />,
    agents:      <AgentsTab />,
    "ai-insight":<AIInsightTab settings={settings} onCompetitorSaved={() => setCompetitorRefresh(n => n + 1)} />,
    settings:    <SettingsTab settings={settings} onSettingsChange={handleSettingsChange} />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar page={page} setPage={setPage} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header page={page} time={time} dateRange={dateRange} onDateRangeChange={setDateRange} />
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {pages[page]}
        </div>
      </main>
    </div>
  );
}
