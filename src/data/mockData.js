import {
  Bell, Cpu, DollarSign, Eye, FileText,
  Mail, Search, Target, Users, Zap,
} from "lucide-react";

export const REV_DATA = [
  { day: "Sen", rev: 3800000, tx: 14 },
  { day: "Sel", rev: 5200000, tx: 21 },
  { day: "Rab", rev: 4100000, tx: 17 },
  { day: "Kam", rev: 6800000, tx: 28 },
  { day: "Jum", rev: 4900000, tx: 19 },
  { day: "Sab", rev: 7200000, tx: 31 },
  { day: "Min", rev: 4250000, tx: 18 },
];

export const TRAFFIC_DATA = [
  { day: "Sen", organic: 980, direct: 130, social: 55, referral: 190 },
  { day: "Sel", organic: 1100, direct: 145, social: 72, referral: 220 },
  { day: "Rab", organic: 950, direct: 120, social: 48, referral: 180 },
  { day: "Kam", organic: 1350, direct: 165, social: 85, referral: 260 },
  { day: "Jum", organic: 1180, direct: 150, social: 63, referral: 240 },
  { day: "Sab", organic: 890, direct: 110, social: 90, referral: 170 },
  { day: "Min", organic: 1234, direct: 156, social: 66, referral: 234 },
];

export const PIE_DATA = [
  { name: "Organic", value: 68, color: "#7c3aed" },
  { name: "Referral", value: 16, color: "#06b6d4" },
  { name: "Direct", value: 11, color: "#10b981" },
  { name: "Social", value: 5, color: "#f59e0b" },
];

export const PRODUCTS = [
  { name: "Mini Course", sales: 12, revenue: 888000, change: 15 },
  { name: "Program Intensif", sales: 3, revenue: 2250000, change: -20 },
  { name: "Ebook Bundle", sales: 8, revenue: 640000, change: 8 },
  { name: "Webinar Recording", sales: 5, revenue: 375000, change: 25 },
  { name: "Mentoring Session", sales: 2, revenue: 1500000, change: 0 },
];

export const KEYWORDS = [
  { keyword: "neville goddard indonesia", pos: 2, ch: 3, vol: 3200, diff: "Low" },
  { keyword: "law of assumption", pos: 4, ch: 2, vol: 8200, diff: "Medium" },
  { keyword: "revision technique loas", pos: 6, ch: 8, vol: 1200, diff: "Low" },
  { keyword: "belajar manifestasi", pos: 9, ch: 1, vol: 5600, diff: "Medium" },
  { keyword: "kelas law of assumption", pos: 12, ch: 5, vol: 1800, diff: "Low" },
  { keyword: "manifestasi uang cepat", pos: 38, ch: -4, vol: 2900, diff: "Low" },
];

export const TOP_CONTENT = [
  { title: "Perbedaan LOA vs LOAS", views: 456, conversions: 23, rate: 5.0, status: "good" },
  { title: "Manifestasi SP untuk Pemula", views: 234, conversions: 12, rate: 5.1, status: "good" },
  { title: "Kesalahan Umum LOAS", views: 189, conversions: 8, rate: 4.2, status: "needs-update" },
  { title: "Neville Goddard Bapak LOAS", views: 756, conversions: 18, rate: 2.4, status: "needs-update" },
];

export const COURSES = [
  { name: "Mini Course", completion: 68, avgDays: 5, satisfaction: 4.6, dropoff: "Chapter 3" },
  { name: "Program Intensif", completion: 45, avgDays: 28, satisfaction: 4.8, dropoff: "Week 2 Ch.4" },
  { name: "Ebook Bundle", completion: 92, avgDays: 2, satisfaction: 4.3, dropoff: "N/A" },
];

export const AT_RISK = [
  { name: "Budi S.", course: "Program Intensif", days: 5, progress: 45 },
  { name: "Rini W.", course: "Mini Course", days: 9, progress: 30 },
  { name: "Ahmad F.", course: "Program Intensif", days: 14, progress: 22 },
];

export const FUNNEL = [
  { stage: "Landing Page", visitors: 1000, rate: 100 },
  { stage: "Product Page", visitors: 180, rate: 18 },
  { stage: "Add to Cart", visitors: 45, rate: 25 },
  { stage: "Checkout", visitors: 32, rate: 71 },
];

export const EMAILS = [
  { name: "7 Hari Challenge", sent: 2450, open: 38, ctr: 12.4, conv: 34, rev: 2520000 },
  { name: "Cart Recovery #1", sent: 124, open: 55, ctr: 25.0, conv: 19, rev: 1406000 },
  { name: "Welcome Sequence", sent: 480, open: 45, ctr: 12.0, conv: 28, rev: 840000 },
  { name: "Promo Akhir Bulan", sent: 3200, open: 22, ctr: 4.1, conv: 12, rev: 888000 },
];

export const VITALS = [
  { page: "Homepage", lcp: 2.1, fid: 85, cls: 0.08, mobile: 72 },
  { page: "Product Pages", lcp: 1.8, fid: 62, cls: 0.05, mobile: 81 },
  { page: "Blog Posts", lcp: 1.5, fid: 45, cls: 0.04, mobile: 85 },
  { page: "Checkout", lcp: 3.2, fid: 120, cls: 0.18, mobile: 58 },
];

export const COMPETITORS = [
  { name: "manifestasicerdas.com", traffic: 12000, change: 15, content: 3, newProduct: "90-Day Challenge", topKW: ["manifestasi cepat #2", "loas pemula #4"], threat: "high" },
  { name: "loas.id", traffic: 8000, change: 0, content: 1, newProduct: "Free Webinar Funnel", topKW: ["law of assumption #8", "manifestasi sp #11"], threat: "medium" },
];

export const ALERTS_DATA = [
  { id: 1, level: "critical", agent: "Sales Agent", title: "Revenue Drop -12%", msg: "Revenue turun vs rata-rata kemarin. Selidiki top funnel sekarang.", time: "30m ago", action: "Review" },
  { id: 2, level: "high", agent: "Sales Agent", title: "Cart Abandonment Spike", msg: "8 carts senilai Rp 1.8M ditinggalkan dalam 24 jam terakhir", time: "15m ago", action: "Recovery" },
  { id: 3, level: "high", agent: "Conversion Agent", title: "Zero Conversion", msg: "Kelas Trainer page: 67 visits, 0 konversi hari ini", time: "1h ago", action: "Review Page" },
  { id: 4, level: "medium", agent: "SEO Agent", title: "Keyword Position Drop", msg: '"kelas manifestasi online" turun 4 posisi ke #15', time: "3h ago", action: "Fix SEO" },
  { id: 5, level: "medium", agent: "Student Agent", title: "At-Risk Students", msg: "3 siswa tidak aktif 5+ hari di tahap kritis kursus", time: "2h ago", action: "Send Email" },
  { id: 6, level: "medium", agent: "Site Health", title: "Checkout Page Slow", msg: "Halaman checkout avg 3.2s load time — target <2s", time: "5h ago", action: "Optimize" },
  { id: 7, level: "low", agent: "Content Agent", title: "Article Outdated", msg: '"Kesalahan Umum LOAS" belum diupdate 8 bulan, traffic -25%', time: "1d ago", action: "Schedule" },
  { id: 8, level: "low", agent: "Competitor Agent", title: "New Competitor Product", msg: 'manifestasicerdas.com meluncurkan "90-Day Challenge"', time: "2d ago", action: "Analyze" },
];

export const AGENTS = [
  { name: "Sales Monitor", lastRun: "2m ago", tasks: 48, icon: DollarSign, color: "#7c3aed" },
  { name: "SEO Tracker", lastRun: "5m ago", tasks: 23, icon: Search, color: "#06b6d4" },
  { name: "Student Engagement", lastRun: "1m ago", tasks: 67, icon: Users, color: "#10b981" },
  { name: "Content Performance", lastRun: "10m ago", tasks: 12, icon: FileText, color: "#f59e0b" },
  { name: "Conversion Optimizer", lastRun: "3m ago", tasks: 31, icon: Target, color: "#3b82f6" },
  { name: "Email Marketing", lastRun: "8m ago", tasks: 19, icon: Mail, color: "#ec4899" },
  { name: "Performance Monitor", lastRun: "30s ago", tasks: 144, icon: Zap, color: "#22d3ee" },
  { name: "Competitor Intel", lastRun: "15m ago", tasks: 8, icon: Eye, color: "#a78bfa" },
  { name: "Alert Manager", lastRun: "now", tasks: 200, icon: Bell, color: "#fb923c" },
];

export const NAV = [
  { id: "overview", label: "Overview" },
  { id: "revenue", label: "Revenue" },
  { id: "traffic", label: "Traffic & SEO" },
  { id: "students", label: "Students", badge: 3 },
  { id: "conversion", label: "Conversion" },
  { id: "email", label: "Email & WA" },
  { id: "health", label: "Site Health", badge: 4 },
  { id: "competitors", label: "Competitors" },
  { id: "alerts", label: "Alerts", badge: 8 },
  { id: "agents", label: "Agent Status" },
  { id: "ai-insight", label: "AI Agent Insight" },
  { id: "components", label: "🎨 Components" },
  { id: "settings", label: "Settings" },
];

export const DEFAULT_SETTINGS = {
  general: { businessName: "Nevgo Institute", targetUrl: "https://nevgoinstitute.com", adminEmail: "", adminWhatsapp: "", timezone: "Asia/Jakarta", currency: "IDR" },
  connectionCredentials: { uptimerobot: { apiKey: "" }, woocommerce: { consumerKey: "", consumerSecret: "" } },
  alertThresholds: { revenueDropCritical: 50, revenueDropHigh: 30, trafficDropCritical: 40, trafficDropHigh: 20, conversionDropHigh: 25, cartAbandonmentSpike: 35, studentInactiveDays: 7, studentAtRiskDays: 14, uptimeDownMinutes: 1, responseTimeHigh: 4, keywordDropPositions: 10, emailOpenRateLow: 20, churnRateHigh: 10 },
  notifications: { digestEmail: "", digestTime: "09:00", whatsappNumber: "", slackWebhook: "", channels: { critical: { email: true, whatsapp: true, sms: false }, high: { email: true, whatsapp: true, sms: false }, medium: { email: true, whatsapp: false, sms: false }, low: { email: false, whatsapp: false, sms: false } } },
};
