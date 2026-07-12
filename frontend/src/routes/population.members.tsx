import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { getMasterData, getMembers, getVillages } from "@/services/census.service";

export const Route = createFileRoute("/population/members")({
  component: MembersPage,
});

function MembersPage() {
  const [search, setSearch] = useState("");
  const [village, setVillage] = useState("all");
  const [occupation, setOccupation] = useState("all");
  const [education, setEducation] = useState("all");

  const villagesQuery = useQuery({ queryKey: ["villages"], queryFn: getVillages });
  const occupationsQuery = useQuery({ queryKey: ["master", "occupations"], queryFn: () => getMasterData("occupations") });
  const educationQuery = useQuery({ queryKey: ["master", "education"], queryFn: () => getMasterData("education") });
  const membersQuery = useQuery({
    queryKey: ["members", { search, village, occupation, education }],
    queryFn: () => getMembers({ search, village, occupation, education }),
  });

  if (villagesQuery.isLoading || occupationsQuery.isLoading || educationQuery.isLoading || membersQuery.isLoading)
    return <LoadingSpinner label="Loading members..." />;

  if (villagesQuery.isError || occupationsQuery.isError || educationQuery.isError || membersQuery.isError)
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

      <section className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search member..." />

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

        <Select value={occupation} onValueChange={setOccupation}>
          <SelectTrigger>
            <SelectValue placeholder="Occupation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All occupations</SelectItem>
            {occupationsQuery.data?.map((item) => (
              <SelectItem key={item.id} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={education} onValueChange={setEducation}>
          <SelectTrigger>
            <SelectValue placeholder="Education" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All education</SelectItem>
            {educationQuery.data?.map((item) => (
              <SelectItem key={item.id} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {rows.length === 0 ? (
        <EmptyState title="No members found" description="Try changing filters." />
      ) : (
        <section className="panel-surface rounded-lg p-3">
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
}
