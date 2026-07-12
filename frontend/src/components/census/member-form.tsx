import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  CHURCH_GROUP_OPTIONS,
  EDUCATION_OPTIONS,
  JOB_OPTIONS,
  OTHER_VALUE,
  RELATION_OPTIONS,
} from "@/constants/census-form-options";
import {
  createEmptyMember,
  type CensusMemberInput,
  type OptionWithOther,
} from "@/types/census-intake";
import { calculateAge, toIsoDate } from "@/utils/date";
import { cn } from "@/lib/utils";
import { SelectWithOther } from "@/components/census/select-with-other";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type FormErrors = Partial<
  Record<"name" | "dob" | "relation" | "education" | "job" | "churchGroup", string>
>;

function isOptionValid(option: OptionWithOther, required: boolean) {
  if (option.value === OTHER_VALUE) return option.otherValue.trim().length > 0;
  if (required) return option.value.trim().length > 0;
  return true;
}

export function MemberForm({
  isHead,
  onSubmit,
  onCancel,
}: {
  isHead: boolean;
  onSubmit: (member: CensusMemberInput) => void;
  onCancel: () => void;
}) {
  const [member, setMember] = useState<CensusMemberInput>(() => createEmptyMember(isHead));
  const [errors, setErrors] = useState<FormErrors>({});

  const dobDate = member.dob ? new Date(member.dob) : undefined;

  const handleSubmit = () => {
    const nextErrors: FormErrors = {};
    if (!member.name.trim()) nextErrors.name = "Name is required";
    if (!member.dob) nextErrors.dob = "Date of birth is required";
    if (!isHead && !isOptionValid(member.relation, true)) {
      nextErrors.relation = "Relation with head of family is required";
    }
    if (!isOptionValid(member.education, false))
      nextErrors.education = "Please specify the education";
    if (!isOptionValid(member.job, false)) nextErrors.job = "Please specify the job";
    if (!isOptionValid(member.churchGroup, false))
      nextErrors.churchGroup = "Please specify the church group";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({ ...member, name: member.name.trim(), phone: member.phone.trim() });
  };

  return (
    <Card className="panel-surface rounded-xl">
      <CardHeader>
        <CardTitle>{isHead ? "Add Head of Family" : "Add Family Member"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="member-name">
              Name<span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Input
              id="member-name"
              placeholder="Full name"
              value={member.name}
              onChange={(event) => setMember((prev) => ({ ...prev, name: event.target.value }))}
            />
            {errors.name ? (
              <p className="text-xs font-medium text-destructive">{errors.name}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member-phone">Phone Number</Label>
            <Input
              id="member-phone"
              type="tel"
              placeholder="10-digit mobile number"
              value={member.phone}
              onChange={(event) => setMember((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member-dob">
              Date of Birth<span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="member-dob"
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !member.dob && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="size-4" />
                  {dobDate ? format(dobDate, "PPP") : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dobDate}
                  captionLayout="dropdown"
                  startMonth={new Date(1920, 0)}
                  endMonth={new Date()}
                  disabled={{ after: new Date() }}
                  onSelect={(date) => {
                    if (!date) return;
                    setMember((prev) => ({ ...prev, dob: toIsoDate(date) }));
                  }}
                  initialFocus
                  className="pointer-events-auto p-3"
                />
              </PopoverContent>
            </Popover>
            {errors.dob ? (
              <p className="text-xs font-medium text-destructive">{errors.dob}</p>
            ) : dobDate ? (
              <p className="text-xs text-muted-foreground">Age: {calculateAge(member.dob)} years</p>
            ) : null}
          </div>

          {isHead ? null : (
            <SelectWithOther
              id="member-relation"
              label="Relation with Head of Family"
              options={RELATION_OPTIONS}
              value={member.relation}
              onChange={(relation) => setMember((prev) => ({ ...prev, relation }))}
              placeholder="Select relation"
              required
              error={errors.relation}
            />
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectWithOther
            id="member-education"
            label="Education"
            options={EDUCATION_OPTIONS}
            value={member.education}
            onChange={(education) => setMember((prev) => ({ ...prev, education }))}
            placeholder="Select education"
            error={errors.education}
          />

          <SelectWithOther
            id="member-job"
            label="Job"
            options={JOB_OPTIONS}
            value={member.job}
            onChange={(job) => setMember((prev) => ({ ...prev, job }))}
            placeholder="Select job"
            error={errors.job}
          />

          <SelectWithOther
            id="member-church-group"
            label="Church Group"
            options={CHURCH_GROUP_OPTIONS}
            value={member.churchGroup}
            onChange={(churchGroup) => setMember((prev) => ({ ...prev, churchGroup }))}
            placeholder="Select church group"
            error={errors.churchGroup}
          />
        </section>

        <div className="space-y-1.5">
          <Label htmlFor="member-remark">Special Remark</Label>
          <Textarea
            id="member-remark"
            rows={2}
            placeholder="Any additional notes about this member (optional)"
            value={member.specialRemark}
            onChange={(event) =>
              setMember((prev) => ({ ...prev, specialRemark: event.target.value }))
            }
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {isHead ? "Save Head of Family" : "Save Member"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
