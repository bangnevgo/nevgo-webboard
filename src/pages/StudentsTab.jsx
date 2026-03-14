import { useState, useEffect } from "react";
import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { formatRp } from "@/lib/formatters";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3002";

export function StudentsTab({ dateRange = "30" }) {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/students/summary?days=${dateRange}`).then(r => r.json()),
      fetch(`${API_BASE}/api/students/trend?days=${dateRange}`).then(r => r.json()),
    ]).then(([s, t]) => {
      setSummary(s.error ? null : s);
      setTrend(Array.isArray(t) ? t : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
      Memuat data siswa...
    </div>
  );

  const totalStudents = summary?.totalStudents || 0;
  const newToday = summary?.newToday || 0;
  const newThisWeek = summary?.newThisWeek || 0;
  const courses = summary?.courses || [];

  return (
    <div className="flex flex-col gap-5">
      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Pembeli (30 hari)", value: totalStudents.toLocaleString("id-ID"), color: "#06b6d4" },
          { label: "Enrollment Baru Hari Ini", value: `+${newToday}`, color: "#10b981" },
          { label: "Enrollment Minggu Ini", value: `+${newThisWeek}`, color: "#7c3aed" },
          { label: "Produk Aktif", value: courses.length, color: "#f59e0b" },
        ].map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl px-5 py-5">
            <p className="text-xs text-muted-foreground mb-2">{c.label}</p>
            <p className="text-3xl font-extrabold tracking-tight" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Enrollment per Produk */}
        <SectionCard>
          <CardTitle title="Enrollment per Produk" sub="Berdasarkan WooCommerce orders (30 hari)" />
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data enrollment</p>
          ) : courses.map((c, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground">{c.name}</span>
                <span className="text-sm font-bold" style={{ color: "#06b6d4" }}>{c.total} siswa</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                  style={{ width: `${Math.min((c.total / (courses[0]?.total || 1)) * 100, 100)}%` }} />
              </div>
              <div className="flex gap-4 mt-1">
                <span className="text-[10px] text-muted-foreground">Minggu ini: +{c.thisWeek}</span>
                <span className="text-[10px] text-muted-foreground">Hari ini: +{c.today}</span>
                <span className="text-[10px] text-muted-foreground">{formatRp(c.revenue)}</span>
              </div>
            </div>
          ))}
        </SectionCard>

        {/* Trend Enrollment 7 Hari */}
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
          <p className="text-[11px] text-muted-foreground mt-2">
            * Data dari WooCommerce completed orders. Progress belajar memerlukan TutorLMS Pro.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
