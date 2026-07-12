import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Plus, UserPlus } from "lucide-react";
import { OTHER_VALUE } from "@/constants/census-form-options";
import {
  resolveOptionLabel,
  type CensusFamilyInput,
  type CensusMemberInput,
  type OptionWithOther,
} from "@/types/census-intake";
import { submitFamilyCensus } from "@/services/census.service";
import { VillageSelectStep } from "@/components/census/village-select-step";
import { MemberForm } from "@/components/census/member-form";
import { MemberSummaryList } from "@/components/census/member-summary-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: CensusIntakePage,
});

function villageLabel(village: OptionWithOther) {
  return village.value === OTHER_VALUE ? village.otherValue : village.value;
}

function buildFamilyPayload(family: CensusFamilyInput) {
  return {
    village: villageLabel(family.village),
    members: family.members.map((member) => ({
      name: member.name,
      phone: member.phone || undefined,
      dob: member.dob,
      relation: member.isHead ? "Head of Family" : resolveOptionLabel(member.relation),
      education: resolveOptionLabel(member.education) || undefined,
      job: resolveOptionLabel(member.job) || undefined,
      churchGroup: resolveOptionLabel(member.churchGroup) || undefined,
      specialRemark: member.specialRemark || undefined,
    })),
  };
}

function CensusIntakePage() {
  const [village, setVillage] = useState<OptionWithOther | null>(null);
  const [currentFamily, setCurrentFamily] = useState<CensusFamilyInput | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [familiesRecorded, setFamiliesRecorded] = useState(0);

  const startNewFamily = (forVillage: OptionWithOther) => {
    setCurrentFamily({ id: crypto.randomUUID(), village: forVillage, members: [] });
    setIsAddingMember(true);
  };

  const handleMemberSave = (member: CensusMemberInput) => {
    setCurrentFamily((prev) => (prev ? { ...prev, members: [...prev.members, member] } : prev));
    setIsAddingMember(false);
    toast.success(member.isHead ? "Head of family added" : "Member added");
  };

  const handleRemoveMember = (id: string) => {
    setCurrentFamily((prev) =>
      prev ? { ...prev, members: prev.members.filter((m) => m.id !== id) } : prev,
    );
  };

  const handleCancelMemberForm = () => {
    setIsAddingMember(false);
    if (currentFamily && currentFamily.members.length === 0) {
      setCurrentFamily(null);
    }
  };

  const finishFamily = async (currentFamilyValue: CensusFamilyInput) => {
    await submitFamilyCensus(buildFamilyPayload(currentFamilyValue));
    setFamiliesRecorded((count) => count + 1);
    toast.success("Family record saved");
  };

  const handleAddAnotherFamily = async () => {
    if (!currentFamily) return;
    const finished = currentFamily;
    await finishFamily(finished);
    startNewFamily(finished.village);
  };

  const handleChangeVillage = async () => {
    if (currentFamily && currentFamily.members.length > 0) {
      await finishFamily(currentFamily);
    }
    setCurrentFamily(null);
    setIsAddingMember(false);
    setVillage(null);
  };

  if (!village) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 py-8">
        <VillageSelectStep onContinue={(selected) => setVillage(selected)} />
        <Link
          to="/dashboard"
          className="text-xs text-muted-foreground hover:text-primary hover:underline"
        >
          Go to admin dashboard instead
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <header className="space-y-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Village: {villageLabel(village)}
          {familiesRecorded > 0
            ? ` · ${familiesRecorded} famil${familiesRecorded === 1 ? "y" : "ies"} recorded`
            : ""}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Family Census Data Collection
        </h1>
      </header>

      {!currentFamily ? (
        <Card className="panel-surface rounded-xl">
          <CardHeader className="items-center text-center">
            <CardTitle>Ready to record a family</CardTitle>
            <p className="text-sm text-muted-foreground">
              Start a new family in {villageLabel(village)}, or switch to a different village.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" onClick={() => startNewFamily(village)}>
              <Plus className="size-4" />
              Add Family
            </Button>
            <Button type="button" variant="outline" onClick={() => setVillage(null)}>
              <ArrowLeft className="size-4" />
              Select Another Village
            </Button>
          </CardContent>
        </Card>
      ) : isAddingMember ? (
        <MemberForm
          isHead={currentFamily.members.length === 0}
          onSubmit={handleMemberSave}
          onCancel={handleCancelMemberForm}
        />
      ) : (
        <div className="space-y-4">
          <Card className="panel-surface rounded-xl">
            <CardHeader>
              <CardTitle>
                Family of {currentFamily.members[0]?.name ?? "—"} · {currentFamily.members.length}{" "}
                member
                {currentFamily.members.length === 1 ? "" : "s"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MemberSummaryList members={currentFamily.members} onRemove={handleRemoveMember} />

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsAddingMember(true)}
              >
                <UserPlus className="size-4" />
                Add Member
              </Button>
            </CardContent>
          </Card>

          <Card className="panel-surface rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Finished adding members for this family?
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" className="flex-1" onClick={handleAddAnotherFamily}>
                <Plus className="size-4" />
                Save &amp; Add Another Family
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleChangeVillage}
              >
                <ArrowLeft className="size-4" />
                Save &amp; Select Another Village
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
