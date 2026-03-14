import { useState, useEffect } from "react";
import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { Chip } from "@/components/ui/Chip";
import { TrendIndicator } from "@/components/ui/TrendIndicator";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function CompetitorsTab({ refreshTrigger }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/competitors/data`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading) return <div className="text-muted-foreground text-center py-10">Loading...</div>;

  if (!data) return (
    <div className="text-center py-10 text-muted-foreground">
      <p className="text-sm mb-2">Belum ada data analisa kompetitor.</p>
      <p className="text-xs">Buka <strong className="text-foreground">AI Agent Insight → Competitor Pipeline</strong> dan jalankan analisa pertama.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {data.analyzedAt && (
        <p className="text-[11px] text-muted-foreground text-right">
          Last analyzed: {new Date(data.analyzedAt).toLocaleString("id-ID")}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        {data.competitors.map((c, i) => (
          <SectionCard key={i} className="border" style={{ borderColor: c.threat === "high" ? "#ef444430" : "#f59e0b30" }}>
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-foreground mb-1.5">{c.name}</p>
                <Chip label={`${c.threat} threat`} level={c.threat === "high" ? "critical" : "high"} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold leading-none text-foreground">{(c.traffic / 1000).toFixed(0)}K</p>
                <TrendIndicator value={c.change} />
                <p className="text-[10px] text-muted-foreground mt-0.5">visits/month</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {c.newProduct && (
                <div className="px-3 py-2.5 bg-muted rounded-lg border border-border">
                  <p className="text-[10px] text-muted-foreground mb-1">🆕 New Product Launch</p>
                  <p className="text-sm font-semibold text-amber-500">{c.newProduct}</p>
                </div>
              )}
              <div className="px-3 py-2.5 bg-muted rounded-lg border border-border">
                <p className="text-[10px] text-muted-foreground mb-1">Content Published This Week</p>
                <p className="text-sm text-foreground">{c.content} artikel baru</p>
              </div>
              {c.topKW?.length > 0 && (
                <div className="px-3 py-2.5 bg-muted rounded-lg border border-border">
                  <p className="text-[10px] text-muted-foreground mb-1.5">Keywords They Rank — We Don't</p>
                  {c.topKW.map((kw, j) => (
                    <p key={j} className="text-xs text-red-400 mb-1">❌ {kw}</p>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        ))}
      </div>

      {/* SWOT */}
      <SectionCard>
        <CardTitle title="Market Position Analysis" sub="SWOT vs Direct Competitors" />
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-bold text-emerald-500 mb-2.5">✅ Strengths</p>
            {data.swot.strengths.map((s, i) => (
              <p key={i} className="text-xs text-emerald-400 mb-1.5 pl-3 border-l-2 border-emerald-500">{s}</p>
            ))}
          </div>
          <div>
            <p className="text-sm font-bold text-amber-500 mb-2.5">⚠ Weaknesses / Gaps</p>
            {data.swot.weaknesses.map((w, i) => (
              <p key={i} className="text-xs text-amber-400 mb-1.5 pl-3 border-l-2 border-amber-500">{w}</p>
            ))}
          </div>
        </div>
        <div className="mt-5 px-4 py-3.5 bg-muted rounded-xl border border-border">
          <p className="text-sm font-bold text-violet-500 mb-2">💡 Recommended Actions from Intel</p>
          <div className="grid grid-cols-2 gap-2.5">
            {data.recommendations.map((a, i) => (
              <p key={i} className="text-xs text-violet-400 pl-3 border-l-2 border-violet-600">{a}</p>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
