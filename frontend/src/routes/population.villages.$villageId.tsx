import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { getFamilies, getMembers, getVillages } from "@/services/census.service";

export const Route = createFileRoute("/population/villages/$villageId")({
  component: VillageDetailPage,
});

function VillageDetailPage() {
  const { villageId } = Route.useParams();
  const villagesQuery = useQuery({ queryKey: ["villages"], queryFn: getVillages });
  const familiesQuery = useQuery({ queryKey: ["families", { village: villageId }], queryFn: () => getFamilies({ village: villageId }) });
  const membersQuery = useQuery({ queryKey: ["members", { village: villageId }], queryFn: () => getMembers({ village: villageId }) });

  if (villagesQuery.isLoading || familiesQuery.isLoading || membersQuery.isLoading)
    return <LoadingSpinner label="Loading village details..." />;

  if (villagesQuery.isError || familiesQuery.isError || membersQuery.isError)
    return <ErrorState title="Unable to load village" description="Please retry." />;

  const village = villagesQuery.data?.find((item) => item.id === villageId);
  const families = familiesQuery.data ?? [];
  const members = membersQuery.data ?? [];

  const sacramentStats = useMemo(
    () => ({
      baptized: members.filter((item) => item.baptized).length,
      communion: members.filter((item) => item.firstCommunion).length,
      confirmation: members.filter((item) => item.confirmation).length,
      marriage: members.filter((item) => item.churchMarriage).length,
    }),
    [members],
  );

  if (!village) {
    return <ErrorState title="Village not found" description="The selected village does not exist." />;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link to="/population/villages" className="text-sm text-primary hover:underline">
          ← Back to villages
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">{village.name}</h1>
        <p className="text-sm text-muted-foreground">Village-level census profile and sacramental summary.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Total Families</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{families.length}</p>
          </CardContent>
        </Card>

        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{members.length}</p>
          </CardContent>
        </Card>

        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Population Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant="secondary">Male: {members.filter((item) => item.gender === "Male").length}</Badge>
            <Badge variant="outline">Female: {members.filter((item) => item.gender === "Female").length}</Badge>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Sacraments</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-border bg-background/70 p-3">Baptized: {sacramentStats.baptized}</div>
            <div className="rounded-md border border-border bg-background/70 p-3">First Communion: {sacramentStats.communion}</div>
            <div className="rounded-md border border-border bg-background/70 p-3">Confirmation: {sacramentStats.confirmation}</div>
            <div className="rounded-md border border-border bg-background/70 p-3">Church Marriage: {sacramentStats.marriage}</div>
          </CardContent>
        </Card>

        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Families in {village.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {families.map((family) => (
                <li key={family.id}>
                  <Link
                    to="/population/families/$familyId"
                    params={{ familyId: family.id }}
                    className="text-sm text-foreground hover:text-primary"
                  >
                    {family.headOfFamily} · {family.houseNumber}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
