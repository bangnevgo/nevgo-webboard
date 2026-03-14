import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

export function PieChartWrapper({ data, height = 200, innerRadius = 55, outerRadius = 80 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} dataKey="value" paddingAngle={3}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip content={<ChartTooltip formatter={v => `${v}%`} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
