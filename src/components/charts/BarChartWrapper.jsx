import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";

/**
 * BarChartWrapper — Recharts-based
 * @param {Array}    data      - array of objects
 * @param {Array}    series    - [{ key, color, name? }]
 * @param {number}   height    - px
 * @param {string}   layout    - "horizontal" (default) | "vertical"
 * @param {string}   index     - X-axis key
 * @param {Function} formatter - value formatter
 */
export function BarChartWrapper({
  data,
  series,
  height = 200,
  layout = "horizontal",
  index,
  formatter,
}) {
  const isVertical = layout === "vertical";
  const resolvedIndex = index || (isVertical ? "name" : "day");

  return (
    <div style={{ height: `${height}px` }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={isVertical ? "vertical" : "horizontal"}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          barCategoryGap="28%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.6}
            vertical={!isVertical}
            horizontal={isVertical}
          />
          {isVertical ? (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatter}
                width={formatter ? 56 : 36}
              />
              <YAxis
                type="category"
                dataKey={resolvedIndex}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={110}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={resolvedIndex}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatter}
                width={formatter ? 56 : 36}
              />
            </>
          )}
          <Tooltip
            content={<ChartTooltip formatter={formatter} />}
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
          />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name || s.key}
              fill={s.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
