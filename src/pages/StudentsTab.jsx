import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { Chip } from "@/components/ui/Chip";
import { COURSES, AT_RISK } from "@/data/mockData";

export function StudentsTab() {
  return (
    <div className="flex flex-col gap-5">
      {/* KPI row — 4 col exact from master */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Aktif", value: "1,234", color: "#06b6d4" },
          { label: "Siswa Baru Hari Ini", value: "+12", color: "#10b981" },
          { label: "At-Risk (5+ days)", value: "3", color: "#ef4444" },
          { label: "Churn Rate Bulan Ini", value: "8%", color: "#f59e0b" },
        ].map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl px-5 py-5">
            <p className="text-xs text-muted-foreground mb-2">{c.label}</p>
            <p className="text-3xl font-extrabold tracking-tight" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Course Completion */}
        <SectionCard>
          <CardTitle title="Course Completion Rates" sub="Progress & drop-off per kursus" />
          {COURSES.map((c, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground">{c.name}</span>
                <div className="flex items-center gap-2">
                  {c.dropoff !== "N/A" && <span className="text-[10px] text-amber-500">⚠ Drop: {c.dropoff}</span>}
                  <span className="text-sm font-extrabold" style={{ color: c.completion >= 70 ? "#10b981" : c.completion >= 50 ? "#f59e0b" : "#ef4444" }}>{c.completion}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full">
                <div className="h-full rounded-full transition-all" style={{ width: `${c.completion}%`, background: c.completion >= 70 ? "#10b981" : c.completion >= 50 ? "#f59e0b" : "#ef4444" }} />
              </div>
              <div className="flex gap-3 mt-1">
                <span className="text-[10px] text-muted-foreground">Avg {c.avgDays} hari selesai</span>
                <span className="text-[10px] text-muted-foreground">⭐ {c.satisfaction}/5</span>
              </div>
            </div>
          ))}
        </SectionCard>

        {/* Engagement Score Ring — exact from master */}
        <SectionCard>
          <CardTitle title="Engagement Score" sub="Rata-rata: 72/100" />
          <div className="flex justify-center mb-5">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="52" fill="none" stroke="currentColor" strokeWidth="11" className="text-muted" />
                <circle cx="65" cy="65" r="52" fill="none" stroke="#7c3aed" strokeWidth="11"
                  strokeDasharray={`${2 * Math.PI * 52 * 72 / 100} ${2 * Math.PI * 52}`}
                  strokeLinecap="round" transform="rotate(-90 65 65)" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-foreground leading-none">72</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Login Frekuensi", val: 4.2, max: 7, unit: "x/minggu" },
              { label: "Lesson Completion Avg", val: 72, max: 100, unit: "%" },
              { label: "Referral Rate", val: 18, max: 100, unit: "%" },
              { label: "Course Completions Hari Ini", val: 5, max: 20, unit: " completions" },
            ].map((m, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <span className="text-xs font-semibold text-foreground">{m.val}{m.unit}</span>
                </div>
                <div className="h-1 bg-muted rounded-full">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500" style={{ width: `${(m.val / m.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* At-Risk Students */}
      <SectionCard>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm font-bold text-foreground">🚨 At-Risk Students</p>
            <p className="text-xs text-muted-foreground">Tidak login 5+ hari — butuh re-engagement segera</p>
          </div>
          <button className="text-xs px-3 py-1.5 rounded-lg bg-violet-600/10 text-violet-500 border border-violet-600/20 hover:bg-violet-600/20 transition-colors font-semibold">
            Send Batch Re-engagement
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {AT_RISK.map((s, i) => (
            <div key={i} className="flex justify-between items-center px-4 py-3 bg-muted rounded-xl border border-red-500/20">
              <div className="flex gap-3.5 items-center">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-sm">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.course} — {s.progress}% progress</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Chip label={`${s.days} hari offline`} level="critical" />
                <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 hover:bg-emerald-600/20 transition-colors font-semibold">
                  Kirim Email
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
