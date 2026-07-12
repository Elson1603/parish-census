import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { getFamilyById } from "@/services/census.service";

export const Route = createFileRoute("/population/families/$familyId")({
  component: FamilyDetailPage,
});

function FamilyDetailPage() {
  const { familyId } = Route.useParams();
  const query = useQuery({ queryKey: ["family", familyId], queryFn: () => getFamilyById(familyId) });

  if (query.isLoading) return <LoadingSpinner label="Loading family profile..." />;
  if (query.isError || !query.data)
    return <ErrorState title="Unable to load family" description="Please retry." onRetry={() => query.refetch()} />;

  const { family, familyMembers } = query.data;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link to="/population/families" className="text-sm text-primary hover:underline">
          ← Back to families
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">{family.headOfFamily}</h1>
        <p className="text-sm text-muted-foreground">Family profile, contacts, and members.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="panel-surface lg:col-span-2">
          <CardHeader>
            <CardTitle>Family Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-md border border-border bg-background/70 p-3 text-sm">House No: {family.houseNumber}</div>
            <div className="rounded-md border border-border bg-background/70 p-3 text-sm">Village: {family.villageName}</div>
            <div className="rounded-md border border-border bg-background/70 p-3 text-sm">Primary Mobile: {family.contactNumber}</div>
            <div className="rounded-md border border-border bg-background/70 p-3 text-sm">Alternate: {family.alternateNumber || "—"}</div>
            <div className="rounded-md border border-border bg-background/70 p-3 text-sm md:col-span-2">Address: {family.address}</div>
            <div className="rounded-md border border-border bg-background/70 p-3 text-sm md:col-span-2">Remarks: {family.remarks || "—"}</div>
          </CardContent>
        </Card>

        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant="secondary">Total Members: {familyMembers.length}</Badge>
            <Badge variant="outline">Male: {familyMembers.filter((m) => m.gender === "Male").length}</Badge>
            <Badge variant="outline">Female: {familyMembers.filter((m) => m.gender === "Female").length}</Badge>
          </CardContent>
        </Card>
      </section>

      <section className="panel-surface rounded-lg p-4">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Family Members</h2>
        <ul className="space-y-2">
          {familyMembers.map((member) => (
            <li key={member.id} className="rounded-md border border-border bg-background/70 p-3 text-sm">
              <p className="font-medium text-foreground">{member.fullName}</p>
              <p className="text-muted-foreground">
                {member.relationshipWithHead} · {member.gender} · {member.age} years
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
