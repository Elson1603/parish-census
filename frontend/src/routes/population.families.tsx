import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFamilies, getVillages } from "@/services/census.service";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/population/families")({
  component: FamiliesPage,
});

function FamiliesPage() {
  const [search, setSearch] = useState("");
  const [village, setVillage] = useState("all");
  const debouncedSearch = useDebouncedValue(search, 300);

  const villagesQuery = useQuery({ queryKey: ["villages"], queryFn: getVillages });
  const familiesQuery = useQuery({
    queryKey: ["families", { search: debouncedSearch, village }],
    queryFn: () => getFamilies({ search: debouncedSearch, village }),
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(() => familiesQuery.data ?? [], [familiesQuery.data]);

  if (villagesQuery.isLoading || familiesQuery.isLoading)
    return <LoadingSpinner label="Loading families..." />;

  if (villagesQuery.isError || familiesQuery.isError)
    return <ErrorState title="Unable to load families" description="Please retry." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Family Management"
        description="Browse, filter, and manage all parish families."
        action={
          <Button asChild>
            <Link to="/population/families/add">
              <Plus className="size-4" />
              Add Family
            </Link>
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search family or village..."
        />

        <Select value={village} onValueChange={setVillage}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by village" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All villages</SelectItem>
            {villagesQuery.data?.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {rows.length === 0 ? (
        <EmptyState title="No families found" description="Adjust filters and try again." />
      ) : (
        <section
          className={cn(
            "panel-surface rounded-lg p-3 transition-opacity",
            familiesQuery.isFetching && "opacity-60",
          )}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Head of Family</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((family) => (
                <TableRow key={family.id}>
                  <TableCell>{family.headOfFamily}</TableCell>
                  <TableCell>{family.villageName}</TableCell>
                  <TableCell>{family.contactNumber}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" asChild>
                      <Link to="/population/families/$familyId" params={{ familyId: family.id }}>
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
}
