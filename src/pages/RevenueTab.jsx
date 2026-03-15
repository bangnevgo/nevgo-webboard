import { useState, useEffect } from "react";
import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { AreaChartWrapper } from "@/components/charts/AreaChartWrapper";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { formatRpCompact } from "@/lib/formatters";
import { DollarSign, TrendingUp, ShoppingBag, Star } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3002";
const COLORS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];

const RANGE_LABEL = {
  "1":   "Hari Ini",
  "7":   "7 Hari Terakhir",
  "30":  "30 Hari Terakhir",
  "90":  "3 Bulan Terakhir",
  "180": "6 Bulan Terakhir",
  "365": "1 Tahun Terakhir",
};

export function RevenueTab({ dateRange = "7" }) {
  const [today, setToday] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [products, setProducts] = useState([]);
  const [midSummary, setMidSummary] = useState(null);
  const [midMethods, setMidMethods] = useState([]);
  const [midFailed, setMidFailed] = useState([]);
  const [loading, setLoading] = useState(true);

  const rangeLabel = RANGE_LABEL[dateRange] || `${dateRange} Hari Terakhir`;
  const revenueLabel = dateRange === "1" ? "Revenue Hari Ini" : `Revenue ${rangeLabel}`;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/revenue/today?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/revenue/weekly?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/products/top?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/midtrans/summary?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/midtrans/payment-methods?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/midtrans/failed?days=${dateRange}`).then(r => r.json()),
    ]).then(([t, w, p, ms, mm, mf]) => {
      setToday(t.error ? null : t);
      setWeekly(Array.isArray(w) ? w : []);
      setProducts(Array.isArray(p) ? p : []);
      setMidSummary(ms.error ? null : ms);
      setMidMethods(Array.isArray(mm) ? mm : []);
      setMidFailed(Array.isArray(mf) ? mf : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [dateRange]);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
      Memuat data revenue...
    </div>
  );

  const revenue = today?.revenue || 0;
  const transactions = today?.transactions || 0;
  const aov = today?.aov || 0;

  return (
    <div className="flex flex-col gap-5">

      {/* ── SECTION 1: SALES PERFORMANCE ── */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-4 rounded-full bg-violet-500" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Sales Performance — WooCommerce · {rangeLabel}
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: revenueLabel, value: revenue > 0 ? formatRpCompact(revenue) : "Rp 0", sub: `${transactions} transaksi`, color: "#7c3aed", icon: DollarSign },
          { label: "Avg Order Value", value: aov > 0 ? formatRpCompact(aov) : "–", sub: "per transaksi", color: "#06b6d4", icon: TrendingUp },
          { label: "Produk Terjual", value: products.length, sub: rangeLabel, color: "#10b981", icon: ShoppingBag },
          { label: "Top Produk", value: products[0]?.name?.split(" ").slice(0, 2).join(" ") || "–", sub: `${products[0]?.sales || 0} terjual`, color: "#f59e0b", icon: Star },
        ].map((c, i) => (
          <MetricCard key={i} title={c.label} value={c.value} sub={c.sub} color={c.color} icon={c.icon} />
        ))}
      </div>

      {/* Revenue Trend Chart */}
      <SectionCard>
        <CardTitle
          title={`Revenue Trend — ${rangeLabel}`}
          sub="Revenue & jumlah transaksi harian (WooCommerce live)"
        />
        {weekly.length > 0 ? (
          <AreaChartWrapper
            data={weekly}
            series={[{ key: "rev", name: "Revenue", color: "#7c3aed" }]}
            height={220}
            formatter={formatRpCompact}
          />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-10">Belum ada data transaksi untuk periode ini</p>
        )}
      </SectionCard>

      {/* Top Produk */}
      <div className="grid grid-cols-2 gap-4">
        <SectionCard>
          <CardTitle
            title={`Top Produk — ${rangeLabel}`}
            sub="Ranking by revenue (WooCommerce live)"
          />
          {products.length > 0 ? (
            <BarChartWrapper
              data={products}
              layout="vertical"
              series={[{ key: "revenue", name: "Revenue", color: "#7c3aed" }]}
              height={200}
              formatter={v => `${(v / 1000000).toFixed(1)}M`}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada data produk</p>
          )}
        </SectionCard>

        <SectionCard>
          <CardTitle
            title="Detail Produk"
            sub={`Sales & revenue per produk · ${rangeLabel}`}
          />
          <div className="flex flex-col gap-2">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada data</p>
            ) : products.map((p, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2.5 bg-muted rounded-lg border border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.sales} terjual</p>
                </div>
                <p className="text-sm font-bold text-violet-500 shrink-0 ml-3">{formatRpCompact(p.revenue)}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── SECTION 2: PAYMENT INTELLIGENCE ── */}
      <div className="flex items-center gap-2 px-1 mt-2">
        <div className="w-1 h-4 rounded-full bg-cyan-500" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Payment Intelligence — Midtrans · {rangeLabel}
        </p>
      </div>

      {/* Midtrans KPI */}
      {midSummary && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Success Rate", value: `${midSummary.success_rate}%`, sub: `${midSummary.completed + midSummary.processing} dari ${midSummary.total} transaksi`, color: midSummary.success_rate >= 80 ? "#10b981" : midSummary.success_rate >= 60 ? "#f59e0b" : "#ef4444" },
            { label: "Revenue Settled", value: formatRpCompact(midSummary.revenue_settled), sub: `${midSummary.completed} completed`, color: "#10b981" },
            { label: "Revenue Processing", value: formatRpCompact(midSummary.revenue_processing), sub: `${midSummary.processing} processing`, color: "#f59e0b" },
            { label: "Failed / Cancelled", value: midSummary.failed + midSummary.cancelled, sub: `${midSummary.pending} masih pending`, color: midSummary.failed + midSummary.cancelled > 0 ? "#ef4444" : "#10b981" },
          ].map((c, i) => (
            <MetricCard key={i} title={c.label} value={c.value} sub={c.sub} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Payment Method Breakdown */}
        <SectionCard>
          <CardTitle
            title="Payment Method Distribution"
            sub={`Metode pembayaran · ${rangeLabel}`}
          />
          {midMethods.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data pembayaran</p>
          ) : (
            <div className="flex flex-col gap-3">
              {midMethods.map((m, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{m.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{m.count}x</span>
                      <span className="text-xs font-bold" style={{ color: COLORS[i % COLORS.length] }}>{m.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full">
                    <div className="h-full rounded-full transition-all" style={{ width: `${m.percentage}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{formatRpCompact(m.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Transaction Status */}
        <SectionCard>
          <CardTitle
            title="Transaction Status"
            sub={`Status order · ${rangeLabel}`}
          />
          {midSummary ? (
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Completed", count: midSummary.completed, color: "#10b981", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { label: "Processing", count: midSummary.processing, color: "#f59e0b", bg: "bg-amber-500/10 border-amber-500/20" },
                { label: "Pending", count: midSummary.pending, color: "#3b82f6", bg: "bg-blue-500/10 border-blue-500/20" },
                { label: "Cancelled", count: midSummary.cancelled, color: "#ef4444", bg: "bg-red-500/10 border-red-500/20" },
                { label: "Failed", count: midSummary.failed, color: "#ef4444", bg: "bg-red-500/10 border-red-500/20" },
                { label: "Refunded", count: midSummary.refunded, color: "#94a3b8", bg: "bg-muted border-border" },
              ].map((s, i) => (
                <div key={i} className={`flex justify-between items-center px-3 py-2 rounded-lg border ${s.bg}`}>
                  <span className="text-xs text-foreground">{s.label}</span>
                  <span className="text-sm font-bold" style={{ color: s.color }}>{s.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada data</p>
          )}
        </SectionCard>
      </div>

      {/* Failed Transactions Detail */}
      {midFailed.length > 0 && (
        <SectionCard>
          <CardTitle
            title="⚠ Failed / Cancelled / Pending Transactions"
            sub={`${midFailed.length} transaksi perlu perhatian · ${rangeLabel}`}
          />
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Order", "Customer", "Produk", "Total", "Metode", "Status", "Waktu"].map((h, i) => (
                  <th key={i} className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2.5 py-2 border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {midFailed.slice(0, 10).map((o, i) => {
                const statusColor = o.status === "failed" ? "#ef4444" : o.status === "cancelled" ? "#f59e0b" : "#3b82f6";
                return (
                  <tr key={i} className="border-b border-border/50">
                    <td className="text-xs font-mono text-muted-foreground px-2.5 py-2.5">#{o.id}</td>
                    <td className="text-xs text-foreground px-2.5 py-2.5">{o.customer}</td>
                    <td className="text-xs text-muted-foreground px-2.5 py-2.5 max-w-[160px] truncate">{o.items}</td>
                    <td className="text-xs font-bold text-foreground px-2.5 py-2.5">{formatRpCompact(o.total)}</td>
                    <td className="text-xs text-muted-foreground px-2.5 py-2.5">{o.payment_method}</td>
                    <td className="px-2.5 py-2.5">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ color: statusColor, background: statusColor + "20" }}>{o.status}</span>
                    </td>
                    <td className="text-[10px] text-muted-foreground px-2.5 py-2.5">{new Date(o.date).toLocaleDateString("id-ID")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </SectionCard>
      )}

    </div>
  );
}
