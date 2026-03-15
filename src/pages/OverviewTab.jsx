import { useState, useEffect } from "react";
import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { AreaChartWrapper } from "@/components/charts/AreaChartWrapper";
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ALERTS_DATA, AGENTS, PIE_DATA } from "@/data/mockData";
import { formatRpCompact } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  DollarSign, Users, Eye, Zap,
  AlertTriangle, ChevronRight, TrendingUp,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3002";
const RANGE_LABEL = { "1":"Hari Ini","7":"7 Hari","30":"30 Hari","90":"3 Bulan","180":"6 Bulan","365":"1 Tahun" };

const TEAL   = "#4ecdc4";
const ORANGE = "#ff6b35";

// ── Sparkline line SVG ──────────────────────────────────────────────────────
function Sparkline({ data = [], color = TEAL, width = 72, height = 24 }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0 opacity-70">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Trend badge ─────────────────────────────────────────────────────────────
function TrendBadge({ value }) {
  if (value === undefined || value === null) return null;
  const up   = value > 0;
  const zero = value === 0;
  const color = zero ? "hsl(var(--muted-foreground))" : up ? TEAL : ORANGE;
  const Icon  = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums" style={{ color }}>
      {!zero && <Icon size={11} strokeWidth={2.5} />}
      {zero ? "–" : `${up ? "+" : ""}${value}%`}
    </span>
  );
}

// ── Revenue card — PRIMARY, ukuran dominan ──────────────────────────────────
function RevenueCard({ title, value, sub, sparkline, trend }) {
  return (
    <div className="col-span-2 rounded-xl border p-5 flex flex-col gap-4 bg-card hover:border-white/10 transition-colors duration-150"
      style={{ borderColor: "hsl(var(--border))" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-[40px] font-semibold leading-none tabular-nums" style={{ color: TEAL }}>
            {value}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 pt-0.5">
          <TrendBadge value={trend} />
          <Sparkline data={sparkline} color={TEAL} width={80} height={28} />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: "hsl(var(--border))" }}>
        <DollarSign size={11} className="text-muted-foreground shrink-0" />
        <span className="text-[11px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

// ── KPI card kecil ──────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, title, value, sub, color = TEAL }) {
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-3 bg-card hover:border-white/10 transition-colors duration-150"
      style={{ borderColor: "hsl(var(--border))" }}>
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        {Icon && (
          <div className="w-[22px] h-[22px] rounded-md flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon size={11} strokeWidth={1.5} style={{ color }} />
          </div>
        )}
      </div>
      <p className="text-[28px] font-semibold leading-none tabular-nums text-foreground">{value ?? "–"}</p>
      <p className="text-[11px] text-muted-foreground leading-tight">{sub}</p>
    </div>
  );
}

// ── Vertical divider ────────────────────────────────────────────────────────
function VDivider() {
  return <div className="w-px self-stretch shrink-0" style={{ background: "hsl(var(--border))" }} />;
}

export function OverviewTab({ settings, dateRange = "7", onNavigate }) {
  const highAlerts = ALERTS_DATA.filter(a => a.level === "critical" || a.level === "high");

  const [uptimeData,   setUptimeData]   = useState(null);
  const [revenueData,  setRevenueData]  = useState(null);
  const [weeklyData,   setWeeklyData]   = useState([]);
  const [products,     setProducts]     = useState([]);
  const [studentsData, setStudentsData] = useState(null);
  const [lmsData,      setLmsData]      = useState(null);
  const [ga4Data,      setGa4Data]      = useState({ activeUsers: 0, sessions: 0, pageViews: 0, users: 0, topPages: [] });
  const [gscData,      setGscData]      = useState({ clicks: 0, impressions: 0, ctr: "0.0", position: "0.0", keywords: [] });

  const apiKey        = settings?.connectionCredentials?.uptimerobot?.apiKey || "";
  const ga4PropertyId = settings?.connectionCredentials?.ga4?.propertyId || "";
  const gscSiteUrl    = settings?.connectionCredentials?.searchConsole?.siteUrl || "";
  const rangeLabel    = RANGE_LABEL[dateRange] || `${dateRange} Hari`;

  useEffect(() => {
    if (!apiKey) return;
    (async () => {
      try {
        const res  = await fetch("/api/uptimerobot/v2/getMonitors", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ api_key: apiKey, format: "json", response_times: "1", response_times_limit: "24", custom_uptime_ratios: "1-7-30" }),
        });
        const data = await res.json();
        if (data.stat === "ok") setUptimeData(data.monitors?.[0] || null);
      } catch {}
    })();
  }, [apiKey]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/revenue/today?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/revenue/weekly?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/products/top?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/students/summary?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/lms/summary`).then(r => r.json()),
    ]).then(([rev, weekly, prod, stu, lms]) => {
      setRevenueData(rev.error ? null : rev);
      setWeeklyData(Array.isArray(weekly) ? weekly : []);
      setProducts(Array.isArray(prod) ? prod : []);
      setStudentsData(stu.error ? null : stu);
      setLmsData(lms.error ? null : lms);
    }).catch(() => {});
  }, [dateRange]);

  useEffect(() => {
    if (!ga4PropertyId) return;
    const f = async () => {
      try {
        const [rt, td, pg] = await Promise.all([
          fetch(`${API_BASE}/api/ga4/realtime`),
          fetch(`${API_BASE}/api/ga4/today?days=${dateRange}`),
          fetch(`${API_BASE}/api/ga4/top-pages?days=${dateRange}`),
        ]);
        if (rt.ok && td.ok && pg.ok) {
          const [realtime, today, pages] = await Promise.all([rt.json(), td.json(), pg.json()]);
          setGa4Data({ activeUsers: realtime.activeUsers, sessions: today.sessions, pageViews: today.pageViews, users: today.users, topPages: pages });
        }
      } catch {}
    };
    f();
    const t = setInterval(f, 30000);
    return () => clearInterval(t);
  }, [ga4PropertyId, dateRange]);

  useEffect(() => {
    if (!gscSiteUrl) return;
    const f = async () => {
      try {
        const [s, k] = await Promise.all([
          fetch(`${API_BASE}/api/gsc/summary?days=${dateRange}`),
          fetch(`${API_BASE}/api/gsc/keywords?days=${dateRange}`),
        ]);
        if (s.ok && k.ok) {
          const [summary, keywords] = await Promise.all([s.json(), k.json()]);
          setGscData({ ...summary, keywords });
        }
      } catch {}
    };
    f();
    const t = setInterval(f, 60000);
    return () => clearInterval(t);
  }, [gscSiteUrl, dateRange]);

  const statusMap   = { 0:["Paused","#555"], 1:["Checking","#888"], 2:["UP",TEAL], 8:["Seems Down",ORANGE], 9:["DOWN","#ef4444"] };
  const [statusLabel, uptimeColor] = uptimeData ? (statusMap[uptimeData.status] || ["Unknown","#555"]) : ["–", TEAL];
  const ratios    = uptimeData?.custom_uptime_ratio?.split("-") || [];
  const uptime30  = ratios[2] ? parseFloat(ratios[2]).toFixed(2) + "%" : "–";
  const avgMs     = uptimeData?.response_times?.length
    ? Math.round(uptimeData.response_times.reduce((s, r) => s + r.value, 0) / uptimeData.response_times.length) : null;

  const revenue       = revenueData?.revenue || 0;
  const transactions  = revenueData?.transactions || 0;
  const revenueChange = revenueData?.change ?? null;
  const miniCourse    = studentsData?.courses?.find(c => c.name?.includes("Mini Course") || c.name?.includes("Arsitek"));
  const lmsMiniCourse = lmsData?.courses?.find(c => c.name?.includes("Mini Course") || c.name?.includes("Arsitek"));
  const newStudents   = dateRange === "1" ? (miniCourse?.today ?? 0) : dateRange === "7" ? (miniCourse?.thisWeek ?? 0) : (miniCourse?.total ?? 0);
  const totalStudents = miniCourse?.total ?? studentsData?.totalStudents ?? 0;
  const miniRating    = lmsMiniCourse?.rating || 0;
  const miniRatingCount = lmsMiniCourse?.ratingCount || 0;
  const maxProductRev = products[0]?.revenue || 1;
  const revSparkline  = weeklyData.slice(-7).map(d => d.rev || 0);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Alert Banner ── */}
      {highAlerts.length > 0 && (
        <button onClick={() => onNavigate?.("alerts")}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all duration-150 hover:brightness-110"
          style={{ background: "rgba(255,107,53,0.07)", borderColor: "rgba(255,107,53,0.25)" }}>
          <AlertTriangle size={13} style={{ color: ORANGE, flexShrink: 0 }} strokeWidth={1.5} />
          <span className="text-[12px] font-semibold" style={{ color: ORANGE }}>
            {highAlerts.length} alert aktif
          </span>
          <span className="text-[11px] text-muted-foreground flex-1 hidden sm:block truncate">
            {highAlerts[0]?.title}{highAlerts.length > 1 ? ` · +${highAlerts.length - 1} lainnya` : ""}
          </span>
          <ChevronRight size={12} style={{ color: ORANGE, opacity: 0.5 }} />
        </button>
      )}

      {/* ── Row 1: Revenue (col-span-2, 40%) + 3 KPI kecil (masing-masing 20%) ── */}
      <div className="grid grid-cols-5 gap-3">
        <RevenueCard
          title={`Revenue ${rangeLabel}`}
          value={revenue > 0 ? formatRpCompact(revenue) : "Rp 0"}
          sub={`${transactions} transaksi`}
          sparkline={revSparkline}
          trend={revenueChange}
        />
        <KpiCard icon={Users} title="Siswa Mini Course"
          value={newStudents || "–"} sub={miniRating > 0 ? `${totalStudents} total · ⭐ ${miniRating.toFixed(1)} (${miniRatingCount})` : `${totalStudents} total`} />
        <KpiCard icon={Eye} title="Pengguna"
          value={ga4PropertyId ? ga4Data.users.toLocaleString("id-ID") : "–"}
          sub={ga4PropertyId ? `${ga4Data.sessions} sessions` : "Sambungkan GA4"} />
        <KpiCard icon={Zap} title="Uptime 30d"
          value={apiKey ? (uptimeData ? uptime30 : "…") : "–"}
          sub={apiKey ? (avgMs ? `${statusLabel} · ${avgMs}ms` : statusLabel) : "Sambungkan UptimeRobot"}
          color={uptimeColor} />
      </div>

      {/* ── Row 2: Chart 60% + Traffic 40% ── */}
      <div className="grid grid-cols-5 gap-3">
        <SectionCard className="col-span-3">
          <CardTitle title={`Revenue Trend — ${rangeLabel}`} sub="WooCommerce live" />
          {weeklyData.length > 0 ? (
            <AreaChartWrapper data={weeklyData} series={[{ key: "rev", name: "Revenue", color: TEAL }]}
              height={180} formatter={formatRpCompact} />
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center gap-2">
              <TrendingUp size={20} className="text-muted-foreground/20" strokeWidth={1} />
              <p className="text-[12px] text-muted-foreground">Belum ada data transaksi</p>
            </div>
          )}
        </SectionCard>

        <SectionCard className="col-span-2">
          <CardTitle title="Traffic Source" sub={rangeLabel} />
          <div style={{ height: "160px" }} className="w-full mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={PIE_DATA.map(d => ({ name: d.name, value: d.value, color: d.color }))}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                barCategoryGap="28%"
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                />
                <Tooltip
                  formatter={v => [`${v}%`, "Traffic"]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20} label={{ position: "right", fontSize: 11, fill: "hsl(var(--muted-foreground))", formatter: v => `${v}%` }}>
                  {PIE_DATA.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* ── Row 3: GA4 + GSC ── */}
      {(ga4PropertyId || gscSiteUrl) && (
        <div className="grid grid-cols-2 gap-3">
          {ga4PropertyId && (
            <SectionCard>
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-4" style={{ color: TEAL }}>
                Google Analytics 4 · {rangeLabel}
              </p>
              <div className="flex items-stretch gap-6">
                {[
                  { label: "Active Now", value: ga4Data.activeUsers, accent: true },
                  { label: "Sessions",   value: ga4Data.sessions.toLocaleString("id-ID") },
                  { label: "Page Views", value: ga4Data.pageViews.toLocaleString("id-ID") },
                  { label: "Users",      value: ga4Data.users.toLocaleString("id-ID") },
                ].map((m, i) => (
                  <div key={i} className="flex items-stretch gap-6">
                    {i > 0 && <VDivider />}
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{m.label}</p>
                      <p className="text-[22px] font-semibold tabular-nums leading-none"
                        style={{ color: m.accent ? TEAL : "hsl(var(--foreground))" }}>{m.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
          {gscSiteUrl && (
            <SectionCard>
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-4" style={{ color: TEAL }}>
                Search Console · {rangeLabel}
              </p>
              <div className="flex items-stretch gap-6">
                {[
                  { label: "Clicks",  value: gscData.clicks, accent: true },
                  { label: "Impresi", value: Number(gscData.impressions).toLocaleString("id-ID") },
                  { label: "CTR",     value: `${gscData.ctr}%` },
                  { label: "Posisi",  value: `#${gscData.position}` },
                ].map((m, i) => (
                  <div key={i} className="flex items-stretch gap-6">
                    {i > 0 && <VDivider />}
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{m.label}</p>
                      <p className="text-[22px] font-semibold tabular-nums leading-none"
                        style={{ color: m.accent ? TEAL : "hsl(var(--foreground))" }}>{m.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      )}

      {/* ── Row 4: Top Produk + Keywords + Pages ── */}
      <div className="grid grid-cols-3 gap-3">
        <SectionCard>
          <CardTitle title="Top Produk" sub={rangeLabel} />
          {products.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">Belum ada data</p>
          ) : (
            <div className="flex flex-col gap-3">
              {products.slice(0, 5).map((p, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] tabular-nums shrink-0 font-semibold text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[12px] text-foreground truncate">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <TrendBadge value={p.change} />
                      <span className="text-[12px] font-semibold tabular-nums" style={{ color: TEAL }}>
                        {formatRpCompact(p.revenue)}
                      </span>
                    </div>
                  </div>
                  <div className="h-[2px] rounded-full" style={{ background: "hsl(var(--muted))" }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${Math.min((p.revenue / maxProductRev) * 100, 100)}%`, background: TEAL, opacity: 0.5 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <CardTitle title="Top Keywords" sub={`GSC · ${rangeLabel}`} />
          {gscData.keywords.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">Sambungkan Search Console</p>
          ) : (
            <div className="flex flex-col">
              {gscData.keywords.slice(0, 6).map((kw, i) => (
                <div key={i} className="flex items-center gap-2 py-2 border-b last:border-0"
                  style={{ borderColor: "hsl(var(--border))" }}>
                  <span className="text-[10px] text-muted-foreground w-4 shrink-0 tabular-nums">{i + 1}</span>
                  <span className="text-[11.5px] text-foreground flex-1 truncate">{kw.keyword}</span>
                  <span className="text-[11px] tabular-nums shrink-0 font-medium" style={{ color: TEAL }}>{kw.clicks} klik</span>
                  <span className="text-[10.5px] tabular-nums shrink-0 w-8 text-right text-muted-foreground">#{kw.position}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard>
          <CardTitle title="Top Pages" sub={`GA4 · ${rangeLabel}`} />
          {ga4Data.topPages.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">Sambungkan GA4</p>
          ) : (
            <div className="flex flex-col">
              {ga4Data.topPages.slice(0, 6).map((page, i) => (
                <div key={i} className="flex items-center gap-2 py-2 border-b last:border-0"
                  style={{ borderColor: "hsl(var(--border))" }}>
                  <span className="text-[10px] text-muted-foreground w-4 shrink-0 tabular-nums">{i + 1}</span>
                  <span className="text-[11.5px] text-foreground flex-1 truncate">{page.title || page.path}</span>
                  <span className="text-[11.5px] font-semibold tabular-nums shrink-0" style={{ color: TEAL }}>
                    {page.views.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Row 5: Agent Status ── */}
      <SectionCard>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: TEAL }}>
            Agent Status
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: TEAL }} />
            <span className="text-[11px] text-muted-foreground">{AGENTS.length} running · 0 errors</span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {AGENTS.map((a, i) => (
            <div key={i}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors duration-150 hover:border-white/10"
              style={{ background: "hsl(var(--muted))", borderColor: "hsl(var(--border))" }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: TEAL }} />
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-foreground truncate">{a.name}</p>
                <p className="text-[10px] text-muted-foreground">{a.lastRun}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

    </div>
  );
}
