import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { Chip } from "@/components/ui/Chip";
import { EMAILS } from "@/data/mockData";
import { formatRp } from "@/lib/formatters";

export function EmailTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Email Open Rate", value: "34%", trend: 2, color: "#10b981" },
          { label: "Click-Through Rate", value: "12.4%", trend: 5, color: "#06b6d4" },
          { label: "List Size", value: "8,234", trend: 3, color: "#7c3aed" },
          { label: "Unsubscribe Rate", value: "0.8%", trend: -2, color: "#f59e0b" },
        ].map((c, i) => (
          <MetricCard key={i} title={c.label} value={c.value} />
        ))}
      </div>

      {/* Campaign table — exact from master */}
      <SectionCard>
        <CardTitle title="Campaign Performance" sub="Semua kampanye aktif" />
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Kampanye", "Dikirim", "Open Rate", "CTR", "Konversi", "Revenue"].map(h => (
                <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2.5 py-2 border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EMAILS.map((e, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="text-sm font-medium text-foreground px-2.5 py-3">{e.name}</td>
                <td className="text-sm text-muted-foreground px-2.5 py-3">{e.sent.toLocaleString()}</td>
                <td className="px-2.5 py-3">
                  <span className="text-sm font-bold" style={{ color: e.open >= 35 ? "#10b981" : e.open >= 25 ? "#f59e0b" : "#ef4444" }}>{e.open}%</span>
                </td>
                <td className="text-sm font-semibold text-cyan-500 px-2.5 py-3">{e.ctr}%</td>
                <td className="text-sm text-muted-foreground px-2.5 py-3">{e.conv}</td>
                <td className="text-sm font-bold text-foreground px-2.5 py-3">{formatRp(e.rev)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Best Subject Lines */}
        <SectionCard>
          <p className="text-sm font-bold text-foreground mb-3.5">🏆 Best Performing Subject Lines</p>
          {[
            { subj: '"❌ Kesalahan FATAL yang bikin manifestasimu GAGAL"', rate: 42 },
            { subj: '"🎁 GRATIS: Panduan 7 Hari Manifestasi Cepat"', rate: 39 },
            { subj: '"[NAMA], ini khusus untukmu..."', rate: 38 },
          ].map((s, i) => (
            <div key={i} className="px-3 py-2.5 bg-emerald-950/20 rounded-lg border border-emerald-900/30 mb-2">
              <p className="text-xs text-emerald-200">{s.subj}</p>
              <p className="text-lg font-extrabold text-emerald-500 mt-1">{s.rate}% open rate</p>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground mt-1.5">❌ Worst: "Newsletter Februari 2026" → 22% open rate</p>
        </SectionCard>

        {/* Automation Flows */}
        <SectionCard>
          <p className="text-sm font-bold text-foreground mb-3.5">🤖 Automation Flows Performance</p>
          {[
            { flow: "Welcome Sequence (5 emails)", openFlow: "45% → 38% → 28%", cvr: "15% total conversion" },
            { flow: "Cart Recovery (3 msgs)", openFlow: "55% → 38% → 22%", cvr: "35% cart recovery" },
            { flow: "Course Completion Auto", openFlow: "Triggered 5x hari ini", cvr: "Upsell email sent" },
            { flow: "Re-engagement (At-Risk)", openFlow: "Triggered 3 siswa", cvr: "Automated" },
          ].map((f, i) => (
            <div key={i} className="px-3 py-2.5 bg-muted rounded-lg border border-border mb-2">
              <p className="text-xs font-semibold text-foreground mb-1">{f.flow}</p>
              <p className="text-[11px] text-muted-foreground mb-1.5">{f.openFlow}</p>
              <Chip label={f.cvr} level="good" />
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
}
