import { useState, useEffect } from "react";
import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatRpCompact } from "@/lib/formatters";
import { Target, XCircle, TrendingUp, CheckCircle, Sparkles, RefreshCw } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3002";

const RANGE_LABEL = {
  "1": "Hari Ini", "7": "7 Hari", "30": "30 Hari",
  "90": "3 Bulan", "180": "6 Bulan", "365": "1 Tahun",
};

const TEAL   = "#4ecdc4";
const ORANGE = "#ff6b35";

const SYSTEM_PROMPT = `Kamu adalah Conversion Analyst untuk Nevgo Institute, platform edukasi Law of Assumption (LOAS) di Indonesia.

Berdasarkan data konversi yang diberikan, berikan analisis dalam format JSON EXACT berikut (tanpa markdown, tanpa komentar):
{
  "recommendations": [
    { "page": "nama halaman/area", "issue": "masalah yang teridentifikasi", "fix": "solusi konkret", "impact": "estimasi dampak" },
    { "page": "...", "issue": "...", "fix": "...", "impact": "..." },
    { "page": "...", "issue": "...", "fix": "...", "impact": "..." }
  ],
  "highlights": [
    { "element": "elemen yang perform", "metric": "angka metrik", "note": "rekomendasi lanjutan" },
    { "element": "...", "metric": "...", "note": "..." },
    { "element": "...", "metric": "...", "note": "..." }
  ]
}

Gunakan Bahasa Indonesia. Jadikan recommendations spesifik berdasarkan data real. Jika abandon rate tinggi, fokus ke sana. Jika CVR rendah, berikan saran konkret.`;

export function ConversionTab({ dateRange = "7", settings }) {
  const [orders,          setOrders]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [aiInsight,       setAiInsight]       = useState(null);
  const [aiLoading,       setAiLoading]       = useState(false);
  const [aiError,         setAiError]         = useState(null);

  const rangeLabel = RANGE_LABEL[dateRange] || `${dateRange} Hari`;
  const apiKey     = settings?.connectionCredentials?.openrouter?.apiKey || "";

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/revenue/today?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/midtrans/summary?days=${dateRange}`).then(r => r.json()),
    ]).then(([rev, mid]) => {
      setOrders({ revenue: rev, midtrans: mid });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [dateRange]);

  // Auto-generate AI insight when data loads
  useEffect(() => {
    if (!orders || !apiKey) return;
    generateInsight();
  }, [orders, apiKey]);

  const generateInsight = async () => {
    if (!apiKey) { setAiError("OpenRouter API key belum diset di Settings."); return; }
    setAiLoading(true);
    setAiError(null);

    const dataContext = {
      periode: rangeLabel,
      total_orders: orders?.midtrans?.total || 0,
      completed: orders?.midtrans?.completed || 0,
      processing: orders?.midtrans?.processing || 0,
      pending: orders?.midtrans?.pending || 0,
      cancelled: orders?.midtrans?.cancelled || 0,
      failed: orders?.midtrans?.failed || 0,
      revenue_settled: orders?.midtrans?.revenue_settled || 0,
      aov: orders?.revenue?.aov || 0,
      cvr: orders?.midtrans?.total > 0
        ? ((( (orders?.midtrans?.completed || 0) + (orders?.midtrans?.processing || 0)) / orders?.midtrans?.total) * 100).toFixed(1)
        : 0,
      abandon_rate: orders?.midtrans?.total > 0
        ? ((((orders?.midtrans?.pending || 0) + (orders?.midtrans?.cancelled || 0)) / orders?.midtrans?.total) * 100).toFixed(1)
        : 0,
    };

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": import.meta.env.VITE_APP_URL || "http://localhost:5173",
        },
        body: JSON.stringify({
          model: "anthropic/claude-haiku-4-5",
          max_tokens: 1000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Data konversi:\n${JSON.stringify(dataContext, null, 2)}` },
          ],
        }),
      });

      const data  = await res.json();
      const text  = data.choices?.[0]?.message?.content || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAiInsight(parsed);
    } catch (e) {
      setAiError("Gagal generate insight. Coba refresh.");
    } finally {
      setAiLoading(false);
    }
  };

  const total      = orders?.midtrans?.total || 0;
  const completed  = orders?.midtrans?.completed || 0;
  const processing = orders?.midtrans?.processing || 0;
  const pending    = orders?.midtrans?.pending || 0;
  const cancelled  = orders?.midtrans?.cancelled || 0;
  const aov        = orders?.revenue?.aov || 0;

  const cvr         = total > 0 ? ((completed + processing) / total * 100).toFixed(1) : "–";
  const abandonRate = total > 0 ? (((pending + cancelled) / total) * 100).toFixed(1) : "–";
  const cvrColor    = parseFloat(cvr) >= 80 ? TEAL : parseFloat(cvr) >= 60 ? "#f59e0b" : ORANGE;
  const abandonColor = parseFloat(abandonRate) > 30 ? ORANGE : "#f59e0b";

  const FUNNEL_STEPS = [
    { label: "Total Orders",           value: total,                  color: "#7c3aed" },
    { label: "Processing + Completed", value: completed + processing, color: TEAL },
    { label: "Completed",              value: completed,              color: "#10b981" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
      Memuat data...
    </div>
  );

  return (
    <div className="flex flex-col gap-5">

      {/* ── Section Header ── */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-4 rounded-full" style={{ background: TEAL }} />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Conversion Overview — Midtrans · {rangeLabel}
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={Target}      title={`Overall CVR · ${rangeLabel}`}
          value={`${cvr}%`} sub={`${completed + processing} dari ${total} transaksi`} color={cvrColor} />
        <MetricCard icon={CheckCircle} title="Checkout Completion"
          value={total > 0 ? `${((completed + processing) / total * 100).toFixed(0)}%` : "–"}
          sub="completed + processing" color={TEAL} />
        <MetricCard icon={XCircle}     title="Abandon Rate"
          value={`${abandonRate}%`} sub={`${pending + cancelled} pending / cancelled`} color={abandonColor} />
        <MetricCard icon={TrendingUp}  title={`Avg Order Value · ${rangeLabel}`}
          value={aov > 0 ? formatRpCompact(aov) : "–"} sub="per transaksi" color="#7c3aed" />
      </div>

      {/* ── Conversion Funnel ── */}
      <SectionCard>
        <CardTitle title={`Conversion Funnel · ${rangeLabel}`} sub="Order flow dari total ke completed" />
        <div className="flex gap-3 items-stretch mt-2">
          {FUNNEL_STEPS.map((f, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-lg p-4 text-center border"
                style={{ background: f.color + "15", borderColor: f.color + "40" }}>
                <p className="text-[28px] font-semibold tabular-nums leading-none" style={{ color: f.color }}>
                  {f.value.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-2">{f.label}</p>
              </div>
              {i < FUNNEL_STEPS.length - 1 && (
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">↓</p>
                  <p className="text-[12px] font-semibold" style={{ color: "#f59e0b" }}>
                    {FUNNEL_STEPS[i].value > 0
                      ? `${((FUNNEL_STEPS[i + 1].value / FUNNEL_STEPS[i].value) * 100).toFixed(0)}%`
                      : "–"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        {parseFloat(abandonRate) > 20 && (
          <div className="mt-4 p-3 rounded-lg border"
            style={{ background: `${ORANGE}10`, borderColor: `${ORANGE}30` }}>
            <p className="text-[12px] font-semibold" style={{ color: ORANGE }}>
              Abandon Rate {abandonRate}% — perlu perhatian
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {pending + cancelled} transaksi tidak selesai dalam {rangeLabel}. Cek payment method dan UX checkout.
            </p>
          </div>
        )}
      </SectionCard>

      {/* ── AI Insights ── */}
      <div className="flex items-center justify-between px-1 mt-1">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full" style={{ background: "#7c3aed" }} />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            AI Insights & Recommendations
          </p>
        </div>
        <button
          onClick={generateInsight}
          disabled={aiLoading || !apiKey}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors duration-150 disabled:opacity-40"
          style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
        >
          <RefreshCw size={11} className={aiLoading ? "animate-spin" : ""} />
          {aiLoading ? "Generating..." : "Refresh"}
        </button>
      </div>

      {/* Error state */}
      {aiError && (
        <div className="p-3 rounded-lg border text-[12px]"
          style={{ background: `${ORANGE}10`, borderColor: `${ORANGE}30`, color: ORANGE }}>
          {aiError}
        </div>
      )}

      {/* No API key */}
      {!apiKey && (
        <div className="p-4 rounded-lg border text-[12px] text-muted-foreground"
          style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--muted))" }}>
          Sambungkan OpenRouter API key di Settings untuk mengaktifkan AI insights.
        </div>
      )}

      {/* Loading skeleton */}
      {aiLoading && !aiInsight && (
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map(i => (
            <SectionCard key={i}>
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map(j => (
                  <div key={j} className="p-3 rounded-lg animate-pulse"
                    style={{ background: "hsl(var(--muted))", height: 72 }} />
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      {/* AI Results */}
      {aiInsight && (
        <div className="grid grid-cols-2 gap-4">

          {/* Recommendations */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={13} style={{ color: ORANGE }} />
              <p className="text-[13px] font-semibold text-foreground">Optimization Recommendations</p>
            </div>
            <div className="flex flex-col gap-3">
              {aiInsight.recommendations?.map((r, i) => (
                <div key={i} className="p-3 rounded-lg border"
                  style={{ background: "hsl(var(--muted))", borderColor: "hsl(var(--border))" }}>
                  <p className="text-[11px] font-semibold text-foreground mb-1">{r.page}</p>
                  <p className="text-[11px] text-muted-foreground mb-1">{r.issue}</p>
                  <p className="text-[11px] mb-2" style={{ color: TEAL }}>{r.fix}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${TEAL}15`, color: TEAL }}>
                    Est: {r.impact}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* High Performing */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={13} style={{ color: TEAL }} />
              <p className="text-[13px] font-semibold text-foreground">High Performing Elements</p>
            </div>
            <div className="flex flex-col gap-3">
              {aiInsight.highlights?.map((e, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg border"
                  style={{ background: `${TEAL}08`, borderColor: `${TEAL}25` }}>
                  <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: TEAL }} />
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: TEAL }}>{e.element}</p>
                    <p className="text-[22px] font-semibold tabular-nums leading-tight text-foreground">{e.metric}</p>
                    <p className="text-[10px] text-muted-foreground">{e.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

    </div>
  );
}
