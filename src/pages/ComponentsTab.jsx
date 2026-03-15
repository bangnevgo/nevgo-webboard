/**
 * ComponentsTab — Showcase semua UI komponen
 * Gunakan tab ini untuk preview sebelum mengganti komponen di halaman production
 */
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { TrendIndicator } from "@/components/ui/TrendIndicator";
import { Chip } from "@/components/ui/Chip";
import { DataTable } from "@/components/ui/DataTable";
import { AreaChartWrapper } from "@/components/charts/AreaChartWrapper";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { PieChartWrapper } from "@/components/charts/PieChartWrapper";
import {
  DollarSign, Users, Eye, Zap, Target, TrendingUp,
  ShoppingCart, Mail, Activity, BarChart2,
} from "lucide-react";
import { formatRpCompact } from "@/lib/formatters";

// ─── Mock data ────────────────────────────────────────────────────────────────

const AREA_DATA = [
  { day: "Sen", revenue: 3800000, visitors: 980 },
  { day: "Sel", revenue: 5200000, visitors: 1100 },
  { day: "Rab", revenue: 4100000, visitors: 950 },
  { day: "Kam", revenue: 6800000, visitors: 1350 },
  { day: "Jum", revenue: 4900000, visitors: 1180 },
  { day: "Sab", revenue: 7200000, visitors: 890 },
  { day: "Min", revenue: 4250000, visitors: 1234 },
];

const BAR_DATA = [
  { name: "Mini Course", revenue: 888000 },
  { name: "Intensif", revenue: 2250000 },
  { name: "Ebook", revenue: 640000 },
  { name: "Webinar", revenue: 375000 },
  { name: "Mentoring", revenue: 1500000 },
];

const PIE_DATA = [
  { name: "Organic", value: 68, color: "#7c3aed" },
  { name: "Referral", value: 16, color: "#06B6D4" },
  { name: "Direct", value: 11, color: "#10B981" },
  { name: "Social", value: 5, color: "#F59E0B" },
];

const TABLE_DATA = [
  { id: 1, rank: 1, keyword: "neville goddard indonesia", clicks: 320, ctr: "8.2%", position: "#2" },
  { id: 2, rank: 2, keyword: "law of assumption", clicks: 210, ctr: "5.4%", position: "#4" },
  { id: 3, rank: 3, keyword: "belajar manifestasi", clicks: 145, ctr: "3.1%", position: "#9" },
  { id: 4, rank: 4, keyword: "revision technique loas", clicks: 98, ctr: "6.7%", position: "#6" },
  { id: 5, rank: 5, keyword: "kelas law of assumption", clicks: 54, ctr: "4.2%", position: "#12" },
];

const TABLE_COLS = [
  { key: "rank", label: "#", width: "w-6", align: "right",
    render: (v) => <span className="font-bold text-muted-foreground">{v}</span> },
  { key: "keyword", label: "Keyword", align: "left" },
  { key: "clicks", label: "Clicks", align: "right",
    render: (v) => <span className="font-mono font-bold text-emerald-500">{v}</span> },
  { key: "ctr", label: "CTR", align: "right",
    render: (v) => <span className="text-muted-foreground">{v}</span> },
  { key: "position", label: "Pos", align: "right",
    render: (v) => <span className="font-bold text-amber-500">{v}</span> },
];

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </div>
  );
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

export function ComponentsTab() {
  return (
    <div className="flex flex-col gap-8 pb-8">

      {/* ── MetricCard ───────────────────────────────────────────── */}
      <Section title="MetricCard">
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Revenue 7 Hari"
            value="Rp 36.2M"
            sub="148 transaksi"
            trend={12.4}
            icon={DollarSign}
            accentColor="#7c3aed"
          />
          <MetricCard
            title="Siswa Baru"
            value="47"
            sub="1,204 total pembeli"
            trend={-3.1}
            icon={Users}
            accentColor="#06b6d4"
          />
          <MetricCard
            title="Traffic"
            value="7,683"
            sub="4,210 sessions"
            trend={8.7}
            icon={Eye}
            accentColor="#10b981"
          />
          <MetricCard
            title="Uptime"
            value="99.98%"
            sub="UP · 142ms avg"
            trend={0}
            icon={Zap}
            accentColor="#10b981"
          />
        </div>

        {/* MetricCard dengan chart di dalam */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <MetricCard
            title="Revenue dengan Sparkline"
            value="Rp 36.2M"
            sub="7 hari terakhir"
            trend={12.4}
            icon={TrendingUp}
            accentColor="#7c3aed"
          >
            <AreaChartWrapper
              data={AREA_DATA}
              series={[{ key: "revenue", color: "#7c3aed" }]}
              height={80}
              formatter={formatRpCompact}
            />
          </MetricCard>
          <MetricCard
            title="Visitors dengan Sparkline"
            value="7,683"
            sub="7 hari terakhir"
            trend={8.7}
            icon={Activity}
            accentColor="#10b981"
          >
            <AreaChartWrapper
              data={AREA_DATA}
              series={[{ key: "visitors", color: "#10b981" }]}
              height={80}
              formatter={(v) => v.toLocaleString("id-ID")}
            />
          </MetricCard>
        </div>
      </Section>

      {/* ── TrendIndicator ───────────────────────────────────────── */}
      <Section title="TrendIndicator">
        <SectionCard>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] text-muted-foreground">Positif</p>
              <TrendIndicator value={12.4} />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] text-muted-foreground">Negatif</p>
              <TrendIndicator value={-8.3} />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] text-muted-foreground">Zero</p>
              <TrendIndicator value={0} />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] text-muted-foreground">Inverse (bounce rate — turun = bagus)</p>
              <TrendIndicator value={-5.2} inverse />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] text-muted-foreground">Inverse naik = buruk</p>
              <TrendIndicator value={4.1} inverse />
            </div>
          </div>
        </SectionCard>
      </Section>

      {/* ── Chip ─────────────────────────────────────────────────── */}
      <Section title="Chip / Badge">
        <SectionCard>
          <div className="flex flex-wrap items-center gap-3">
            {["critical","high","medium","low","good","warning","needs-update"].map((level) => (
              <Chip key={level} label={level} level={level} />
            ))}
          </div>
        </SectionCard>
      </Section>

      {/* ── SectionCard ──────────────────────────────────────────── */}
      <Section title="SectionCard">
        <div className="grid grid-cols-2 gap-4">
          <SectionCard
            title="Judul Section"
            subtitle="Subtitle atau deskripsi singkat di sini"
            action={<Chip label="3 items" level="good" />}
          >
            <p className="text-xs text-muted-foreground">
              Konten section card. Bisa diisi tabel, chart, list, atau apapun.
            </p>
          </SectionCard>

          <SectionCard title="Tanpa Action">
            <p className="text-xs text-muted-foreground">
              SectionCard juga bisa tanpa action di kanan, hanya judul dan konten.
            </p>
          </SectionCard>
        </div>
      </Section>

      {/* ── DataTable ────────────────────────────────────────────── */}
      <Section title="DataTable">
        <SectionCard
          title="Top Keywords"
          subtitle="Google Search Console · 7 hari"
          action={<Chip label="5 keywords" level="medium" />}
        >
          <DataTable
            columns={TABLE_COLS}
            data={TABLE_DATA}
            striped
          />
        </SectionCard>
      </Section>

      {/* ── Charts ───────────────────────────────────────────────── */}
      <Section title="Charts (Tremor)">
        <div className="grid grid-cols-2 gap-4">
          <SectionCard title="Area Chart — Revenue" subtitle="7 hari terakhir">
            <AreaChartWrapper
              data={AREA_DATA}
              series={[
                { key: "revenue", color: "#7c3aed" },
                { key: "visitors", color: "#10B981" },
              ]}
              height={200}
              formatter={(v) => (v > 1000 ? formatRpCompact(v) : v.toLocaleString("id-ID"))}
            />
          </SectionCard>

          <SectionCard title="Bar Chart — Top Produk" subtitle="Revenue per produk">
            <BarChartWrapper
              data={BAR_DATA}
              series={[{ key: "revenue", color: "#7c3aed" }]}
              height={200}
              layout="vertical"
              index="name"
              formatter={formatRpCompact}
            />
          </SectionCard>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <SectionCard title="Donut Chart — Traffic Source" subtitle="Distribusi channel">
            <PieChartWrapper
              data={PIE_DATA}
              height={200}
              showLegend
              formatter={(v) => `${v}%`}
            />
          </SectionCard>

          <SectionCard title="Multi-series Area" subtitle="Traffic harian">
            <AreaChartWrapper
              data={AREA_DATA}
              series={[{ key: "visitors", color: "#06B6D4" }]}
              height={200}
              formatter={(v) => v.toLocaleString("id-ID")}
            />
          </SectionCard>
        </div>
      </Section>

      {/* ── Kombinasi ────────────────────────────────────────────── */}
      <Section title="Kombinasi Komponen">
        <div className="grid grid-cols-3 gap-4">
          <MetricCard
            title="Conversion Rate"
            value="3.2%"
            sub="Checkout / Landing"
            trend={0.8}
            icon={Target}
            accentColor="#3b82f6"
          />
          <MetricCard
            title="Cart Abandonment"
            value="68.5%"
            sub="8 carts ditinggalkan"
            trend={5.2}
            trendInverse
            icon={ShoppingCart}
            accentColor="#f59e0b"
          />
          <MetricCard
            title="Email Open Rate"
            value="38.4%"
            sub="2,450 terkirim"
            trend={-2.1}
            icon={Mail}
            accentColor="#ec4899"
          />
        </div>
      </Section>

    </div>
  );
}
