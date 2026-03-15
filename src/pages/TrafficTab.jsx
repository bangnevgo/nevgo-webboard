import { useState, useEffect } from "react";
import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { AreaChartWrapper } from "@/components/charts/AreaChartWrapper";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3002";

const RANGE_LABEL = {
  "1": "Hari Ini", "7": "7 Hari", "30": "30 Hari",
  "90": "3 Bulan", "180": "6 Bulan", "365": "1 Tahun",
};

export function TrafficTab({ dateRange = "7" }) {
  const [ga4, setGa4] = useState(null);
  const [topPages, setTopPages] = useState([]);
  const [gsc, setGsc] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);

  const rangeLabel = RANGE_LABEL[dateRange] || `${dateRange} Hari`;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/ga4/today?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/ga4/top-pages?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/gsc/summary?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/gsc/keywords?days=${dateRange}`).then(r => r.json()),
    ]).then(([g4, pages, gscSum, kws]) => {
      setGa4(g4.error ? null : g4);
      setTopPages(Array.isArray(pages) ? pages : []);
      setGsc(gscSum.error ? null : gscSum);
      setKeywords(Array.isArray(kws) ? kws : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [dateRange]);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
      Memuat data traffic...
    </div>
  );

  return (
    <div className="flex flex-col gap-5">

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: `Sessions · ${rangeLabel}`, value: ga4?.sessions?.toLocaleString("id-ID") || "–", color: "#06b6d4" },
          { label: `Users · ${rangeLabel}`, value: ga4?.users?.toLocaleString("id-ID") || "–", color: "#10b981" },
          { label: `GSC Clicks · ${rangeLabel}`, value: gsc?.clicks?.toLocaleString("id-ID") || "–", color: "#7c3aed" },
          { label: "Avg Position", value: gsc ? `#${gsc.position}` : "–", color: "#f59e0b" },
        ].map((c, i) => (
          <MetricCard key={i} title={c.label} value={c.value} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Top Pages */}
        <SectionCard>
          <CardTitle title={`Top Pages · ${rangeLabel}`} sub="Google Analytics 4 — Live" />
          <div className="flex flex-col gap-2">
            {topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada data. Sambungkan GA4 di Settings.</p>
            ) : topPages.map((p, i) => (
              <div key={i} className="px-3 py-2.5 bg-muted rounded-lg border border-border">
                <div className="flex justify-between mb-1">
                  <p className="text-xs font-medium text-foreground flex-1 truncate pr-2">{p.title || p.path}</p>
                  <span className="text-sm font-bold text-violet-500 shrink-0">{p.views.toLocaleString("id-ID")}</span>
                </div>
                <div className="h-1 bg-muted rounded-full mt-1">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                    style={{ width: `${Math.min((p.views / (topPages[0]?.views || 1)) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Keywords */}
        <SectionCard>
          <CardTitle title={`Keyword Rankings · ${rangeLabel}`} sub="Google Search Console — Live" />
          <div className="flex flex-col gap-2">
            {keywords.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada data. Sambungkan GSC di Settings.</p>
            ) : keywords.map((k, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-muted rounded-lg border border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{k.keyword}</p>
                  <p className="text-[10px] text-muted-foreground">{k.clicks} clicks · CTR {k.ctr}%</p>
                </div>
                <span className="text-lg font-bold shrink-0 ml-3" style={{
                  color: k.position <= 5 ? "#10b981" : k.position <= 15 ? "#f59e0b" : "#ef4444"
                }}>#{k.position}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* GSC Summary */}
      {gsc && (
        <SectionCard>
          <CardTitle title={`Search Console Summary · ${rangeLabel}`} sub="Performa pencarian organik Nevgo" />
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Clicks", value: gsc.clicks?.toLocaleString("id-ID"), color: "#7c3aed" },
              { label: "Total Impressions", value: gsc.impressions?.toLocaleString("id-ID"), color: "#06b6d4" },
              { label: "CTR", value: `${gsc.ctr}%`, color: "#10b981" },
              { label: "Avg Position", value: `#${gsc.position}`, color: "#f59e0b" },
            ].map((m, i) => (
              <div key={i} className="p-4 bg-muted rounded-lg border border-border">
                <p className="text-[11px] text-muted-foreground mb-1.5">{m.label}</p>
                <p className="text-2xl font-extrabold" style={{ color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
