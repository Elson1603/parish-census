import { X } from "lucide-react";
import type { CensusMemberInput } from "@/types/census-intake";
import { resolveOptionLabel } from "@/types/census-intake";
import { calculateAge, formatDate } from "@/utils/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function MetaBadge({ label }: { label: string }) {
  return (
    <Badge variant="secondary" className="font-normal">
      {label}
    </Badge>
  );
}

export function MemberSummaryList({
  members,
  onRemove,
}: {
  members: CensusMemberInput[];
  onRemove: (id: string) => void;
}) {
  return (
    <ul className="space-y-2.5">
      {members.map((member, index) => {
        const relationLabel = member.isHead
          ? "Head of Family"
          : resolveOptionLabel(member.relation) || "Relation not set";
        const education = resolveOptionLabel(member.education);
        const job = resolveOptionLabel(member.job);
        const churchGroups = member.churchGroup;

        return (
          <li key={member.id} className="rounded-lg border border-border bg-background/70 p-3.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground">{member.name}</span>
                  <Badge variant={member.isHead ? "default" : "outline"}>{relationLabel}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {member.dob
                    ? `${formatDate(member.dob)} · Age ${calculateAge(member.dob)}`
                    : "DOB not set"}
                  {member.phone ? ` · ${member.phone}` : ""}
                </p>
                {education || job || churchGroups.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {education ? <MetaBadge label={education} /> : null}
                    {job ? <MetaBadge label={job} /> : null}
                    {churchGroups.map((group) => (
                      <MetaBadge key={group} label={group} />
                    ))}
                  </div>
                ) : null}
                {member.specialRemark ? (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    "{member.specialRemark}"
                  </p>
                ) : null}
              </div>

              {index === 0 ? null : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(member.id)}
                  aria-label={`Remove ${member.name}`}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
