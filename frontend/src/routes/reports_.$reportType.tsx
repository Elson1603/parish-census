import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getReportData, getReportExportUrl } from "@/services/census.service";
import type { ReportChart, ReportTable } from "@/types/domain";

export const Route = createFileRoute("/reports_/$reportType")({
  component: ReportDetailPage,
});

const CHART_COLOR_VARS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function chartColor(index: number) {
  return CHART_COLOR_VARS[index % CHART_COLOR_VARS.length] as string;
}

function ReportChartView({ chart }: { chart: ReportChart }) {
  const data = chart.labels.map((label, index) => ({
    name: label,
    value: chart.values[index] ?? 0,
  }));
  const config = Object.fromEntries(
    chart.labels.map((label, index) => [label, { label, color: chartColor(index) }]),
  );

  return (
    <Card className="panel-surface">
      <CardHeader>
        <CardTitle className="text-base">{chart.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[220px] w-full" config={config}>
          {chart.kind === "pie" ? (
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={75}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColor(index)} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={110}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColor(index)} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ReportTableView({ title, table }: { title: string; table: ReportTable }) {
  if (table.rows.length === 0) {
    return (
      <Card className="panel-surface">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState title="No data" description="Nothing recorded for this report yet." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="panel-surface">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {table.headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ReportDetailPage() {
  const { reportType } = Route.useParams();
  const query = useQuery({
    queryKey: ["reports", reportType],
    queryFn: () => getReportData(reportType),
  });

  if (query.isLoading) return <LoadingSpinner label="Loading report..." />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        title="Unable to load report"
        description="Please retry."
        onRetry={() => query.refetch()}
      />
    );

  const report = query.data;
  const showSummarySeparately =
    report.summary !== null && JSON.stringify(report.summary) !== JSON.stringify(report.detail);
  const detailTitle =
    report.summary === null ? "Detail" : showSummarySeparately ? "Detail" : "Data";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link to="/reports" className="text-sm text-primary hover:underline">
          ← Back to reports
        </Link>
        <PageHeader
          title={report.title}
          description={report.description}
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <a
                  href={getReportExportUrl(reportType, "pdf", "inline")}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Printer className="size-4" />
                  Print
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={getReportExportUrl(reportType, "pdf")}>
                  <FileText className="size-4" />
                  Download PDF
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={getReportExportUrl(reportType, "excel")}>
                  <FileSpreadsheet className="size-4" />
                  Download Excel
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={getReportExportUrl(reportType, "csv")}>
                  <Download className="size-4" />
                  Download CSV
                </a>
              </Button>
            </div>
          }
        />
      </header>

      {report.charts.length > 0 ? (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {report.charts.map((chart) => (
            <ReportChartView key={chart.title} chart={chart} />
          ))}
        </section>
      ) : null}

      {showSummarySeparately && report.summary ? (
        <ReportTableView title="Summary" table={report.summary} />
      ) : null}

      <ReportTableView title={detailTitle} table={report.detail} />
    </div>
  );
}
