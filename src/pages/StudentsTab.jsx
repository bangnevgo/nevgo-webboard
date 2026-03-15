import { useState, useEffect } from "react";
import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { formatRp } from "@/lib/formatters";
import { Star, Users, BookOpen, TrendingUp } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3002";
const TEAL  = "#4ecdc4";
const RANGE_LABEL = { "1":"Hari Ini","7":"7 Hari","30":"30 Hari","90":"3 Bulan","180":"6 Bulan","365":"1 Tahun" };

export function StudentsTab({ dateRange = "30" }) {
  const [summary,  setSummary]  = useState(null);
  const [trend,    setTrend]    = useState([]);
  const [lms,      setLms]      = useState(null);
  const [loading,  setLoading]  = useState(true);

  const rangeLabel = RANGE_LABEL[dateRange] || `${dateRange} Hari`;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/students/summary?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/students/trend?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/lms/summary`).then(r => r.json()),
    ]).then(([s, t, l]) => {
      setSummary(s.error ? null : s);
      setTrend(Array.isArray(t) ? t : []);
      setLms(l.error ? null : l);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [dateRange]);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
      Memuat data siswa...
    </div>
  );

  const totalStudents = summary?.totalStudents || 0;
  const newToday      = summary?.newToday      || 0;
  const newThisWeek   = summary?.newThisWeek   || 0;
  const wcCourses     = summary?.courses        || [];
  const lmsCourses    = lms?.courses            || [];
  const totalCourses  = lms?.totalCourses       || wcCourses.length;
  const avgRating     = lms?.avgRating          || "–";

  // Gabungkan data WooCommerce + TutorLMS by name matching
  const mergedCourses = wcCourses.map(wc => {
    const lmsMatch = lmsCourses.find(l =>
      l.name.toLowerCase().includes(wc.name.toLowerCase().split(" ").slice(0,3).join(" ")) ||
      wc.name.toLowerCase().includes(l.name.toLowerCase().split(" ").slice(0,3).join(" "))
    );
    return {
      ...wc,
      rating:      lmsMatch?.rating      || 0,
      ratingCount: lmsMatch?.ratingCount || 0,
      category:    lmsMatch?.category    || "",
      lmsId:       lmsMatch?.id          || null,
    };
  });

  const maxTotal = mergedCourses[0]?.total || 1;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Section Header ── */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-4 rounded-full" style={{ background: TEAL }} />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Students Overview · WooCommerce + TutorLMS · {rangeLabel}
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={Users}     title={`Total Pembeli · ${rangeLabel}`}
          value={totalStudents.toLocaleString("id-ID")} sub="unique buyers" color={TEAL} />
        <MetricCard icon={TrendingUp} title="Enrollment Minggu Ini"
          value={`+${newThisWeek}`} sub={`+${newToday} hari ini`} color="#7c3aed" />
        <MetricCard icon={BookOpen}  title="Total Courses"
          value={totalCourses} sub="aktif di TutorLMS" color="#06b6d4" />
        <MetricCard icon={Star}      title="Avg Rating"
          value={avgRating} sub={`dari ${lmsCourses.filter(c => c.ratingCount > 0).length} course dinilai`} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-2 gap-4">

        {/* ── Enrollment per Produk (WooCommerce) ── */}
        <SectionCard>
          <CardTitle title="Enrollment per Produk" sub={`WooCommerce orders · ${rangeLabel}`} />
          {wcCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data enrollment</p>
          ) : (
            <div className="flex flex-col gap-4">
              {mergedCourses.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[12px] font-medium text-foreground truncate max-w-[200px]">{c.name}</span>
                    <span className="text-[12px] font-semibold shrink-0" style={{ color: TEAL }}>{c.total} siswa</span>
                  </div>
                  <div className="h-[2px] bg-muted rounded-full mb-1.5">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min((c.total / maxTotal) * 100, 100)}%`, background: TEAL, opacity: 0.6 }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground">Minggu ini: +{c.thisWeek}</span>
                    <span className="text-[10px] text-muted-foreground">Hari ini: +{c.today}</span>
                    <span className="text-[10px] text-muted-foreground">{formatRp(c.revenue)}</span>
                    {c.ratingCount > 0 && (
                      <span className="text-[10px] flex items-center gap-0.5 ml-auto" style={{ color: "#f59e0b" }}>
                        <Star size={9} fill="#f59e0b" strokeWidth={0} />
                        {c.rating.toFixed(1)} ({c.ratingCount})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Trend Enrollment ── */}
        <SectionCard>
          <CardTitle title="Trend Enrollment 7 Hari" sub="Jumlah produk terjual per hari" />
          {trend.length > 0 ? (
            <BarChartWrapper
              data={trend}
              series={[{ key: "enrollments", name: "Enrollment", color: "#7c3aed" }]}
              height={200}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada data trend</p>
          )}
        </SectionCard>
      </div>

      {/* ── TutorLMS Courses ── */}
      {lmsCourses.length > 0 && (
        <>
          <div className="flex items-center gap-2 px-1 mt-1">
            <div className="w-1 h-4 rounded-full" style={{ background: "#7c3aed" }} />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              TutorLMS Courses
            </p>
          </div>

          <SectionCard>
            <CardTitle title="Semua Course" sub={`${lmsCourses.length} course aktif di TutorLMS`} />
            <div className="flex flex-col">
              {lmsCourses.map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0"
                  style={{ borderColor: "hsl(var(--border))" }}>
                  <span className="text-[10px] text-muted-foreground w-5 shrink-0 tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.category} · {c.level}</p>
                  </div>
                  {c.ratingCount > 0 ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <Star size={10} fill="#f59e0b" strokeWidth={0} style={{ color: "#f59e0b" }} />
                      <span className="text-[11px] font-semibold tabular-nums" style={{ color: "#f59e0b" }}>
                        {c.rating.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">({c.ratingCount})</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground shrink-0">Belum ada rating</span>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}

    </div>
  );
}
