export function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 8,
      padding: "8px 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
      <p style={{ fontSize: 10, color: "#6b6b6b", marginBottom: 6, letterSpacing: "0.03em" }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: p.color, fontVariantNumeric: "tabular-nums" }}>
            {formatter ? formatter(p.value) : new Intl.NumberFormat("id-ID").format(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
