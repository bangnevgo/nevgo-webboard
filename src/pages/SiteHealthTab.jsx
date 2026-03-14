import { useState, useEffect, useCallback } from "react";
import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import { AlertCircle, AlertTriangle, CheckCircle, ExternalLink, RefreshCw } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function fetchUptimeRobot(apiKey) {
  const res = await fetch("/api/uptimerobot/v2/getMonitors", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ api_key: apiKey, format: "json", response_times: "1", response_times_limit: "24", custom_uptime_ratios: "1-7-30" }),
  });
  if (!res.ok) throw new Error(`UptimeRobot ${res.status}`);
  const data = await res.json();
  if (data.stat !== "ok") throw new Error(data.error?.message || "UptimeRobot error");
  return data.monitors || [];
}

async function fetchPageSpeed(apiKey, url, strategy = "mobile") {
  const res = await fetch(`/api/pagespeed/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}&category=performance`);
  if (!res.ok) throw new Error(`PageSpeed ${res.status}`);
  const data = await res.json();
  const cats = data.lighthouseResult?.categories;
  const audits = data.lighthouseResult?.audits;
  return {
    score: Math.round((cats?.performance?.score || 0) * 100),
    lcp: audits?.["largest-contentful-paint"]?.displayValue || "N/A",
    fid: audits?.["total-blocking-time"]?.displayValue || "N/A",
    cls: audits?.["cumulative-layout-shift"]?.displayValue || "N/A",
    fcp: audits?.["first-contentful-paint"]?.displayValue || "N/A",
    si: audits?.["speed-index"]?.displayValue || "N/A",
    lcpNum: parseFloat(audits?.["largest-contentful-paint"]?.numericValue || 0) / 1000,
    clsNum: parseFloat(audits?.["cumulative-layout-shift"]?.numericValue || 0),
  };
}

const fetchSSL = async (domain) => {
  const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const res = await fetch(`/api/ssl/${clean}`);
  if (!res.ok) throw new Error(`SSL ${res.status}`);
  const json = await res.json();
  if (json.status !== "ok") throw new Error("SSL check failed");
  const r = json.result;
  return { valid: r.cert_valid, valid_from: r.valid_from, valid_till: r.valid_till, days_left: r.days_left, issued_by: r.issuer_o || r.issuer_cn || "Unknown", host: r.host };
};

function SHSpinner() {
  return (
    <div className="flex items-center gap-2 py-4">
      <RefreshCw size={14} className="text-violet-500 animate-spin" />
      <p className="text-xs text-muted-foreground">Fetching live data…</p>
    </div>
  );
}

function SHError({ msg }) {
  return (
    <div className="flex gap-2 px-3 py-2.5 bg-red-950/20 rounded-lg border border-red-900/30">
      <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
      <p className="text-[11px] text-red-400">{msg}</p>
    </div>
  );
}

function ScoreRing({ score, size = 64 }) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const color = score >= 90 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${(score / 100) * circ} ${circ}`}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-extrabold" style={{ color, fontSize: size / 3.8 }}>{score}</span>
      </div>
    </div>
  );
}

function UptimePanel({ apiKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!apiKey) return;
    setLoading(true); setError(null);
    try { const m = await fetchUptimeRobot(apiKey); setData(m[0] || null); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [apiKey]);

  useEffect(() => { load(); }, [load]);

  const statusMap = { 0:["Paused","#475569"], 1:["Checking","#475569"], 2:["UP","#10b981"], 8:["Seems Down","#f59e0b"], 9:["DOWN","#ef4444"] };
  const [label, col] = data ? (statusMap[data.status] || ["Unknown","#475569"]) : ["–","#475569"];
  const avgMs = data?.response_times?.length ? Math.round(data.response_times.reduce((s,r)=>s+r.value,0)/data.response_times.length) : null;
  const ratios = data?.custom_uptime_ratio?.split("-") || [];

  return (
    <SectionCard>
      <div className="flex justify-between items-start mb-3.5">
        <CardTitle title="⬆ Uptime Monitor" sub={apiKey ? "UptimeRobot — Live" : "Tambah API key di Settings"} />
        <button onClick={load} disabled={loading || !apiKey} className="bg-muted border-none rounded-lg p-2 cursor-pointer">
          <RefreshCw size={11} className={`text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      {!apiKey && <p className="text-xs text-muted-foreground">⚙ Belum terhubung — isi UptimeRobot API key di Settings → API Connections</p>}
      {apiKey && loading && <SHSpinner />}
      {apiKey && error && <SHError msg={error} />}
      {data && !loading && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-3.5 py-3 bg-muted rounded-xl border" style={{ borderColor: col + "30" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full" style={{ background: col, boxShadow: `0 0 7px ${col}` }} />
              <div>
                <p className="text-sm font-bold" style={{ color: col }}>{label}</p>
                <p className="text-[10px] text-muted-foreground">{data.url}</p>
              </div>
            </div>
            {avgMs && <div className="text-right">
              <p className="text-lg font-bold text-foreground">{avgMs}ms</p>
              <p className="text-[10px] text-muted-foreground">avg 24h</p>
            </div>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[["1 Day", ratios[0]], ["7 Days", ratios[1]], ["30 Days", ratios[2]]].map(([l,v],i) => {
              const pct = parseFloat(v||0);
              const c2 = pct>=99.9?"#10b981":pct>=99?"#f59e0b":"#ef4444";
              return <div key={i} className="p-2.5 bg-muted rounded-lg border border-border text-center">
                <p className="text-base font-bold" style={{ color: c2 }}>{pct.toFixed(2)}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{l}</p>
              </div>;
            })}
          </div>
          {data.response_times?.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-1.5">Response Time — Last 24h</p>
              <div className="flex items-end gap-0.5 h-10">
                {data.response_times.slice(-40).map((rt,i) => {
                  const max = Math.max(...data.response_times.map(r=>r.value));
                  const h = max>0?Math.max(3,(rt.value/max)*40):3;
                  const c2 = rt.value<500?"#10b981":rt.value<1500?"#f59e0b":"#ef4444";
                  return <div key={i} className="flex-1 rounded-sm opacity-75" style={{ height:h, background:c2 }} />;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function SSLPanel({ targetUrl }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await fetchSSL(targetUrl)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [targetUrl]);

  useEffect(() => { load(); }, [load]);

  const days = data?.valid_till ? Math.ceil((new Date(data.valid_till) - new Date()) / 86400000) : null;
  const dayCol = days===null?"#475569":days>30?"#10b981":days>7?"#f59e0b":"#ef4444";

  return (
    <SectionCard>
      <div className="flex justify-between mb-3.5">
        <CardTitle title="🔒 SSL Certificate" sub="ssl-checker.io — Live" />
        <button onClick={load} disabled={loading} className="bg-muted border-none rounded-lg p-2 cursor-pointer">
          <RefreshCw size={11} className={`text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      {loading && <SHSpinner />}
      {error && <SHError msg={error} />}
      {data && !loading && (
        <div className="flex flex-col gap-2.5">
          <div className="p-3.5 bg-muted rounded-xl border text-center" style={{ borderColor: dayCol + "30" }}>
            <p className="text-3xl font-extrabold leading-none" style={{ color: dayCol }}>{days ?? "?"}</p>
            <p className="text-[11px] text-muted-foreground mt-1">hari tersisa</p>
          </div>
          {[
            ["Status", data.valid?"Valid ✓":"Invalid ✗", data.valid],
            ["Issuer", data.issued_by||"–", null],
            ["Valid From", data.valid_from?new Date(data.valid_from).toLocaleDateString("id-ID"):"–", null],
            ["Expires", data.valid_till?new Date(data.valid_till).toLocaleDateString("id-ID"):"–", null],
          ].map(([l,v,ok],i) => (
            <div key={i} className="flex justify-between py-2 border-b border-border/30">
              <span className="text-xs text-muted-foreground">{l}</span>
              <span className="text-xs font-semibold" style={{ color: ok===null?"hsl(var(--muted-foreground))":ok?"#10b981":"#ef4444" }}>{v}</span>
            </div>
          ))}
          {days!==null && days<=30 && (
            <div className="px-3 py-2 bg-amber-950/20 rounded-lg border border-amber-900/30">
              <p className="text-[11px] font-semibold text-amber-400">⚠ SSL expires dalam {days} hari — renew segera!</p>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function PageSpeedPanel({ apiKey, pages }) {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [strategy, setStrategy] = useState("mobile");

  const loadAll = useCallback(() => {
    if (!apiKey) return;
    pages.forEach(async (page) => {
      setLoading(p => ({ ...p, [page.label]: true }));
      setErrors(p => ({ ...p, [page.label]: null }));
      try { const result = await fetchPageSpeed(apiKey, page.url, strategy); setResults(p => ({ ...p, [page.label]: result })); }
      catch (e) { setErrors(p => ({ ...p, [page.label]: e.message })); }
      finally { setLoading(p => ({ ...p, [page.label]: false })); }
    });
  }, [apiKey, pages, strategy]);

  useEffect(() => { if (apiKey) loadAll(); }, [apiKey, strategy]);

  return (
    <SectionCard className="col-span-2">
      <div className="flex justify-between items-start mb-4">
        <CardTitle title="⚡ Core Web Vitals — Per Page" sub={apiKey ? "Google PageSpeed Insights — Live" : "Tambah API key di Settings"} />
        <div className="flex gap-2">
          <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
            {["mobile","desktop"].map(s => (
              <button key={s} onClick={() => setStrategy(s)}
                className="px-2.5 py-1 rounded-md border-none text-[10px] font-semibold cursor-pointer transition-colors"
                style={{ background: strategy===s?"#7c3aed":"transparent", color: strategy===s?"white":"hsl(var(--muted-foreground))" }}>{s}</button>
            ))}
          </div>
          <button onClick={loadAll} disabled={!apiKey} className="flex items-center gap-1.5 bg-muted border border-border rounded-lg px-3 py-1.5 cursor-pointer">
            <RefreshCw size={11} className="text-muted-foreground" /><span className="text-[11px] text-muted-foreground">Refresh</span>
          </button>
        </div>
      </div>
      {!apiKey && <p className="text-xs text-muted-foreground">⚙ Belum terhubung — isi Google PageSpeed API key di Settings → API Connections</p>}
      {apiKey && (
        <div className="grid grid-cols-2 gap-3">
          {pages.map((page,i) => {
            const r = results[page.label];
            const isLoad = loading[page.label];
            const err = errors[page.label];
            return (
              <div key={i} className="bg-muted rounded-xl p-3.5 border border-border">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{page.label}</p>
                    <p className="text-[10px] text-muted-foreground">{page.url}</p>
                  </div>
                  {r && <ScoreRing score={r.score} size={52} />}
                </div>
                {isLoad && <SHSpinner />}
                {err && <SHError msg={err} />}
                {r && !isLoad && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {[["LCP", r.lcp, r.lcpNum<=2.5, r.lcpNum<=4], ["TBT", r.fid, null, null], ["CLS", r.cls, r.clsNum<=0.1, r.clsNum<=0.25], ["FCP", r.fcp, null, null], ["Speed", r.si, null, null]].map(([l,v,ok,warn],j) => {
                      const col = ok===null?"hsl(var(--muted-foreground))":ok?"#10b981":warn?"#f59e0b":"#ef4444";
                      return <div key={j} className="text-center">
                        <p className="text-sm font-bold leading-none" style={{ color: col }}>{v}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{l}</p>
                      </div>;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

function BrokenLinksPanel() {
  const [csv, setCsv] = useState(null);
  const handle = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const lines = ev.target.result.split("\n").filter(Boolean);
      const headers = lines[0].split(",");
      const rows = lines.slice(1).map(l => Object.fromEntries(headers.map((h,i)=>[h.trim(),l.split(",")[i]?.trim()])));
      setCsv(rows.filter(r=>r.Status_Code&&r.Status_Code!=="200").slice(0,20));
    };
    r.readAsText(file);
  };
  return (
    <SectionCard className="col-span-2">
      <CardTitle title="🔗 Broken Links" sub="Upload CSV dari Screaming Frog, atau cek Google Search Console" />
      <div className="grid grid-cols-2 gap-5">
        <div>
          <div className="flex flex-col gap-1.5 mb-3">
            {[["1","Download Screaming Frog SEO Spider (gratis 500 URL)","https://www.screamingfrog.co.uk/seo-spider/"],["2","Crawl nevgoinstitute.com",null],["3","Filter: Response Codes → 4xx + 5xx",null],["4","Export CSV → Upload di sini",null]].map(([s,t,l],i) => (
              <div key={i} className="flex gap-2.5 px-3 py-2 bg-muted rounded-lg border border-border">
                <span className="text-[11px] font-bold text-violet-500 shrink-0">Step {s}</span>
                <p className="text-[11px] text-muted-foreground">{t}{l&&<a href={l} target="_blank" rel="noreferrer" className="text-violet-500 ml-1 inline"><ExternalLink size={9} className="inline" /></a>}</p>
              </div>
            ))}
          </div>
          <label className="block p-3.5 bg-muted rounded-lg border-2 border-dashed border-border text-center cursor-pointer hover:border-violet-500 transition-colors">
            <p className="text-xs text-muted-foreground">📁 Drop Screaming Frog CSV di sini</p>
            <input type="file" accept=".csv" onChange={handle} className="hidden" />
          </label>
          <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 mt-2.5 text-[11px] text-cyan-500 no-underline">
            Atau cek Google Search Console → Coverage <ExternalLink size={10} />
          </a>
        </div>
        <div>
          {!csv ? (
            <div className="p-8 bg-muted rounded-lg border border-border text-center">
              <p className="text-xs text-muted-foreground">Upload CSV untuk lihat broken links</p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">{csv.length} issues ditemukan</p>
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {csv.map((row,i) => {
                  const code = parseInt(row["Status_Code"]||row["Status Code"]||0);
                  const col = code>=500?"#ef4444":code>=400?"#f59e0b":"#475569";
                  const url = row["Address"]||row["URL"]||"–";
                  return <div key={i} className="flex gap-2 px-2.5 py-2 bg-muted rounded-lg border" style={{ borderColor: col + "30" }}>
                    <span className="text-[10px] font-bold shrink-0" style={{ color: col }}>{code}</span>
                    <p className="text-[10px] text-muted-foreground break-all">{url}</p>
                  </div>;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

export function SiteHealthTab({ settings }) {
  const uptimeKey = settings?.connectionCredentials?.uptimerobot?.apiKey || "";
  const psKey = settings?.connectionCredentials?.pagespeed?.apiKey || "";
  const targetUrl = settings?.general?.targetUrl || "https://nevgoinstitute.com";
  const monitoredPages = [
    { label: "Homepage", url: targetUrl },
    { label: "Product Pages", url: targetUrl + "/kelas-online" },
    { label: "Blog Posts", url: targetUrl + "/blog" },
    { label: "Checkout", url: targetUrl + "/checkout" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      <div className="flex justify-between items-center px-4 py-3 bg-card border border-border rounded-xl">
        <p className="text-xs text-muted-foreground">
          {(!uptimeKey||!psKey) ? "⚙ Beberapa koneksi belum aktif — " : "✓ Semua koneksi aktif — "}
          <span className="text-violet-500 font-semibold">data live</span>
        </p>
        {(!uptimeKey||!psKey) && <span className="text-[11px] text-muted-foreground">Lengkapi di tab Settings → API Connections</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <UptimePanel apiKey={uptimeKey} />
        <SSLPanel targetUrl={targetUrl} />
        <PageSpeedPanel apiKey={psKey} pages={monitoredPages} />
        <SectionCard>
          <p className="text-sm font-bold text-foreground mb-3.5">🛡 Security Checklist</p>
          {[
            ["HTTPS Redirect", "Active", true],
            ["SSL Certificate", "Lihat panel kiri", true],
            ["WordPress Core", "Cek WP Admin → Updates", null],
            ["Plugin Updates", "Cek WP Admin → Updates", null],
            ["Sitemap.xml", targetUrl+"/sitemap.xml", null],
            ["Robots.txt", targetUrl+"/robots.txt", null],
          ].map(([l,v,ok],i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border/30">
              <div className="flex items-center gap-1.5">
                {ok===true && <CheckCircle size={12} className="text-emerald-500" />}
                {ok===false && <AlertCircle size={12} className="text-red-500" />}
                {ok===null && <AlertTriangle size={12} className="text-amber-500" />}
                <span className="text-xs text-muted-foreground">{l}</span>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: ok===true?"#10b981":ok===false?"#ef4444":"#f59e0b" }}>{v}</span>
            </div>
          ))}
          <a href={targetUrl+"/wp-admin"} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 mt-3 text-xs text-violet-500 no-underline">
            Buka WP Admin <ExternalLink size={10} />
          </a>
        </SectionCard>
        <BrokenLinksPanel />
      </div>
    </div>
  );
}
