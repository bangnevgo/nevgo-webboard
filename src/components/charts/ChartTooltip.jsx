export function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-800 border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatter ? formatter(p.value) : new Intl.NumberFormat("id-ID").format(p.value)}
        </p>
      ))}
    </div>
  );
}
