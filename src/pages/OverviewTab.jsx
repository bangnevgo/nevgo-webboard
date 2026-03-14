import { useState, useEffect } from "react";
import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { Chip } from "@/components/ui/Chip";
import { TrendIndicator } from "@/components/ui/TrendIndicator";
import { AreaChartWrapper } from "@/components/charts/AreaChartWrapper";
import { PieChartWrapper } from "@/components/charts/PieChartWrapper";
import { ALERTS_DATA, AGENTS } from "@/data/mockData";
import { formatRp, formatRpCompact } from "@/lib/formatters";
import { ChevronRight, DollarSign, Eye, Target, Users, Zap } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3002";

const RANGE_LABEL = {
  "1": "Hari Ini", "7": "7 Hari", "30": "30 Hari",
  "90": "3 Bulan", "180": "6 Bulan", "365": "1 Tahun",
};

async function fetchUptimeRobot(apiKey) {
  const res = await fetch("/api/uptimerobot/v2/getMonitors", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ api_key: apiKey, format: "json", response_times: "1", response_times_limit: "24", custom_uptime_ratios: "1-7-30" }),
  });
  if (!res.ok) throw new Error(`UptimeRobot ${res.status}`);
  const data = await res.json();
  if (data.stat !== "ok") throw new Error(data.error?.message || "UptimeRobot error");
  return data.monitors || [];
}

export function OverviewTab({ settings, dateRange = "7" }) {
  const highAlerts = ALERTS_DATA.filter(a => a.level === "critical" || a.level === "high");
  const [uptimeData, setUptimeData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [products, setProducts] = useState([]);
  const [studentsData, setStudentsData] = useState(null);
  const [ga4Data, setGa4Data] = useState({ activeUsers: 0, sessions: 0, pageViews: 0, users: 0, topPages: [] });
  const [gscData, setGscData] = useState({ clicks: 0, impressions: 0, ctr: "0.0", position: "0.0", keywords: [] });

  const apiKey = settings?.connectionCredentials?.uptimerobot?.apiKey || "";
  const ga4PropertyId = settings?.connectionCredentials?.ga4?.propertyId || "";
  const gscSiteUrl = settings?.connectionCredentials?.searchConsole?.siteUrl || "";
  const rangeLabel = RANGE_LABEL[dateRange] || `${dateRange} Hari`;

  // UptimeRobot — tidak perlu dateRange
  useEffect(() => {
    if (!apiKey) return;
    fetchUptimeRobot(apiKey)
      .then(monitors => setUptimeData(monitors?.[0] || null))
      .catch(() => {});
  }, [apiKey]);

  // Revenue + Products — pakai dateRange
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/revenue/today?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/products/top?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/students/summary?days=${dateRange}`).then(r => r.json()),
    ]).then(([rev, prod, stu]) => {
      setRevenueData(rev.error ? null : rev);
      setProducts(Array.isArray(prod) ? prod : []);
      setStudentsData(stu.error ? null : stu);
    }).catch(() => {});
  }, [dateRange]);

  // GA4 — pakai dateRange
  useEffect(() => {
    if (!ga4PropertyId) return;
    const fetchGA4 = async () => {
      try {
        const [rt, td, pg] = await Promise.all([
          fetch(`${API_BASE}/api/ga4/realtime`),
          fetch(`${API_BASE}/api/ga4/today?days=${dateRange}`),
          fetch(`${API_BASE}/api/ga4/top-pages?days=${dateRange}`),
        ]);
        if (rt.ok && td.ok && pg.ok) {
          const realtime = await rt.json();
          const today = await td.json();
          const pages = await pg.json();
          setGa4Data({ activeUsers: realtime.activeUsers, sessions: today.sessions, pageViews: today.pageViews, users: today.users, topPages: pages });
        }
      } catch {}
    };
    fetchGA4();
    const interval = setInterval(fetchGA4, 30000);
    return () => clearInterval(interval);
  }, [ga4PropertyId, dateRange]);

  // GSC — pakai dateRange
  useEffect(() => {
    if (!gscSiteUrl) return;
    const fetchGSC = async () => {
      try {
        const [sumRes, kwRes] = await Promise.all([
          fetch(`${API_BASE}/api/gsc/summary?days=${dateRange}`),
          fetch(`${API_BASE}/api/gsc/keywords?days=${dateRange}`),
        ]);
        if (sumRes.ok && kwRes.ok) {
          const summary = await sumRes.json();
          const keywords = await kwRes.json();
          setGscData({ ...summary, keywords });
        }
      } catch {}
    };
    fetchGSC();
    const interval = setInterval(fetchGSC, 60000);
    return () => clearInterval(interval);
  }, [gscSiteUrl, dateRange]);

  // Uptime calculations
  const statusMap = { 0: ["Paused","#475569"], 1: ["Checking","#94a3b8"], 2: ["UP","#10b981"], 8: ["Seems Down","#f59e0b"], 9: ["DOWN","#ef4444"] };
  const [statusLabel, uptimeColor] = uptimeData ? (statusMap[uptimeData.status] || ["Unknown","#475569"]) : ["–","#f59e0b"];
  const ratios = uptimeData?.custom_uptime_ratio?.split("-") || [];
  const uptime30 = ratios[2] ? parseFloat(ratios[2]).toFixed(2) + "%" : "–";
  const avgMs = uptimeData?.response_times?.length
    ? Math.round(uptimeData.response_times.reduce((s, r) => s + r.value, 0) / uptimeData.response_times.length)
    : null;
  const uptimeValue = apiKey ? (uptimeData ? uptime30 : "...") : "–";
  const uptimeSub = apiKey ? (avgMs ? `${statusLabel} · ${avgMs}ms avg` : statusLabel) : "Sambungkan UptimeRobot";

  const revenue = revenueData?.revenue || 0;
  const transactions = revenueData?.transactions || 0;
  const newStudents = studentsData?.newToday || 0;
  const totalStudents = studentsData?.totalStudents || 0;

  const kpiCards = [
    { icon: DollarSign, label: `Revenue ${rangeLabel}`, value: revenue > 0 ? formatRpCompact(revenue) : "Rp 0", sub: `${transactions} transaksi`, trend: 0, color: "#7c3aed" },
    { icon: Users, label: "Siswa Baru", value: newStudents || "–", sub: `${totalStudents} total pembeli`, trend: 0, color: "#06b6d4" },
    { icon: Eye, label: "Traffic", value: ga4PropertyId ? ga4Data.users.toLocaleString("id-ID") : "–", sub: ga4PropertyId ? `${ga4Data.sessions} sessions` : "Sambungkan GA4", trend: 0, color: "#10b981" },
    { icon: Zap, label: "Uptime", value: uptimeValue, sub: uptimeSub, trend: 0, color: uptimeColor },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl px-5 py-5 relative overflow-hidden">
            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-[0.06]" style={{ background: c.color }} />
            <div className="flex justify-between items-start mb-3.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: c.color + "22" }}>
                <c.icon size={17} style={{ color: c.color }} />
              </div>
              <TrendIndicator value={c.trend} />
            </div>
            <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
            <p className="text-2xl font-extrabold tracking-tight text-foreground">{c.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* GA4 + GSC Stats Row */}
      {(ga4PropertyId || gscSiteUrl) && (
        <div className="grid gap-4" style={{ gridTemplateColumns: ga4PropertyId && gscSiteUrl ? "1fr 1fr" : "1fr" }}>
          {ga4PropertyId && (
            <div className="rounded-xl px-5 py-5 bg-card border border-border">
              <p className="text-[11px] font-semibold tracking-widest uppercase mb-4 text-blue-400">Google Analytics 4 · {rangeLabel}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Active Users", value: ga4Data.activeUsers, sub: "realtime" },
                  { label: "Sessions", value: ga4Data.sessions.toLocaleString("id-ID"), sub: rangeLabel },
                  { label: "Page Views", value: ga4Data.pageViews.toLocaleString("id-ID"), sub: rangeLabel },
                  { label: "Users", value: ga4Data.users.toLocaleString("id-ID"), sub: rangeLabel },
                ].map((m, i) => (
                  <div key={i} className={i >= 2 ? "border-t border-border pt-3" : ""}>
                    <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                    <p className="text-3xl font-semibold text-foreground">{m.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{m.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {gscSiteUrl && (
            <div className="rounded-xl px-5 py-5 bg-card border border-border">
              <p className="text-[11px] font-semibold tracking-widest uppercase mb-4 text-emerald-400">Search Console · {rangeLabel}</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Total Clicks", value: gscData.clicks, sub: rangeLabel },
                  { label: "Impressions", value: gscData.impressions.toLocaleString("id-ID"), sub: rangeLabel },
                  { label: "CTR", value: `${gscData.ctr}%`, sub: rangeLabel },
                  { label: "Avg Position", value: `#${gscData.position}`, sub: rangeLabel },
                ].map((m, i) => (
                  <div key={i} className={i >= 2 ? "border-t border-border pt-3" : ""}>
                    <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                    <p className="text-3xl font-semibold text-foreground">{m.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{m.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alerts + Opportunities */}
      <div className="grid grid-cols-2 gap-4">
        <SectionCard>
          <div className="flex justify-between items-center mb-4">
            <CardTitle title="⚠ Active Alerts" sub="Memerlukan perhatian" />
            <Chip label={`${highAlerts.length} urgent`} level="critical" />
          </div>
          <div className="flex flex-col gap-2.5">
            {ALERTS_DATA.slice(0, 4).map(a => {
              const col = a.level === "critical" ? "#ef4444" : a.level === "high" ? "#f59e0b" : "#3b82f6";
              return (
                <div key={a.id} className="flex gap-2.5 items-start px-3.5 py-3 rounded-lg border" style={{ background: "hsl(var(--muted))", borderColor: col + "25" }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: col }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-1.5 mb-0.5">
                      <p className="text-xs font-semibold text-foreground">{a.title}</p>
                      <Chip label={a.level} level={a.level} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-1.5">{a.msg}</p>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-muted-foreground">{a.agent} • {a.time}</span>
                      <button className="text-[10px] font-bold flex items-center gap-0.5 bg-transparent border-none cursor-pointer" style={{ color: "#7c3aed" }}>
                        {a.action} <ChevronRight size={9} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex justify-between items-center mb-4">
            <CardTitle title="💡 Opportunities" sub="Quick wins & actions" />
            <Chip label="3 found" level="good" />
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: Target, title: "Trending Keyword", desc: '"manifestasi uang cepat" 2.9K/mo — belum ada artikel', impact: "+300 visits", color: "#10b981" },
              { icon: Users, title: "5 Course Completions", desc: "5 siswa selesai kursus minggu ini — minta testimonial & offer upsell", impact: "+Revenue", color: "#06b6d4" },
              { icon: Eye, title: "Competitor Gap", desc: 'Competitor ranked #2 untuk "manifestasi cepat" — kita tidak ranking', impact: "Content Opp", color: "#f59e0b" },
            ].map((o, i) => (
              <div key={i} className="flex gap-3 px-3.5 py-2.5 rounded-lg border" style={{ background: "hsl(var(--muted))", borderColor: o.color + "25" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: o.color + "22" }}>
                  <o.icon size={13} style={{ color: o.color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">{o.title}</p>
                  <p className="text-[11px] text-muted-foreground mb-1.5">{o.desc}</p>
                  <Chip label={o.impact} level="good" />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Top Produk + Agents */}
      <div className="grid grid-cols-2 gap-4">
        <SectionCard>
          <CardTitle title={`Top Produk — ${rangeLabel}`} sub="Sales & revenue breakdown" />
          <div className="flex flex-col gap-3.5">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada data produk</p>
            ) : products.map((p, i) => (
              <div key={i} className="flex gap-3 items-center">
                <span className="text-[11px] font-bold text-muted-foreground w-5 text-right shrink-0">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium text-foreground truncate max-w-[160px]">{p.name}</span>
                    <span className="text-xs font-bold text-foreground font-mono">{formatRpCompact(p.revenue)}</span>
                  </div>
                  <div className="h-0.5 bg-muted rounded-full">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                      style={{ width: `${Math.min((p.revenue / (products[0]?.revenue || 1)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{p.sales} sales</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <CardTitle title="🤖 Agent Status" sub={`${AGENTS.length} agents running • 0 errors`} />
          <div className="grid grid-cols-2 gap-2">
            {AGENTS.map((a, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 bg-muted rounded-lg border border-border">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b98166] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground">{a.lastRun}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Top Pages + Keywords */}
      {((ga4PropertyId && ga4Data.topPages.length > 0) || (gscSiteUrl && gscData.keywords.length > 0)) && (
        <div className="grid gap-4" style={{ gridTemplateColumns: ga4PropertyId && gscSiteUrl ? "1fr 1fr" : "1fr" }}>
          {ga4PropertyId && ga4Data.topPages.length > 0 && (
            <SectionCard>
              <CardTitle title="Top Pages" sub={`Google Analytics 4 · ${rangeLabel}`} />
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["#", "Halaman", "Views"].map((h, i) => (
                      <th key={i} className={`text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5 border-b border-border ${i === 2 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ga4Data.topPages.map((page, idx) => (
                    <tr key={idx} className="border-b border-border/50">
                      <td className="text-xs font-bold text-muted-foreground px-2 py-2.5 w-6">{idx + 1}</td>
                      <td className="text-xs text-foreground px-2 py-2.5 max-w-[200px] truncate">{page.title || page.path}</td>
                      <td className="text-sm font-bold px-2 py-2.5 text-right text-blue-400">{page.views.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
          )}
          {gscSiteUrl && gscData.keywords.length > 0 && (
            <SectionCard>
              <CardTitle title="Top Keywords" sub={`Search Console · ${rangeLabel}`} />
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["#", "Keyword", "Clicks", "CTR", "Pos"].map((h, i) => (
                      <th key={i} className={`text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5 border-b border-border ${i >= 2 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gscData.keywords.map((kw, idx) => (
                    <tr key={idx} className="border-b border-border/50">
                      <td className="text-xs font-bold text-muted-foreground px-2 py-2.5 w-6">{idx + 1}</td>
                      <td className="text-xs text-foreground px-2 py-2.5">{kw.keyword}</td>
                      <td className="text-sm font-bold px-2 py-2.5 text-right text-emerald-400">{kw.clicks}</td>
                      <td className="text-xs px-2 py-2.5 text-right text-muted-foreground">{kw.ctr}%</td>
                      <td className="text-sm font-bold px-2 py-2.5 text-right text-amber-500">#{kw.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}
