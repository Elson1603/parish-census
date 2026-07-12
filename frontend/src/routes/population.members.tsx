import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
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
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { getMembers, getVillages } from "@/services/census.service";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/population/members")({
  component: MembersPage,
});

function MembersPage() {
  const [search, setSearch] = useState("");
  const [village, setVillage] = useState("all");
  const debouncedSearch = useDebouncedValue(search, 300);

  const villagesQuery = useQuery({ queryKey: ["villages"], queryFn: getVillages });
  const membersQuery = useQuery({
    queryKey: ["members", { search: debouncedSearch, village }],
    queryFn: () => getMembers({ search: debouncedSearch, village }),
    placeholderData: keepPreviousData,
  });

  if (villagesQuery.isLoading || membersQuery.isLoading)
    return <LoadingSpinner label="Loading members..." />;

  if (villagesQuery.isError || membersQuery.isError)
    return <ErrorState title="Unable to load members" description="Please retry." />;

  const rows = membersQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Management"
        description="Track individual parish members and household relationships."
        action={
          <Button asChild>
            <Link to="/population/members/add">
              <Plus className="size-4" />
              Add Member
            </Link>
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search member..."
        />

        <Select value={village} onValueChange={setVillage}>
          <SelectTrigger>
            <SelectValue placeholder="Village" />
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
        <EmptyState title="No members found" description="Try changing filters." />
      ) : (
        <section
          className={cn(
            "panel-surface rounded-lg p-3 transition-opacity",
            membersQuery.isFetching && "opacity-60",
          )}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>House No.</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.fullName}</TableCell>
                  <TableCell>{member.villageName}</TableCell>
                  <TableCell>{member.houseNumber}</TableCell>
                  <TableCell>{member.gender}</TableCell>
                  <TableCell>{member.age}</TableCell>
                  <TableCell>{member.mobile}</TableCell>
                  <TableCell>{member.occupation}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" asChild>
                      <Link
                        to="/population/members/$memberId/edit"
                        params={{ memberId: member.id }}
                      >
                        Edit
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
