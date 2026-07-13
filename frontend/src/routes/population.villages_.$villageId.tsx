import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { getFamilies, getMembers, getVillages } from "@/services/census.service";
import { calculateAge } from "@/utils/date";
import type { Member } from "@/types/domain";

export const Route = createFileRoute("/population/villages_/$villageId")({
  component: VillageDetailPage,
});

// Counts non-blank values for a field, sorted most-common first - used for the
// Education/Job/Church Group breakdowns, which are open-ended (unlike Gender
// or Marital Status) so we can't rely on a fixed set of buckets.
function countByField(members: Member[], key: "education" | "occupation") {
  const counts: Record<string, number> = {};
  for (const member of members) {
    const value = member[key];
    if (!value) continue;
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return Object.entries(counts).sort(([, a], [, b]) => b - a);
}

// Church group is multi-value (a member can belong to more than one group), so
// each of a member's groups contributes its own count instead of one-per-member.
function countByChurchGroup(members: Member[]) {
  const counts: Record<string, number> = {};
  for (const member of members) {
    for (const group of member.churchGroup) {
      counts[group] = (counts[group] ?? 0) + 1;
    }
  }
  return Object.entries(counts).sort(([, a], [, b]) => b - a);
}

function VillageDetailPage() {
  const { villageId } = Route.useParams();
  const villagesQuery = useQuery({ queryKey: ["villages"], queryFn: getVillages });
  const familiesQuery = useQuery({
    queryKey: ["families", { village: villageId }],
    queryFn: () => getFamilies({ village: villageId }),
  });
  const membersQuery = useQuery({
    queryKey: ["members", { village: villageId }],
    queryFn: () => getMembers({ village: villageId }),
  });

  const families = familiesQuery.data ?? [];
  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);

  const ageGroups = useMemo(() => {
    const buckets = { children: 0, youth: 0, adults: 0, seniors: 0 };
    for (const member of members) {
      const age = calculateAge(member.dob);
      if (age <= 12) buckets.children += 1;
      else if (age <= 25) buckets.youth += 1;
      else if (age < 60) buckets.adults += 1;
      else buckets.seniors += 1;
    }
    return buckets;
  }, [members]);

  const maritalStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const member of members) {
      if (!member.maritalStatus) continue;
      counts[member.maritalStatus] = (counts[member.maritalStatus] ?? 0) + 1;
    }
    return counts;
  }, [members]);

  const educationCounts = useMemo(() => countByField(members, "education"), [members]);
  const occupationCounts = useMemo(() => countByField(members, "occupation"), [members]);
  const churchGroupCounts = useMemo(() => countByChurchGroup(members), [members]);

  if (villagesQuery.isLoading || familiesQuery.isLoading || membersQuery.isLoading)
    return <LoadingSpinner label="Loading village details..." />;

  if (villagesQuery.isError || familiesQuery.isError || membersQuery.isError)
    return <ErrorState title="Unable to load village" description="Please retry." />;

  const village = villagesQuery.data?.find((item) => item.id === villageId);

  if (!village) {
    return (
      <ErrorState title="Village not found" description="The selected village does not exist." />
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link to="/population/villages" className="text-sm text-primary hover:underline">
          ← Back to villages
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">{village.name}</h1>
        <p className="text-sm text-muted-foreground">
          Village-level census profile and demographic summary.
        </p>
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
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Male: {members.filter((item) => item.gender === "Male").length}
            </Badge>
            <Badge variant="outline">
              Female: {members.filter((item) => item.gender === "Female").length}
            </Badge>
            {Object.entries(maritalStatusCounts).map(([status, count]) => (
              <Badge key={status} variant="outline">
                {status}: {count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Age Groups</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-border bg-background/70 p-3">
              Children (0-12): {ageGroups.children}
            </div>
            <div className="rounded-md border border-border bg-background/70 p-3">
              Youth (13-25): {ageGroups.youth}
            </div>
            <div className="rounded-md border border-border bg-background/70 p-3">
              Adults (26-59): {ageGroups.adults}
            </div>
            <div className="rounded-md border border-border bg-background/70 p-3">
              Seniors (60+): {ageGroups.seniors}
            </div>
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
                    {family.headOfFamily}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Education Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {educationCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No education data recorded yet.</p>
            ) : (
              educationCounts.map(([label, count]) => (
                <Badge key={label} variant="outline">
                  {label}: {count}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Job Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {occupationCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No job data recorded yet.</p>
            ) : (
              occupationCounts.map(([label, count]) => (
                <Badge key={label} variant="outline">
                  {label}: {count}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Church Group Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {churchGroupCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No church group data recorded yet.</p>
            ) : (
              churchGroupCounts.map(([label, count]) => (
                <Badge key={label} variant="outline">
                  {label}: {count}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
