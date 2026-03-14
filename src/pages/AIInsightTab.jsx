import { useState, useEffect } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { Activity, DollarSign, Eye, Search, Server } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const AI_AGENTS = [
  { id: "sales", name: "Sales Monitor", color: "#7c3aed", icon: DollarSign, desc: "Analisis revenue, transaksi, cart abandonment", systemPrompt: `Kamu adalah Sales Monitor Agent untuk Nevgo Institute, platform edukasi Law of Assumption (LOAS) di Indonesia. Kamu memiliki akses ke data WooCommerce (revenue, transaksi, produk) dan Google Analytics 4 (traffic, sessions). Produk utama: Mini Course (Rp 74K), Program Intensif, Ebook Bundle, Webinar Recording, Mentoring Session, Kelas Trainer. Jawab dalam Bahasa Indonesia. Berikan analisis konkret, actionable, dan ringkas. Jika data tidak tersedia, sampaikan dengan jujur.\n\nKONTEKS BISNIS GLOBAL:\n- Standar konversi industri edukasi online Indonesia: 1-3%\n- Jangan anggap "0 penjualan dalam sehari" sebagai krisis — evaluasi berdasarkan tren minimal 7 hari\n- Berikan peringatan KRITIS hanya jika tren negatif berlangsung lebih dari 7 hari berturut-turut\n- Benchmark normal: fluktuasi harian ±30% adalah wajar`, suggestedCommands: ["Analisis revenue hari ini", "Ada peluang upsell?", "Produk mana yang underperform?"] },
  { id: "seo", name: "SEO Tracker", color: "#06b6d4", icon: Search, desc: "Monitor keyword ranking, traffic organik, GSC data", systemPrompt: `Kamu adalah SEO Tracker Agent untuk Nevgo Institute. Kamu memiliki akses ke Google Search Console (clicks, impressions, CTR, position, keywords) dan Google Analytics 4. Target keywords: manifestasi, law of assumption, neville goddard indonesia. Jawab dalam Bahasa Indonesia.`, suggestedCommands: ["Keyword apa yang perlu dioptimasi?", "Analisis posisi GSC saat ini", "Content gap apa yang ada?"] },
  { id: "traffic", name: "Traffic Analyst", color: "#10b981", icon: Activity, desc: "Analisis pola traffic, top pages, visitor behavior", systemPrompt: `Kamu adalah Traffic Analyst Agent untuk Nevgo Institute. Kamu memiliki akses ke Google Analytics 4: active users realtime, sessions hari ini, page views, top pages. Jawab dalam Bahasa Indonesia.`, suggestedCommands: ["Halaman mana yang perlu dioptimasi?", "Analisis top pages saat ini", "Kenapa traffic rendah?"] },
  { id: "health", name: "Site Health", color: "#f59e0b", icon: Server, desc: "Monitor uptime, response time, performa teknis", systemPrompt: `Kamu adalah Site Health Agent untuk Nevgo Institute. Kamu memiliki akses ke UptimeRobot (uptime %, response time, status). Jawab dalam Bahasa Indonesia.`, suggestedCommands: ["Cek kondisi site sekarang", "Apa yang perlu dioptimasi?", "Response time normal?"] },
  { id: "pipeline", name: "Competitor Pipeline", color: "#ec4899", icon: Eye, desc: "Monitor kompetitor & situs se-niche LOAS Indonesia", systemPrompt: `Kamu adalah Competitor Intelligence Pipeline Agent untuk Nevgo Institute.`, suggestedCommands: ["Fokus ke kompetitor yang aktif di TikTok", "Cari kompetitor yang baru launch produk bulan ini", "Analisis keyword gap vs kompetitor utama"] },
];

function AgentChat({ agent, liveData, apiKey, messages, setMessages, onCompetitorSaved }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const buildContext = () => liveData ? `\n\nDATA LIVE SAAT INI:\n${JSON.stringify(liveData, null, 2)}` : "";

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (!apiKey) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ OpenRouter API key belum diset. Buka Settings → API Connections → OpenRouter AI." }]);
      return;
    }
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const model = agent.id === "pipeline" ? "anthropic/claude-haiku-4-5:online" : "anthropic/claude-haiku-4-5";
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}`, "HTTP-Referer": import.meta.env.VITE_APP_URL || "http://localhost:5173" },
        body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: "system", content: agent.systemPrompt + buildContext() }, ...newMessages] }),
      });
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "Tidak ada respons.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);

      // Auto-save competitor data jika agent pipeline
      if (agent.id === "pipeline") {
        const match = reply.match(/```json\n([\s\S]*?)\n```/);
        if (match) {
          try {
            const parsed = JSON.parse(match[1]);
            fetch(`${API_BASE}/api/competitors/save`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...parsed, analyzedAt: new Date().toISOString() }),
            }).then(() => { if (onCompetitorSaved) onCompetitorSaved(); }).catch(() => {});
          } catch {}
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Error: Gagal menghubungi AI. Cek koneksi." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col" style={{ height: 420 }}>
      <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: agent.color + "22" }}>
              <agent.icon size={20} style={{ color: agent.color }} />
            </div>
            <p className="text-xs text-muted-foreground">{agent.desc}</p>
            <p className="text-[11px] text-muted-foreground mt-1.5">Ketik perintah atau pertanyaan untuk agent ini</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
              style={{ borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: m.role === "user" ? agent.color : "hsl(var(--card))", border: m.role === "assistant" ? "1px solid hsl(var(--border))" : "none", color: m.role === "user" ? "#fff" : "hsl(var(--foreground))" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3.5 py-2.5 rounded-xl bg-card border border-border flex gap-1.5 items-center">
              {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: agent.color, animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        )}
      </div>
      {messages.length === 0 && (
        <div className="flex gap-1.5 flex-wrap mb-2.5">
          {agent.suggestedCommands.map((s, i) => (
            <button key={i} onClick={() => setInput(s)} className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-transparent text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{s}</button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder={`Perintah untuk ${agent.name}...`}
          className="flex-1 bg-muted border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-violet-500 transition-colors" />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white border-none transition-colors"
          style={{ background: loading || !input.trim() ? "hsl(var(--muted))" : agent.color, cursor: loading || !input.trim() ? "default" : "pointer" }}>
          Kirim
        </button>
      </div>
    </div>
  );
}

function PipelineRunner({ onCompetitorSaved }) {
  const [status, setStatus] = useState("idle");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const runPipeline = async (instruction = "") => {
    const userMsg = instruction || "Jalankan analisis kompetitor default";
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setStatus("running");
    try {
      const res = await fetch(`${API_BASE}/api/pipeline/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ instruction }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Pipeline gagal");
      setStatus("done");
      if (onCompetitorSaved) onCompetitorSaved();
      setMessages(prev => [...prev, { role: "assistant", content: `✅ Selesai — ${data.competitorsFound} kompetitor ditemukan. ${data.whatsappSent ? "Laporan terkirim ke WhatsApp." : ""}\n\n${data.summary || ""}` }]);
    } catch (e) {
      setStatus("error");
      setMessages(prev => [...prev, { role: "assistant", content: `❌ Error: ${e.message}` }]);
    }
  };

  const handleSend = () => {
    if (!input.trim() || status === "running") return;
    const instruction = input.trim();
    setInput("");
    runPipeline(instruction);
  };

  return (
    <div className="flex flex-col" style={{ height: 420 }}>
      <div className="flex gap-4 px-3.5 py-2.5 bg-muted rounded-xl border border-border mb-3 text-[11px] text-muted-foreground">
        <span>🔍 <strong className="text-pink-500">Scouting</strong> Tavily</span>
        <span>🧠 <strong className="text-pink-500">Reasoning</strong> GSC+GA4+WooCommerce</span>
        <span>📲 <strong className="text-pink-500">Acting</strong> Dashboard+WA</span>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 py-1">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground">Ketik instruksi spesifik atau langsung Run untuk analisis default</p>
            <div className="flex gap-1.5 flex-wrap justify-center mt-3">
              {["Fokus ke kompetitor yang aktif di TikTok", "Cari kompetitor yang baru launch produk bulan ini", "Analisis keyword gap vs kompetitor utama"].map((s, i) => (
                <button key={i} onClick={() => setInput(s)} className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-transparent text-muted-foreground cursor-pointer">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap"
              style={{ borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: m.role === "user" ? "#ec4899" : "hsl(var(--card))", border: m.role === "assistant" ? "1px solid hsl(var(--border))" : "none", color: m.role === "user" ? "#fff" : "hsl(var(--foreground))" }}>
              {m.content}
            </div>
          </div>
        ))}
        {status === "running" && (
          <div className="flex justify-start">
            <div className="px-3.5 py-2.5 rounded-xl bg-card border border-pink-500/30 text-xs text-pink-500">Pipeline berjalan... (15–30 detik)</div>
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-2.5">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Instruksi ke pipeline... atau kosongkan untuk analisis default"
          disabled={status === "running"}
          className="flex-1 bg-muted border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-pink-500 transition-colors disabled:opacity-50" />
        <button onClick={handleSend} disabled={status === "running"}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white border-none"
          style={{ background: status === "running" ? "hsl(var(--muted))" : "linear-gradient(135deg, #ec4899, #a855f7)", cursor: status === "running" ? "default" : "pointer" }}>
          {status === "running" ? "..." : "▶ Run"}
        </button>
      </div>
    </div>
  );
}

export function AIInsightTab({ settings, onCompetitorSaved }) {
  const [activeAgent, setActiveAgent] = useState("sales");
  const [allMessages, setAllMessages] = useState({ sales: [], seo: [], traffic: [], health: [], pipeline: [] });
  const [liveData, setLiveData] = useState({});
  const agent = AI_AGENTS.find(a => a.id === activeAgent);
  const apiKey = settings?.connectionCredentials?.openrouter?.apiKey || "";

  const setMessages = (updater) => {
    setAllMessages(prev => ({ ...prev, [activeAgent]: typeof updater === "function" ? updater(prev[activeAgent]) : updater }));
  };

  useEffect(() => {
    const fetchAll = async () => {
      const data = {};
      try { const r = await fetch(`${API_BASE}/api/revenue/today`); if (r.ok) data.woocommerce = await r.json(); } catch {}
      try {
        const [rt, td, pg] = await Promise.all([fetch(`${API_BASE}/api/ga4/realtime`), fetch(`${API_BASE}/api/ga4/today`), fetch(`${API_BASE}/api/ga4/top-pages`)]);
        if (rt.ok && td.ok && pg.ok) { const realtime = await rt.json(); const today = await td.json(); const pages = await pg.json(); data.ga4 = { activeUsers: realtime.activeUsers, ...today, topPages: pages }; }
      } catch {}
      try {
        const [sum, kw] = await Promise.all([fetch(`${API_BASE}/api/gsc/summary`), fetch(`${API_BASE}/api/gsc/keywords`)]);
        if (sum.ok && kw.ok) { const summary = await sum.json(); const keywords = await kw.json(); data.gsc = { ...summary, keywords }; }
      } catch {}
      setLiveData(data);
    };
    fetchAll();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* Agent selector */}
      <div className="grid grid-cols-5 gap-2.5">
        {AI_AGENTS.map(a => (
          <button key={a.id} onClick={() => setActiveAgent(a.id)}
            className="rounded-xl p-3.5 text-left border transition-all"
            style={{ background: activeAgent === a.id ? a.color + "22" : "hsl(var(--card))", borderColor: activeAgent === a.id ? a.color + "55" : "hsl(var(--border))" }}>
            <div className="flex items-center gap-2 mb-1.5">
              <a.icon size={14} style={{ color: activeAgent === a.id ? a.color : "hsl(var(--muted-foreground))" }} />
              <span className="text-xs font-bold" style={{ color: activeAgent === a.id ? a.color : "hsl(var(--muted-foreground))" }}>{a.name}</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">{a.desc}</p>
          </button>
        ))}
      </div>

      {/* Chat panel */}
      <SectionCard>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: agent.color + "22" }}>
            <agent.icon size={15} style={{ color: agent.color }} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{agent.name}</p>
            <p className="text-[11px] text-muted-foreground">AI-powered • Data live terintegrasi</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500">ACTIVE</span>
          </div>
        </div>
        {agent.id === "pipeline"
          ? <PipelineRunner onCompetitorSaved={onCompetitorSaved} />
          : <AgentChat agent={agent} liveData={liveData} apiKey={apiKey} messages={allMessages[activeAgent]} setMessages={setMessages} onCompetitorSaved={onCompetitorSaved} />
        }
      </SectionCard>
    </div>
  );
}
