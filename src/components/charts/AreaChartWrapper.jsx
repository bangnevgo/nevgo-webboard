import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

export function AreaChartWrapper({ data, series, height = 200, formatter }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          {series.map(s => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--tw-border-opacity, #e2e8f0)" className="stroke-border" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "currentColor" }} className="text-muted-foreground" axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "currentColor" }} className="text-muted-foreground" axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        {series.map(s => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} fill={`url(#grad-${s.key})`} strokeWidth={2} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
