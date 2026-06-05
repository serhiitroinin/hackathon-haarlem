"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

const chartConfig = {
  count: { label: "Notes", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function NotesChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[16rem] items-center justify-center text-sm">
        No data yet — create a few notes and they&apos;ll plot here.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[16rem] w-full">
      <AreaChart data={data} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v: string) => v.slice(5)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Area
          dataKey="count"
          type="natural"
          fill="var(--color-count)"
          fillOpacity={0.3}
          stroke="var(--color-count)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
