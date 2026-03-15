// PATCH untuk App.jsx
// Tambahkan import ini di bagian atas (setelah import SettingsTab):
// import { ComponentsTab } from "@/pages/ComponentsTab";

// Tambahkan entry ini di dalam object `pages`:
// "components": <ComponentsTab />,

// ─── FULL App.jsx yang sudah dipatch ─────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
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
import { ComponentsTab } from "@/pages/ComponentsTab";
import { DEFAULT_SETTINGS } from "@/data/mockData";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3002";

export default function App() {
  const [page, setPage] = useState("overview");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [competitorRefresh, setCompetitorRefresh] = useState(0);
  const [dateRange, setDateRange] = useState("7");

  useEffect(() => {
    fetch(`${API_BASE}/settings`).then(r => r.json()).then(d => {
      if (d && Object.keys(d).length > 0) setSettings(d);
    }).catch(() => {});
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

  // useMemo — hanya re-instantiate tab jika dependency berubah
  // Clock dihapus dari sini — dipindah ke Header
  const pages = useMemo(() => ({
    overview:    <OverviewTab settings={settings} dateRange={dateRange} />,
    revenue:     <RevenueTab dateRange={dateRange} />,
    traffic:     <TrafficTab dateRange={dateRange} />,
    students:    <StudentsTab dateRange={dateRange} />,
    conversion:  <ConversionTab dateRange={dateRange} settings={settings} />,
    email:       <EmailTab />,
    health:      <SiteHealthTab settings={settings} />,
    competitors: <CompetitorsTab refreshTrigger={competitorRefresh} />,
    alerts:      <AlertsTab />,
    agents:      <AgentsTab />,
    "ai-insight":<AIInsightTab settings={settings} onCompetitorSaved={() => setCompetitorRefresh(n => n + 1)} />,
    settings:    <SettingsTab settings={settings} onSettingsChange={handleSettingsChange} />,
    components:  <ComponentsTab />,
  }), [settings, dateRange, competitorRefresh]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar page={page} setPage={setPage} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header page={page} dateRange={dateRange} onDateRangeChange={setDateRange} />
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {pages[page]}
        </div>
      </main>
    </div>
  );
}
