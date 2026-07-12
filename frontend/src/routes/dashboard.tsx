import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  Baby,
  Building2,
  Heart,
  House,
  PersonStanding,
  UserRound,
  Users,
  Venus,
} from "lucide-react";
import { DashboardStatCard } from "@/components/common/dashboard-stat-card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/layout/page-header";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardData } from "@/services/census.service";
import { formatDate } from "@/utils/date";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h2>
  );
}

// Fixed identity -> color mapping (never assigned by rank/count) so a status keeps
// its color regardless of filtering or how the other categories shift.
const MARITAL_STATUS_COLORS: Record<string, string> = {
  Married: "var(--color-chart-1)",
  Unmarried: "var(--color-chart-2)",
  Single: "var(--color-chart-3)",
  Widowed: "var(--color-chart-4)",
};
const MARITAL_STATUS_FALLBACK_COLOR = "var(--color-chart-5)";

function maritalStatusColor(status: string) {
  return MARITAL_STATUS_COLORS[status] ?? MARITAL_STATUS_FALLBACK_COLOR;
}

function DashboardPage() {
  const query = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });

  if (query.isLoading) return <LoadingSpinner label="Loading parish dashboard..." />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        title="Unable to load dashboard"
        description="Please retry and check your network connection."
        onRetry={() => query.refetch()}
      />
    );

  const {
    stats,
    villagePopulation,
    genderDistribution,
    maritalStatusDistribution,
    occupationDistribution,
    ageDistribution,
    timeline,
    recentFamilies,
    recentMembers,
  } = query.data;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Parish Census Dashboard"
        description="Overview of villages, families, members, and sacramental progress for Our Lady of Lourdes Church, Shirlai."
      />

      <section className="space-y-3">
        <SectionLabel>Population Overview</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DashboardStatCard
            title="Total Villages"
            value={stats.totalVillages}
            icon={Building2}
            tone="primary"
          />
          <DashboardStatCard
            title="Total Families"
            value={stats.totalFamilies}
            icon={House}
            tone="accent"
          />
          <DashboardStatCard
            title="Total Members"
            value={stats.totalMembers}
            icon={Users}
            tone="chart2"
          />
        </div>
      </section>

      <section className="space-y-3">
        <SectionLabel>Demographics</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <DashboardStatCard
            title="Male Members"
            value={stats.maleMembers}
            icon={UserRound}
            tone="chart1"
          />
          <DashboardStatCard
            title="Female Members"
            value={stats.femaleMembers}
            icon={Venus}
            tone="chart3"
          />
          <DashboardStatCard title="Children" value={stats.children} icon={Baby} tone="chart4" />
          <DashboardStatCard
            title="Youth"
            value={stats.youth}
            icon={PersonStanding}
            tone="chart5"
          />
          <DashboardStatCard
            title="Senior Citizens"
            value={stats.seniorCitizens}
            icon={Heart}
            tone="chart2"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="panel-surface xl:col-span-2 xl:row-span-2">
          <CardHeader>
            <CardTitle>Village-wise Population</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="w-full"
              style={{ height: Math.max(260, villagePopulation.length * 32) }}
              config={{
                members: { label: "Members", color: "var(--color-primary)" },
              }}
            >
              <BarChart data={villagePopulation} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={160}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  name="members"
                  fill="var(--color-members)"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[180px] w-full"
              config={{
                Male: { label: "Male", color: "var(--color-chart-1)" },
                Female: { label: "Female", color: "var(--color-chart-3)" },
              }}
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={genderDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={38}
                  outerRadius={64}
                >
                  {genderDistribution.map((entry) => (
                    <Cell key={entry.name} fill={`var(--color-${entry.name})`} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Marital Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {maritalStatusDistribution.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No marital status recorded yet.
              </p>
            ) : (
              <ChartContainer
                className="h-[180px] w-full"
                config={Object.fromEntries(
                  maritalStatusDistribution.map((entry) => [
                    entry.name,
                    { label: entry.name, color: maritalStatusColor(entry.name) },
                  ]),
                )}
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={maritalStatusDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={38}
                    outerRadius={64}
                  >
                    {maritalStatusDistribution.map((entry) => (
                      <Cell key={entry.name} fill={maritalStatusColor(entry.name)} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="panel-surface xl:col-span-2">
          <CardHeader>
            <CardTitle>Occupation Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[260px] w-full"
              config={{
                members: { label: "Members", color: "var(--color-chart-2)" },
              }}
            >
              <BarChart data={occupationDistribution}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  name="members"
                  fill="var(--color-members)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[260px] w-full"
              config={{
                members: { label: "Members", color: "var(--color-chart-5)" },
              }}
            >
              <BarChart data={ageDistribution}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  name="members"
                  fill="var(--color-members)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Recent Families Added</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Head of Family</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead className="text-right">Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentFamilies.map((family) => (
                  <TableRow key={family.id}>
                    <TableCell>
                      <Link
                        to="/population/families/$familyId"
                        params={{ familyId: family.id }}
                        className="font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {family.headOfFamily}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{family.villageName}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(family.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Recent Members Added</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead className="text-right">Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <span className="font-medium text-foreground">{member.fullName}</span>
                      <p className="text-xs text-muted-foreground">
                        {member.gender} · {member.age} yrs
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.villageName}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(member.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {timeline.map((item) => (
              <article
                key={item.id}
                className="rounded-md border border-border bg-background/70 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <Badge variant="outline">{formatDate(item.timestamp)}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
