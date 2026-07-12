import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneStyles = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/25 text-accent-foreground",
  chart1:
    "bg-[oklch(0.6_0.18_250/0.15)] text-[oklch(0.45_0.18_250)] dark:text-[oklch(0.62_0.17_250)]",
  chart2:
    "bg-[oklch(0.7_0.13_150/0.15)] text-[oklch(0.5_0.13_150)] dark:text-[oklch(0.72_0.13_152)]",
  chart3: "bg-[oklch(0.74_0.14_74/0.15)] text-[oklch(0.46_0.14_74)] dark:text-[oklch(0.8_0.13_84)]",
  chart4:
    "bg-[oklch(0.63_0.16_324/0.15)] text-[oklch(0.5_0.16_324)] dark:text-[oklch(0.68_0.16_324)]",
  chart5:
    "bg-[oklch(0.68_0.14_38/0.15)] text-[oklch(0.44_0.14_38)] dark:text-[oklch(0.72_0.16_36)]",
} as const;

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  tone = "primary",
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  tone?: keyof typeof toneStyles;
}) {
  return (
    <Card className="panel-surface elevated-card-hover rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-3">
        <span className="text-3xl font-semibold tracking-tight text-foreground">
          {value.toLocaleString()}
        </span>
        <span
          className={cn("grid size-10 shrink-0 place-items-center rounded-lg", toneStyles[tone])}
        >
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
