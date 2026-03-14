import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

export function BarChartWrapper({ data, series, height = 200, layout = "horizontal", formatter }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border opacity-50" />
        {layout === "vertical"
          ? <>
              <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} tickFormatter={formatter} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} width={120} />
            </>
          : <>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
            </>
        }
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        {series.map(s => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={layout === "vertical" ? [0, 4, 4, 0] : [3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
