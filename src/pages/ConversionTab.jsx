import { useState, useEffect } from "react";
import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { Chip } from "@/components/ui/Chip";
import { CheckCircle } from "lucide-react";
import { formatRpCompact } from "@/lib/formatters";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3002";

const RANGE_LABEL = {
  "1": "Hari Ini", "7": "7 Hari", "30": "30 Hari",
  "90": "3 Bulan", "180": "6 Bulan", "365": "1 Tahun",
};

export function ConversionTab({ dateRange = "7" }) {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  const rangeLabel = RANGE_LABEL[dateRange] || `${dateRange} Hari`;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/revenue/today?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/midtrans/summary?days=${dateRange}`).then(r => r.json()),
    ]).then(([rev, mid]) => {
      setOrders({ revenue: rev, midtrans: mid });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [dateRange]);

  // Calculated metrics
  const total = orders?.midtrans?.total || 0;
  const completed = orders?.midtrans?.completed || 0;
  const processing = orders?.midtrans?.processing || 0;
  const pending = orders?.midtrans?.pending || 0;
  const cancelled = orders?.midtrans?.cancelled || 0;
  const revenue = orders?.revenue?.revenue || 0;
  const aov = orders?.revenue?.aov || 0;

  // CVR = completed / (completed + pending + cancelled) — rough estimate
  const cvr = total > 0 ? ((completed + processing) / total * 100).toFixed(1) : "–";
  const checkoutCompletion = total > 0 ? ((completed + processing) / total * 100).toFixed(0) : "–";
  const abandonRate = total > 0 ? (((pending + cancelled) / total) * 100).toFixed(1) : "–";

  const colors = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b"];

  const FUNNEL = [
    { stage: "Total Orders", visitors: total },
    { stage: "Processing / Completed", visitors: completed + processing },
    { stage: "Completed", visitors: completed },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: `Overall CVR · ${rangeLabel}`, value: loading ? "..." : `${cvr}%`, note: `${completed + processing} dari ${total} transaksi`, color: parseFloat(cvr) >= 80 ? "#10b981" : parseFloat(cvr) >= 60 ? "#f59e0b" : "#ef4444" },
          { label: "Checkout Completion", value: loading ? "..." : `${checkoutCompletion}%`, note: "completed + processing", color: "#10b981" },
          { label: "Abandon Rate", value: loading ? "..." : `${abandonRate}%`, note: `${pending + cancelled} pending/cancelled`, color: parseFloat(abandonRate) > 30 ? "#ef4444" : "#f59e0b" },
          { label: `Avg Order Value · ${rangeLabel}`, value: loading ? "..." : (aov > 0 ? formatRpCompact(aov) : "–"), note: "per transaksi", color: "#7c3aed" },
        ].map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl px-5 py-5">
            <p className="text-xs text-muted-foreground mb-2">{c.label}</p>
            <p className="text-2xl font-extrabold tracking-tight" style={{ color: c.color }}>{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.note}</p>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <SectionCard>
        <CardTitle title={`Conversion Funnel · ${rangeLabel}`} sub="Order flow dari total ke completed" />
        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Memuat data...</p>
        ) : (
          <>
            <div className="flex gap-3 items-stretch mt-2">
              {FUNNEL.map((f, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-lg p-4 text-center border"
                    style={{ background: colors[i] + "15", borderColor: colors[i] + "40" }}>
                    <p className="text-2xl font-bold font-mono" style={{ color: colors[i] }}>{f.visitors.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{f.stage}</p>
                  </div>
                  {i < FUNNEL.length - 1 && (
                    <div className="text-center">
                      <p className="text-xs font-semibold text-muted-foreground">↓</p>
                      <p className="text-xs font-bold text-amber-500">
                        {FUNNEL[i].visitors > 0
                          ? `${((FUNNEL[i+1].visitors / FUNNEL[i].visitors) * 100).toFixed(0)}%`
                          : "–"}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {parseFloat(abandonRate) > 20 && (
              <div className="mt-4 p-3 rounded-md bg-red-950/20 border border-red-900/30">
                <p className="text-sm font-semibold text-red-400">⚠ Abandon Rate {abandonRate}% — perlu perhatian</p>
                <p className="text-xs text-red-500/70 mt-1">{pending + cancelled} transaksi tidak selesai dalam {rangeLabel}. Cek payment method dan UX checkout.</p>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* Recommendations + High Performing */}
      <div className="grid grid-cols-2 gap-4">
        <SectionCard>
          <CardTitle title="⚡ Optimization Recommendations" />
          <div className="flex flex-col gap-3">
            {[
              { page: "Kelas Trainer Bersertifikat", issue: "Pricing tidak visible above fold + no urgency", fix: "Pindah pricing ke atas, tambah countdown + testimonial", impact: "CVR 0.8% → 2.5%" },
              { page: "Program Intensif", issue: "65% checkout abandonment — payment terbatas", fix: "Tambah OVO, GoPay, DANA + cicilan", impact: "+15% sales" },
              { page: "Checkout Page", issue: "3.2s load time, terlambat 1.2s dari target", fix: "Compress image, lazy load, enable caching", impact: "+5% completion" },
            ].map((r, i) => (
              <div key={i} className="p-3 rounded-md bg-muted border border-border">
                <p className="text-xs font-bold text-amber-500 mb-1">{r.page}</p>
                <p className="text-[11px] text-red-400 mb-1">❌ {r.issue}</p>
                <p className="text-[11px] text-emerald-400 mb-2">✅ {r.fix}</p>
                <Chip label={`Est: ${r.impact}`} level="good" />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <CardTitle title="✅ High Performing Elements" />
          <div className="flex flex-col gap-3">
            {[
              { element: "WhatsApp CTA Button", metric: "8.5% CTR", note: "Keep & amplify di semua halaman" },
              { element: '"Free Materi" Lead Magnet', metric: "23% conversion", note: "Excellent — scale up visibility" },
              { element: "Exit-Intent Popup", metric: "120 emails/week", note: "Captured — nurture via sequence" },
            ].map((e, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-md bg-emerald-950/20 border border-emerald-900/30">
                <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-400">{e.element}</p>
                  <p className="text-xl font-bold font-mono text-emerald-500">{e.metric}</p>
                  <p className="text-[10px] text-emerald-700">{e.note}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
