import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { TrendIndicator } from "@/components/ui/TrendIndicator";
import { Chip } from "@/components/ui/Chip";
import { AreaChartWrapper } from "@/components/charts/AreaChartWrapper";
import { PieChartWrapper } from "@/components/charts/PieChartWrapper";
import { TRAFFIC_DATA, PIE_DATA, KEYWORDS, TOP_CONTENT } from "@/data/mockData";

export function TrafficTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Visits", value: "1,456", trend: 8, color: "#06b6d4" },
          { label: "Organic Traffic", value: "1,234", trend: 12, color: "#10b981" },
          { label: "Avg Session", value: "3m 42s", trend: 5, color: "#7c3aed" },
          { label: "Bounce Rate", value: "42%", trend: -3, color: "#f59e0b", inv: true },
        ].map((c, i) => (
          <MetricCard key={i} title={c.label} value={c.value}
            delta={<TrendIndicator value={c.trend} inverse={c.inv} />}
            accent={c.color} />
        ))}
      </div>

      <SectionCard>
        <CardTitle title="Traffic Trend — 7 Hari" sub="Semua channel" />
        <AreaChartWrapper data={TRAFFIC_DATA} height={200} series={[
          { key: "organic", name: "Organic", color: "#7c3aed" },
          { key: "referral", name: "Referral", color: "#06b6d4" },
          { key: "direct", name: "Direct", color: "#10b981" },
          { key: "social", name: "Social", color: "#f59e0b" },
        ]} />
      </SectionCard>

      <div className="grid grid-cols-2 gap-4">
        <SectionCard>
          <CardTitle title="Keyword Rankings" sub="Target keyword positions" />
          <div className="flex flex-col gap-2">
            {KEYWORDS.map((k, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-md bg-muted border border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{k.keyword}</p>
                  <p className="text-[10px] text-muted-foreground">{k.vol.toLocaleString()}/mo · {k.diff}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-bold ${k.ch > 0 ? "text-emerald-500" : k.ch < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                    {k.ch > 0 ? `↑${k.ch}` : k.ch < 0 ? `↓${Math.abs(k.ch)}` : "—"}
                  </span>
                  <span className="text-sm font-bold font-mono text-foreground w-8 text-right">#{k.pos}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="flex flex-col gap-4">
          <SectionCard>
            <CardTitle title="Traffic Sources" sub="Channel distribution" />
            <div className="flex items-center gap-4">
              <PieChartWrapper data={PIE_DATA} height={150} />
              <div className="flex flex-col gap-2">
                {PIE_DATA.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-muted-foreground">{d.name}</span>
                    <span className="text-xs font-bold font-mono text-foreground ml-auto">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <CardTitle title="Top Content" sub="Conversion performance" />
            <div className="flex flex-col gap-2">
              {TOP_CONTENT.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted border border-border">
                  <p className="text-xs text-foreground font-medium flex-1 truncate pr-2">{c.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-muted-foreground">{c.views}v</span>
                    <Chip label={c.status === "good" ? "good" : "update"} level={c.status === "good" ? "good" : "warning"} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
