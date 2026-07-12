import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SearchBar } from "@/components/common/search-bar";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getVillages } from "@/services/census.service";

export const Route = createFileRoute("/population/villages")({
  component: VillagesPage,
});

function VillagesPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["villages"], queryFn: getVillages });

  const rows = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return query.data ?? [];
    return (query.data ?? []).filter((item) => item.name.toLowerCase().includes(value));
  }, [query.data, search]);

  if (query.isLoading) return <LoadingSpinner label="Loading villages..." />;
  if (query.isError)
    return <ErrorState title="Unable to load villages" description="Please retry." onRetry={() => query.refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Village Management" description="Manage villages and drill into population census details." />

      <SearchBar value={search} onChange={setSearch} placeholder="Search village..." />

      {rows.length === 0 ? (
        <EmptyState title="No villages found" description="Try another search term." />
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((village) => (
            <Card key={village.id} className="panel-surface rounded-lg">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-foreground">{village.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Parish village unit</p>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <Building2 className="size-4" />
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Families: {village.totalFamilies}</Badge>
                  <Badge variant="outline">Members: {village.totalMembers}</Badge>
                </div>

                <Link
                  to="/population/villages/$villageId"
                  params={{ villageId: village.id }}
                  className="inline-flex text-sm font-medium text-primary hover:underline"
                >
                  View details
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
