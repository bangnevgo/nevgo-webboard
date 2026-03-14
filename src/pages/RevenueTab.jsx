import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { TrendIndicator } from "@/components/ui/TrendIndicator";
import { AreaChartWrapper } from "@/components/charts/AreaChartWrapper";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { REV_DATA, PRODUCTS } from "@/data/mockData";
import { formatRp, formatRpCompact } from "@/lib/formatters";

export function RevenueTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "Rp 4.25M", sub: "Hari ini", trend: -12 },
          { label: "Transaksi", value: "18 orders", sub: "hari ini", trend: -3 },
          { label: "Avg Order Value", value: "Rp 236K", sub: "per transaksi", trend: 5 },
          { label: "Abandoned Carts", value: "8 carts", sub: "Rp 1.8M potential", trend: 40, inv: true },
        ].map((c, i) => (
          <MetricCard key={i} title={c.label} value={c.value} sub={c.sub}
            delta={<TrendIndicator value={c.trend} inverse={c.inv} />} />
        ))}
      </div>

      <SectionCard>
        <CardTitle title="Revenue Trend — 7 Hari" sub="Revenue & jumlah transaksi harian" />
        <AreaChartWrapper data={REV_DATA}
          series={[{ key: "rev", name: "Revenue", color: "#7c3aed" }]}
          height={220} formatter={formatRpCompact} />
      </SectionCard>

      <div className="grid grid-cols-2 gap-4">
        <SectionCard>
          <CardTitle title="Top Produk — Revenue" sub="Ranking by revenue hari ini" />
          <BarChartWrapper
            data={PRODUCTS} layout="vertical"
            series={[{ key: "revenue", name: "Revenue", color: "#7c3aed" }]}
            height={200} formatter={v => `${(v/1000000).toFixed(1)}M`} />
        </SectionCard>

        <SectionCard>
          <CardTitle title="Abandoned Cart Recovery" sub="8 carts · Rp 1.8M potential" />
          <div className="flex flex-col gap-4 mt-2">
            {[
              { step: "Email #1 (1 jam)", openRate: 55, recovery: "25%", color: "#10b981" },
              { step: "Email #2 (24 jam)", openRate: 38, recovery: "15%", color: "#06b6d4" },
              { step: "Email #3 (3 hari)", openRate: 22, recovery: "8%", color: "#7c3aed" },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">{s.step}</span>
                  <span className="text-xs font-semibold" style={{ color: s.color }}>{s.recovery} recovered</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.openRate}%`, background: s.color }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{s.openRate}% open rate</p>
              </div>
            ))}
            <div className="p-3 rounded-md bg-emerald-950/30 border border-emerald-900/50">
              <p className="text-xs font-semibold text-emerald-400">💰 Total Recovery Rate: 35% → Rp 630K expected</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-foreground mb-3">Revenue by Category</p>
            {[
              { cat: "Courses", rev: 3138000, pct: 74 },
              { cat: "Digital Products", rev: 640000, pct: 15 },
              { cat: "Coaching", rev: 472000, pct: 11 },
            ].map((r, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{r.cat}</span>
                  <span className="text-xs font-semibold font-mono text-foreground">{formatRpCompact(r.rev)}</span>
                </div>
                <div className="h-1 bg-muted rounded-full">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                    style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
