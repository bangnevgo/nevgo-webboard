import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";

/**
 * AreaChartWrapper — Recharts-based
 * @param {Array}    data      - array of objects
 * @param {Array}    series    - [{ key, color, name? }]
 * @param {number}   height    - px
 * @param {string}   index     - X-axis key (default "day")
 * @param {Function} formatter - value formatter
 */
export function AreaChartWrapper({
  data,
  series,
  height = 200,
  index = "day",
  formatter,
}) {
  return (
    <div style={{ height: `${height}px` }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={s.color} stopOpacity={0.18} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.6}
            vertical={false}
          />
          <XAxis
            dataKey={index}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            dy={6}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatter}
            width={formatter ? 56 : 36}
          />
          <Tooltip
            content={<ChartTooltip formatter={formatter} />}
            cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name || s.key}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
