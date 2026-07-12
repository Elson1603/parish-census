import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  Building2,
  Cake,
  Church,
  GraduationCap,
  Heart,
  LayoutDashboard,
  MessageSquare,
  UserRound,
  Users,
  UserSquare,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getReportsList } from "@/services/census.service";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

const REPORT_ICONS: Record<string, typeof LayoutDashboard> = {
  "dashboard-statistics": LayoutDashboard,
  "village-population": Building2,
  family: UserSquare,
  member: Users,
  age: Cake,
  gender: UserRound,
  "marital-status": Heart,
  education: GraduationCap,
  job: Briefcase,
  "church-group": Church,
  "special-remark": MessageSquare,
};

function ReportsPage() {
  const query = useQuery({ queryKey: ["reports"], queryFn: getReportsList });

  if (query.isLoading) return <LoadingSpinner label="Loading reports..." />;
  if (query.isError)
    return (
      <ErrorState
        title="Unable to load reports"
        description="Please retry."
        onRetry={() => query.refetch()}
      />
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="View, print, and export detailed census reports for analysis."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {query.data?.map((report) => {
          const Icon = REPORT_ICONS[report.reportType] ?? LayoutDashboard;
          return (
            <Card key={report.reportType} className="panel-surface flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <p className="text-sm text-muted-foreground">{report.description}</p>
                <Button asChild className="w-full">
                  <Link to="/reports/$reportType" params={{ reportType: report.reportType }}>
                    View Report
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
