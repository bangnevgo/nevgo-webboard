import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

function Sparkline({ data, color }) {
  if (!data?.length) return null;
  const max = Math.max(...data, 1);
  const w = 64;
  const h = 24;
  const barW = Math.floor((w - (data.length - 1) * 2) / data.length);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {data.map((v, i) => {
        const barH = Math.max(2, (v / max) * h);
        return <rect key={i} x={i*(barW+2)} y={h-barH} width={barW} height={barH}
          rx={1} fill={color} opacity={i===data.length-1?0.9:0.2} />;
      })}
    </svg>
  );
}

function Trend({ value, inverse }) {
  if (value === undefined || value === null) return null;
  const isGood = inverse ? value < 0 : value > 0;
  const color = value === 0 ? "#6b6b6b" : isGood ? "#4ecdc4" : "#ff6b35";
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium tabular-nums" style={{ color }}>
      {Icon && <Icon size={10} strokeWidth={2} />}
      {value > 0 ? "+" : ""}{value}%
    </span>
  );
}

export function MetricCard({ title, value, sub, trend, trendInverse, icon: Icon, sparkline, color = "#4ecdc4", className }) {
  return (
    <Card className={cn(
      "bg-card border border-border rounded-xl overflow-hidden group",
      "transition-all duration-200 hover:border-white/10 hover:bg-[#202020]",
      className
    )}>
      <CardContent className="px-5 pt-5 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-[22px] h-[22px] rounded-md flex items-center justify-center"
                style={{ background: `${color}18` }}>
                <Icon size={11} strokeWidth={1.5} style={{ color }} />
              </div>
            )}
            <p className="text-[11.5px] font-medium text-muted-foreground">{title}</p>
          </div>
          {sparkline && <Sparkline data={sparkline} color={color} />}
        </div>

        <p className="text-[34px] font-semibold tracking-tight leading-none tabular-nums text-foreground mb-2.5">
          {value ?? "—"}
        </p>

        <div className="flex items-center gap-2">
          {trend !== undefined && <Trend value={trend} inverse={trendInverse} />}
          {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
