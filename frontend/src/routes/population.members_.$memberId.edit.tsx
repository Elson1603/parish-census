import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { getMemberById, updateMember } from "@/services/census.service";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  CHURCH_GROUP_OPTIONS,
  EDUCATION_OPTIONS,
  JOB_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  OTHER_VALUE,
} from "@/constants/census-form-options";
import { resolveOptionLabel, type OptionWithOther } from "@/types/census-intake";
import { memberFormSchema, type MemberFormValues } from "@/types/forms";
import { calculateAge, parseIsoDate, toIsoDate } from "@/utils/date";
import { cn } from "@/lib/utils";
import { SelectWithOther } from "@/components/census/select-with-other";
import { MultiSelectWithOther } from "@/components/census/multi-select-with-other";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";

export const Route = createFileRoute("/population/members_/$memberId/edit")({
  component: EditMemberPage,
});

// Adapts a plain string field (as stored on Member) to the {value, otherValue}
// shape SelectWithOther needs, so an existing value that isn't one of the fixed
// options (e.g. custom text entered via "Other" during intake) still shows up
// pre-filled in the "Other" text box instead of appearing blank/unselected.
function toOption(value: string, options: readonly string[]): OptionWithOther {
  if (!value) return { value: "", otherValue: "" };
  if (options.includes(value)) return { value, otherValue: "" };
  return { value: OTHER_VALUE, otherValue: value };
}

function EditMemberPage() {
  const { memberId } = Route.useParams();
  const navigate = useNavigate();

  const memberQuery = useQuery({
    queryKey: ["member", memberId],
    queryFn: () => getMemberById(memberId),
  });

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      fullName: "",
      gender: "",
      dob: "",
      age: 0,
      photoUrl: "",
      mobile: "",
      email: "",
      baptized: false,
      firstCommunion: false,
      confirmation: false,
      churchMarriage: false,
      villageId: "",
      familyId: "",
      relationshipWithHead: "",
      maritalStatus: "",
      education: "",
      occupation: "",
      churchGroup: [],
      remarks: "",
    },
  });

  const member = memberQuery.data;
  React.useEffect(() => {
    if (!member) return;
    // villageId/familyId/email/photoUrl/sacraments aren't shown in this form
    // (it mirrors the census intake wizard's fields only), but are carried
    // through unchanged so saving doesn't wipe out data set elsewhere.
    form.reset({
      fullName: member.fullName,
      gender: member.gender,
      dob: member.dob,
      age: member.age,
      photoUrl: member.photoUrl ?? "",
      mobile: member.mobile,
      email: member.email ?? "",
      baptized: member.baptized,
      firstCommunion: member.firstCommunion,
      confirmation: member.confirmation,
      churchMarriage: member.churchMarriage,
      villageId: member.villageId,
      familyId: member.familyId,
      relationshipWithHead: member.relationshipWithHead,
      maritalStatus: member.maritalStatus,
      education: member.education,
      occupation: member.occupation,
      churchGroup: member.churchGroup,
      remarks: member.remarks ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  const unsavedChangesDialog = useUnsavedChangesWarning(form.formState.isDirty);

  if (memberQuery.isLoading) return <LoadingSpinner label="Loading member..." />;
  if (memberQuery.isError)
    return (
      <ErrorState
        title="Unable to load member"
        description="Please retry."
        onRetry={() => memberQuery.refetch()}
      />
    );

  const onSubmit = async (values: MemberFormValues) => {
    try {
      await updateMember(memberId, values);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update member. Please try again."));
      return;
    }
    // Re-baseline the form to what we just saved so the unsaved-changes blocker
    // doesn't intercept this intentional navigation right after a successful save.
    form.reset(values);
    toast.success("Member updated successfully");
    navigate({ to: "/population/members" });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link to="/population/members" className="text-sm text-primary hover:underline">
          ← Back to members
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Edit Member</h1>
        <p className="text-sm text-muted-foreground">
          Update the details recorded for this parish member.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="panel-surface space-y-5 rounded-lg p-4"
        >
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name<span className="ml-0.5 text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="10-digit mobile number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Gender<span className="ml-0.5 text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marital Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        {MARITAL_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => {
                const value = field.value ? parseIsoDate(field.value) : undefined;

                return (
                  <FormItem>
                    <FormLabel>
                      Date of Birth<span className="ml-0.5 text-destructive">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="size-4" />
                            {value ? format(value, "PPP") : <span>Pick date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={value}
                          captionLayout="dropdown"
                          startMonth={new Date(1920, 0)}
                          endMonth={new Date()}
                          disabled={{ after: new Date() }}
                          onSelect={(date) => {
                            if (!date) return;
                            const iso = toIsoDate(date);
                            field.onChange(iso);
                            form.setValue("age", calculateAge(iso), { shouldValidate: true });
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    {value ? (
                      <p className="text-xs text-muted-foreground">
                        Age: {calculateAge(field.value)} years
                      </p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="relationshipWithHead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Relation with Head of Family<span className="ml-0.5 text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Head / Spouse / Son / Daughter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <SelectWithOther
                  id="edit-education"
                  label="Education"
                  options={EDUCATION_OPTIONS}
                  value={toOption(field.value ?? "", EDUCATION_OPTIONS)}
                  onChange={(option) => field.onChange(resolveOptionLabel(option))}
                  placeholder="Select education"
                />
              )}
            />

            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <SelectWithOther
                  id="edit-job"
                  label="Job"
                  options={JOB_OPTIONS}
                  value={toOption(field.value ?? "", JOB_OPTIONS)}
                  onChange={(option) => field.onChange(resolveOptionLabel(option))}
                  placeholder="Select job"
                />
              )}
            />

            <FormField
              control={form.control}
              name="churchGroup"
              render={({ field }) => (
                <MultiSelectWithOther
                  id="edit-church-group"
                  label="Church Group"
                  options={CHURCH_GROUP_OPTIONS}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Select church group"
                />
              )}
            />
          </section>

          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Remark</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder="Any additional notes about this member (optional)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/population/members" })}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
      {unsavedChangesDialog}
    </div>
  );
}
