import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#7c3aed", "#4ecdc4", "#10b981", "#ff6b35"];

export function PieChartWrapper({ data, dataKey="value", nameKey="name", height=200, formatter }) {
  const chartData = data.map((item, i) => ({
    name: item[nameKey] ?? item.name,
    value: item[dataKey] ?? item.value,
    color: item.color || COLORS[i % COLORS.length],
  }));

  const total = chartData.reduce((s, d) => s + d.value, 0);

  const CenterLabel = ({ viewBox }) => {
    if (!viewBox) return null;
    const { cx, cy } = viewBox;
    return (
      <g>
        <text x={cx} y={cy - 7} textAnchor="middle"
          style={{ fontSize: 26, fontWeight: 700, fill: "hsl(var(--foreground))", fontFamily: "Geist Variable, system-ui" }}>
          {total}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle"
          style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "Geist Variable, system-ui", letterSpacing: "0.05em" }}>
          TOTAL
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
      <div style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 8, padding: "8px 12px" }}>
        <p style={{ fontSize: 10, color: "#6b6b6b", marginBottom: 2 }}>{d.name}</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: d.payload.color }}>{formatter ? formatter(d.value) : d.value}</p>
      </div>
    );
  };

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" cx="50%" cy="50%"
            innerRadius="60%" outerRadius="85%"
            paddingAngle={3} strokeWidth={0}
            label={<CenterLabel />} labelLine={false}>
            {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
