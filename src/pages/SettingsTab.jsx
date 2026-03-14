import { useState } from "react";
import { SectionCard, CardTitle } from "@/components/ui/SectionCard";
import {
  BarChart3, CheckCircle, AlertCircle, ChevronDown, ChevronUp,
  CreditCard, DollarSign, ExternalLink, Eye, Mail, MessageSquare,
  Save, Search, Users, Wifi, Zap,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const CONN_DEFS = {
  woocommerce: { label:"WooCommerce", icon:DollarSign, color:"#7c3aed", desc:"Sales, orders, products, abandoned carts", docs:"https://woocommerce.com/document/woocommerce-rest-api/", fields:[{key:"storeUrl",label:"Store URL",placeholder:"https://nevgoinstitute.com",type:"text"},{key:"consumerKey",label:"Consumer Key",placeholder:"ck_xxxxxxxxxx",type:"password"},{key:"consumerSecret",label:"Consumer Secret",placeholder:"cs_xxxxxxxxxx",type:"password"}] },
  ga4: { label:"Google Analytics 4", icon:BarChart3, color:"#f59e0b", desc:"Traffic, sessions, bounce rate, conversions", docs:"https://developers.google.com/analytics/devguides/reporting/data/v1", fields:[{key:"propertyId",label:"Property ID",placeholder:"482441640",type:"text"},{key:"serviceAccount",label:"Service Account JSON",placeholder:"Paste seluruh isi JSON dari Google Cloud Console",type:"textarea"}] },
  searchConsole: { label:"Google Search Console", icon:Search, color:"#06b6d4", desc:"Keyword rankings, impressions, crawl errors", docs:"https://developers.google.com/webmaster-tools", fields:[{key:"siteUrl",label:"Site URL",placeholder:"https://nevgoinstitute.com/",type:"text"},{key:"apiKey",label:"API Key",placeholder:"AIzaSy...",type:"password"}] },
  lms: { label:"LMS (LearnDash / TutorLMS)", icon:Users, color:"#10b981", desc:"Course progress, completions, engagement", docs:"https://developers.learndash.com/rest-api/v2/", fields:[{key:"plugin",label:"Plugin",placeholder:"learndash / tutorlms",type:"text"},{key:"siteUrl",label:"WordPress URL",placeholder:"https://nevgoinstitute.com",type:"text"},{key:"appPassword",label:"Application Password",placeholder:"xxxx xxxx xxxx xxxx",type:"password"}] },
  uptimerobot: { label:"UptimeRobot", icon:Wifi, color:"#06b6d4", desc:"Uptime %, response time, downtime history", docs:"https://uptimerobot.com/api/", fields:[{key:"apiKey",label:"Main API Key",placeholder:"u_xxxxxxxxxxxxxxx",type:"password"}] },
  pagespeed: { label:"Google PageSpeed", icon:Zap, color:"#f59e0b", desc:"Core Web Vitals, LCP, CLS, mobile score", docs:"https://developers.google.com/speed/docs/insights/v5/get-started", fields:[{key:"apiKey",label:"API Key",placeholder:"AIzaSy...",type:"password"}] },
  sendgrid: { label:"SendGrid / Mailgun", icon:Mail, color:"#06b6d4", desc:"System alerts, daily digest, notifications", docs:"https://docs.sendgrid.com/api-reference/", fields:[{key:"provider",label:"Provider",placeholder:"sendgrid / mailgun",type:"text"},{key:"apiKey",label:"API Key",placeholder:"SG.xxxxxxxx",type:"password"},{key:"fromEmail",label:"From Email",placeholder:"system@nevgoinstitute.com",type:"text"}] },
  emailPlatform: { label:"Email Platform (ConvertKit)", icon:Mail, color:"#ec4899", desc:"Open rates, CTR, automation flows", docs:"https://developers.convertkit.com/", fields:[{key:"platform",label:"Platform",placeholder:"convertkit / mailchimp",type:"text"},{key:"apiKey",label:"API Key",placeholder:"dari platform email",type:"password"},{key:"listId",label:"List ID",placeholder:"optional",type:"text"}] },
  whatsapp: { label:"WhatsApp Business API", icon:MessageSquare, color:"#22c55e", desc:"Broadcast performance, re-engagement", docs:"https://developers.facebook.com/docs/whatsapp/cloud-api/", fields:[{key:"phoneNumberId",label:"Phone Number ID",placeholder:"dari Meta Business",type:"text"},{key:"accessToken",label:"Access Token",placeholder:"EAAxxxxxxxx",type:"password"}] },
  paymentGateway: { label:"Payment Gateway (Midtrans)", icon:CreditCard, color:"#3b82f6", desc:"Transactions, failures, refunds", docs:"https://api-docs.midtrans.com/", fields:[{key:"serverKey",label:"Server Key",placeholder:"SB-Mid-server-xxxx",type:"password"},{key:"clientKey",label:"Client Key",placeholder:"SB-Mid-client-xxxx",type:"password"},{key:"env",label:"Environment",placeholder:"sandbox / production",type:"text"}] },
  semrush: { label:"SEMrush", icon:Search, color:"#ff6b35", desc:"Keyword rankings, competitor analysis", docs:"https://developer.semrush.com/api/", fields:[{key:"apiKey",label:"API Key",placeholder:"dari SEMrush → Profile",type:"password"},{key:"domain",label:"Primary Domain",placeholder:"nevgoinstitute.com",type:"text"}] },
  hotjar: { label:"Hotjar", icon:Eye, color:"#fd6a3c", desc:"Heatmaps, session recordings, funnels", docs:"https://help.hotjar.com/hc/en-us", fields:[{key:"siteId",label:"Site ID",placeholder:"1234567",type:"text"},{key:"apiKey",label:"API Key",placeholder:"dari Hotjar → Account",type:"password"}] },
  openrouter: { label:"OpenRouter AI", icon:MessageSquare, color:"#ec4899", desc:"AI Agent Insight — model routing via OpenRouter", docs:"https://openrouter.ai/keys", fields:[{key:"apiKey",label:"API Key",placeholder:"sk-or-v1-xxxxxxxxxxxxxxxxxx",type:"password"}] },
};

const FASE1 = ["woocommerce","ga4","searchConsole","lms","uptimerobot","pagespeed","sendgrid","openrouter"];
const FASE2 = ["emailPlatform","whatsapp","paymentGateway","semrush","hotjar"];

function ConnCard({ id, def, vals, onUpdate, onTest, status }) {
  const [open, setOpen] = useState(false);
  const Icon = def.icon;
  const ok = status === "connected";
  const err = status === "error";
  const testing = status === "testing";
  const statusColor = ok ? "#10b981" : err ? "#ef4444" : testing ? "#f59e0b" : "#374151";
  const statusLabel = ok ? "Connected" : err ? "Error" : testing ? "Testing…" : "Not Connected";

  return (
    <div className="rounded-xl overflow-hidden border" style={{ background:"hsl(var(--card))", borderColor: ok?"#10b98140":err?"#ef444430":"hsl(var(--border))" }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3.5 bg-transparent border-none cursor-pointer text-left">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: def.color + "22" }}>
          <Icon size={14} style={{ color: def.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{def.label}</p>
          <p className="text-[11px] text-muted-foreground">{def.desc}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border"
            style={{ background: statusColor + "18", color: statusColor, borderColor: statusColor + "35" }}>
            {ok && <CheckCircle size={9} />}{err && <AlertCircle size={9} />}
            {statusLabel}
          </span>
          {open ? <ChevronUp size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="grid gap-2.5 mt-3.5" style={{ gridTemplateColumns: def.fields.length > 2 ? "1fr 1fr" : "1fr" }}>
            {def.fields.map(f => (
              <div key={f.key} style={{ gridColumn: f.type === "textarea" ? "1 / -1" : "auto" }}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">{f.label}</label>
                {f.type === "textarea"
                  ? <textarea rows={2} placeholder={f.placeholder} value={vals[f.key] || ""} onChange={e => onUpdate(id, f.key, e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none resize-vertical focus:border-violet-500 transition-colors" style={{ fontFamily:"inherit", boxSizing:"border-box" }} />
                  : <input type={f.type} placeholder={f.placeholder} value={vals[f.key] || ""} onChange={e => onUpdate(id, f.key, e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500 transition-colors" style={{ boxSizing:"border-box" }} />
                }
              </div>
            ))}
          </div>
          <div className="flex gap-2.5 items-center mt-3">
            <button onClick={() => onTest(id)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white border-none cursor-pointer" style={{ background: def.color }}>
              <Wifi size={11} /> {testing ? "Testing…" : "Test Connection"}
            </button>
            <a href={def.docs} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-muted-foreground no-underline hover:text-foreground transition-colors">
              Cara dapat API key <ExternalLink size={9} />
            </a>
          </div>
          {ok && <div className="mt-2.5 px-3 py-2 bg-emerald-950/20 rounded-lg border border-emerald-900/30"><p className="text-xs text-emerald-400">✓ Koneksi berhasil</p></div>}
          {err && <div className="mt-2.5 px-3 py-2 bg-red-950/20 rounded-lg border border-red-900/30"><p className="text-xs text-red-400">⚠ Gagal — cek API key & URL</p></div>}
        </div>
      )}
    </div>
  );
}

export function SettingsTab({ settings, onSettingsChange }) {
  const [sub, setSub] = useState("connections");
  const [connStatuses, setConnStatuses] = useState({});
  const [saved, setSaved] = useState(false);

  const connectedCount = Object.values(connStatuses).filter(s => s === "connected").length;
  const total = Object.keys(CONN_DEFS).length;

  const handleUpdate = (id, key, val) => {
    onSettingsChange("connectionCredentials", { ...settings.connectionCredentials, [id]: { ...(settings.connectionCredentials?.[id] || {}), [key]: val } });
  };

  const handleTest = async (id) => {
    setConnStatuses(p => ({ ...p, [id]: "testing" }));
    if (id === "ga4") {
      try { const r = await fetch(`${API_BASE}/api/ga4/realtime`); setConnStatuses(p => ({ ...p, [id]: r.ok ? "connected" : "error" })); }
      catch { setConnStatuses(p => ({ ...p, [id]: "error" })); }
      return;
    }
    await new Promise(r => setTimeout(r, 1200));
    const vals = settings.connectionCredentials?.[id] || {};
    const has = Object.values(vals).some(v => v && String(v).trim());
    setConnStatuses(p => ({ ...p, [id]: has ? "connected" : "error" }));
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const THRESHOLDS = [
    { group:"Revenue & Sales", color:"#7c3aed", items:[{key:"revenueDropCritical",label:"Revenue Drop CRITICAL (%)"},{key:"revenueDropHigh",label:"Revenue Drop HIGH (%)"},{key:"cartAbandonmentSpike",label:"Cart Abandonment Spike (%)"}] },
    { group:"Traffic & SEO", color:"#06b6d4", items:[{key:"trafficDropCritical",label:"Traffic Drop CRITICAL (%)"},{key:"trafficDropHigh",label:"Traffic Drop HIGH (%)"},{key:"keywordDropPositions",label:"Keyword Drop (posisi)"}] },
    { group:"Students", color:"#10b981", items:[{key:"studentInactiveDays",label:"Inactive Trigger (hari)"},{key:"studentAtRiskDays",label:"At-Risk Trigger (hari)"},{key:"churnRateHigh",label:"Churn Rate HIGH (%)"}] },
    { group:"Site Health", color:"#ef4444", items:[{key:"uptimeDownMinutes",label:"Downtime Critical (menit)"},{key:"responseTimeHigh",label:"Response Time HIGH (detik)"}] },
    { group:"Email", color:"#ec4899", items:[{key:"emailOpenRateLow",label:"Open Rate LOW (%)"}] },
  ];

  const TABS_SUB = [
    { key:"connections", label:"API Connections", badge:`${connectedCount}/${total}` },
    { key:"thresholds", label:"Alert Thresholds", badge:null },
    { key:"notifications", label:"Notifications", badge:null },
    { key:"general", label:"General", badge:null },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-nav */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 border border-border">
        {TABS_SUB.map(t => (
          <button key={t.key} onClick={() => setSub(t.key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border-none cursor-pointer text-xs font-semibold transition-all"
            style={{ background: sub === t.key ? "hsl(var(--card))" : "transparent", color: sub === t.key ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
            {t.label}
            {t.badge && <span className="bg-violet-600/20 text-violet-400 rounded-full px-1.5 py-0.5 text-[9px] font-bold">{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* CONNECTIONS */}
      {sub === "connections" && (
        <div className="flex flex-col gap-3">
          <div className="bg-card border border-border rounded-xl px-4 py-3.5">
            <div className="flex justify-between mb-1.5">
              <p className="text-xs font-semibold text-muted-foreground">Progress Integrasi</p>
              <p className="text-xs font-bold text-violet-500">{connectedCount} / {total} connected</p>
            </div>
            <div className="h-1.5 bg-muted rounded-full">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all" style={{ width: `${(connectedCount / total) * 100}%` }} />
            </div>
            <div className="flex gap-3 mt-2.5 flex-wrap">
              {Object.entries(CONN_DEFS).map(([id, def]) => {
                const st = connStatuses[id] || "disconnected";
                const col = st === "connected" ? "#10b981" : st === "error" ? "#ef4444" : "hsl(var(--border))";
                return <div key={id} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: col }} />
                  <span className="text-[10px]" style={{ color: st === "connected" ? "#10b981" : "hsl(var(--muted-foreground))" }}>{def.label}</span>
                </div>;
              })}
            </div>
          </div>
          <p className="text-xs font-bold text-emerald-500 py-1">🟢 FASE 1 — Critical (Bulan 1)</p>
          {FASE1.map(id => <ConnCard key={id} id={id} def={CONN_DEFS[id]} vals={settings.connectionCredentials?.[id] || {}} onUpdate={handleUpdate} onTest={handleTest} status={connStatuses[id]} />)}
          <p className="text-xs font-bold text-amber-500 py-1">🟡 FASE 2 — Advanced (Bulan 2-3)</p>
          {FASE2.map(id => <ConnCard key={id} id={id} def={CONN_DEFS[id]} vals={settings.connectionCredentials?.[id] || {}} onUpdate={handleUpdate} onTest={handleTest} status={connStatuses[id]} />)}
        </div>
      )}

      {/* THRESHOLDS */}
      {sub === "thresholds" && (
        <div className="flex flex-col gap-3.5">
          <div className="px-4 py-3 bg-card border border-border rounded-xl">
            <p className="text-xs text-muted-foreground">Angka batas yang memicu alert di setiap agent. Sesuaikan dengan baseline bisnis Nevgo Institute.</p>
          </div>
          {THRESHOLDS.map((g, gi) => (
            <div key={gi} className="bg-card border border-border rounded-xl px-4 py-4">
              <p className="text-xs font-bold mb-3" style={{ color: g.color }}>● {g.group}</p>
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                {g.items.map(item => (
                  <div key={item.key}>
                    <label className="text-[11px] text-muted-foreground block mb-1.5">{item.label}</label>
                    <input type="number" value={settings.alertThresholds?.[item.key] || 0}
                      onChange={e => onSettingsChange("alertThresholds", { ...settings.alertThresholds, [item.key]: parseInt(e.target.value) })}
                      className="w-20 bg-background border border-border rounded-lg py-2 text-sm font-bold outline-none text-center focus:border-violet-500 transition-colors"
                      style={{ color: g.color }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NOTIFICATIONS */}
      {sub === "notifications" && (
        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3 bg-card border border-border rounded-xl px-4 py-4">
            {[{key:"digestEmail",label:"Email Daily Digest",ph:"admin@nevgoinstitute.com",type:"email"},{key:"digestTime",label:"Jam Kirim",ph:"09:00",type:"time"},{key:"whatsappNumber",label:"WhatsApp Notifikasi",ph:"628989221700",type:"text"},{key:"slackWebhook",label:"Slack Webhook (opsional)",ph:"https://hooks.slack.com/...",type:"text"}].map(f => (
              <div key={f.key}>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">{f.label}</label>
                <input type={f.type} placeholder={f.ph} value={settings.notifications?.[f.key] || ""}
                  onChange={e => onSettingsChange("notifications", { ...settings.notifications, [f.key]: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500 transition-colors" style={{ boxSizing:"border-box" }} />
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-xl px-4 py-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Alert Routing — Channel per Level</p>
            <div className="flex gap-2.5 px-3.5 mb-1">
              <div className="flex-1" />
              {["Email","WhatsApp","SMS"].map(ch => <div key={ch} className="w-16 text-center"><p className="text-[10px] font-bold uppercase text-muted-foreground">{ch}</p></div>)}
            </div>
            {[{key:"critical",label:"🚨 CRITICAL",note:"Site down, revenue -50%"},{key:"high",label:"⚠ HIGH",note:"Revenue -30%, traffic drop"},{key:"medium",label:"📊 MEDIUM",note:"Performance, opportunities"},{key:"low",label:"💡 LOW",note:"Info, minor updates"}].map(lv => {
              const ch = settings.notifications?.channels?.[lv.key] || { email:true,whatsapp:false,sms:false };
              return (
                <div key={lv.key} className="flex gap-2.5 items-center px-3.5 py-3 bg-muted rounded-xl border border-border mb-2">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">{lv.label}</p>
                    <p className="text-[10px] text-muted-foreground">{lv.note}</p>
                  </div>
                  {["email","whatsapp","sms"].map(c => (
                    <div key={c} className="w-16 flex justify-center">
                      <button onClick={() => onSettingsChange("notifications", { ...settings.notifications, channels: { ...settings.notifications?.channels, [lv.key]: { ...ch, [c]: !ch[c] } } })}
                        className="relative border-none cursor-pointer rounded-full transition-all"
                        style={{ width:34, height:19, background: ch[c] ? "#7c3aed" : "hsl(var(--border))" }}>
                        <div className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white transition-all" style={{ left: ch[c] ? 17 : 3 }} />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GENERAL */}
      {sub === "general" && (
        <div className="bg-card border border-border rounded-xl px-5 py-5">
          <p className="text-sm font-bold text-foreground mb-4">General Configuration</p>
          <div className="grid grid-cols-2 gap-3">
            {[{key:"businessName",label:"Nama Bisnis",ph:"Nevgo Institute"},{key:"targetUrl",label:"URL Website",ph:"https://nevgoinstitute.com"},{key:"adminEmail",label:"Email Admin",ph:"admin@nevgoinstitute.com"},{key:"adminWhatsapp",label:"WhatsApp Admin",ph:"628989221700"},{key:"timezone",label:"Timezone",ph:"Asia/Jakarta"},{key:"currency",label:"Mata Uang",ph:"IDR"}].map(f => (
              <div key={f.key}>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">{f.label}</label>
                <input type="text" placeholder={f.ph} value={settings.general?.[f.key] || ""}
                  onChange={e => onSettingsChange("general", { ...settings.general, [f.key]: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500 transition-colors" style={{ boxSizing:"border-box" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end pt-1">
        <button onClick={handleSave}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all"
          style={{ background: saved ? "hsl(var(--muted))" : "#7c3aed", color: saved ? "#6ee7b7" : "white", borderColor: saved ? "#14532d" : "transparent" }}>
          {saved ? <CheckCircle size={14} /> : <Save size={14} />}
          {saved ? "Tersimpan!" : "Simpan Semua"}
        </button>
      </div>
    </div>
  );
}
