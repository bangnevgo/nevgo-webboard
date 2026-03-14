import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { Chip } from "@/components/ui/Chip";
import { CheckCircle } from "lucide-react";
import { FUNNEL } from "@/data/mockData";

export function ConversionTab() {
  const colors = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b"];
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Overall CVR", value: "3.2%", note: "vs target 5%", color: "#f59e0b" },
          { label: "Kelas Trainer CVR", value: "0.8%", note: "67 visits, 0 konversi!", color: "#ef4444" },
          { label: "A/B Tests Active", value: "2", note: "sedang berjalan", color: "#06b6d4" },
          { label: "Checkout Completion", value: "71%", note: "cart → order", color: "#10b981" },
        ].map((c, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-border rounded-lg p-6">
            <p className="text-xs text-muted-foreground mb-2">{c.label}</p>
            <p className="text-3xl font-bold font-mono" style={{ color: c.color }}>{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.note}</p>
          </div>
        ))}
      </div>

      <SectionCard>
        <CardTitle title="Conversion Funnel — Mini Course" sub="Customer journey dari landing page ke checkout" />
        <div className="flex gap-3 items-stretch mt-2">
          {FUNNEL.map((f, i) => {
            const dropPct = [null, 18, 25, 71];
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-lg p-4 text-center border"
                  style={{ background: colors[i] + "15", borderColor: colors[i] + "40" }}>
                  <p className="text-2xl font-bold font-mono" style={{ color: colors[i] }}>{f.visitors.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">{f.stage}</p>
                </div>
                {i < FUNNEL.length - 1 && (
                  <div className="text-center">
                    <p className={`text-xs font-semibold ${dropPct[i+1] >= 50 ? "text-emerald-500" : "text-amber-500"}`}>
                      ↓ {dropPct[i+1]}%
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 rounded-md bg-red-950/20 border border-red-900/30">
          <p className="text-sm font-semibold text-red-400">⚠ Revenue Lost: Rp 962K per 1,000 visitors</p>
          <p className="text-xs text-red-500/70 mt-1">820 visitor drop off di landing → product page (82%). CTA perlu dioptimasi.</p>
        </div>
      </SectionCard>

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
