import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import {
  getFamilies,
  getMasterData,
  getMemberById,
  getVillages,
  updateMember,
} from "@/services/census.service";
import { getApiErrorMessage } from "@/lib/api-error";
import { memberFormSchema, type MemberFormValues } from "@/types/forms";
import { calculateAge, toIsoDate } from "@/utils/date";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";

export const Route = createFileRoute("/population/members_/$memberId/edit")({
  component: EditMemberPage,
});

function EditMemberPage() {
  const { memberId } = Route.useParams();
  const navigate = useNavigate();

  const memberQuery = useQuery({
    queryKey: ["member", memberId],
    queryFn: () => getMemberById(memberId),
  });
  const villagesQuery = useQuery({ queryKey: ["villages"], queryFn: getVillages });
  const occupationsQuery = useQuery({
    queryKey: ["master", "occupations"],
    queryFn: () => getMasterData("occupations"),
  });
  const educationQuery = useQuery({
    queryKey: ["master", "education"],
    queryFn: () => getMasterData("education"),
  });
  const churchGroupsQuery = useQuery({
    queryKey: ["master", "churchGroups"],
    queryFn: () => getMasterData("churchGroups"),
  });
  const maritalStatusQuery = useQuery({
    queryKey: ["master", "maritalStatus"],
    queryFn: () => getMasterData("maritalStatus"),
  });
  const bloodGroupsQuery = useQuery({
    queryKey: ["master", "bloodGroups"],
    queryFn: () => getMasterData("bloodGroups"),
  });
  const specialNeedsQuery = useQuery({
    queryKey: ["master", "specialNeeds"],
    queryFn: () => getMasterData("specialNeeds"),
  });

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      fullName: "",
      gender: "",
      dob: "",
      age: 0,
      photoUrl: "",
      bloodGroup: "",
      mobile: "",
      email: "",
      occupation: "",
      education: "",
      baptized: false,
      firstCommunion: false,
      confirmation: false,
      churchMarriage: false,
      churchGroup: "",
      villageId: "",
      familyId: "",
      relationshipWithHead: "",
      maritalStatus: "",
      specialNeeds: "",
      remarks: "",
    },
  });

  const member = memberQuery.data;
  React.useEffect(() => {
    if (!member) return;
    form.reset({
      fullName: member.fullName,
      gender: member.gender,
      dob: member.dob,
      age: member.age,
      photoUrl: member.photoUrl ?? "",
      bloodGroup: member.bloodGroup,
      mobile: member.mobile,
      email: member.email ?? "",
      occupation: member.occupation,
      education: member.education,
      baptized: member.baptized,
      firstCommunion: member.firstCommunion,
      confirmation: member.confirmation,
      churchMarriage: member.churchMarriage,
      churchGroup: member.churchGroup,
      villageId: member.villageId,
      familyId: member.familyId,
      relationshipWithHead: member.relationshipWithHead,
      maritalStatus: member.maritalStatus,
      specialNeeds: member.specialNeeds ?? "",
      remarks: member.remarks ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  const selectedVillageId = form.watch("villageId");
  const familiesQuery = useQuery({
    queryKey: ["families", { village: selectedVillageId || "all" }],
    queryFn: () => getFamilies({ village: selectedVillageId || "all" }),
    enabled: !!selectedVillageId,
  });

  useUnsavedChangesWarning(form.formState.isDirty);

  const loading =
    memberQuery.isLoading ||
    villagesQuery.isLoading ||
    occupationsQuery.isLoading ||
    educationQuery.isLoading ||
    churchGroupsQuery.isLoading ||
    maritalStatusQuery.isLoading ||
    bloodGroupsQuery.isLoading ||
    specialNeedsQuery.isLoading;

  const hasError =
    memberQuery.isError ||
    villagesQuery.isError ||
    occupationsQuery.isError ||
    educationQuery.isError ||
    churchGroupsQuery.isError ||
    maritalStatusQuery.isError ||
    bloodGroupsQuery.isError ||
    specialNeedsQuery.isError;

  if (loading) return <LoadingSpinner label="Loading member..." />;
  if (hasError)
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
          Update this parish member's household and sacramental details.
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
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Member name" {...field} />
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
                  <FormLabel>Gender</FormLabel>
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
              name="dob"
              render={({ field }) => {
                const value = field.value ? new Date(field.value) : undefined;

                return (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} readOnly value={field.value} />
                  </FormControl>
                  <FormDescription>Auto-calculated from date of birth.</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input placeholder="10-digit mobile" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Optional email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="villageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Village</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("familyId", "");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select village" />
                      </SelectTrigger>
                      <SelectContent>
                        {villagesQuery.data?.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
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
              name="familyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select family" />
                      </SelectTrigger>
                      <SelectContent>
                        {familiesQuery.data?.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.headOfFamily} ({item.houseNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="relationshipWithHead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship with Head</FormLabel>
                  <FormControl>
                    <Input placeholder="Head / Spouse / Son / Daughter" {...field} />
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
                        {maritalStatusQuery.data?.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
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
              name="bloodGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Group</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroupsQuery.data?.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupation</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select occupation" />
                      </SelectTrigger>
                      <SelectContent>
                        {occupationsQuery.data?.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
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
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select education" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationQuery.data?.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
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
              name="churchGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Church Group</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select church group" />
                      </SelectTrigger>
                      <SelectContent>
                        {churchGroupsQuery.data?.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="specialNeeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Needs</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select special needs" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialNeedsQuery.data?.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
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
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <FormField
              control={form.control}
              name="baptized"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 rounded-md border border-border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <FormLabel className="m-0">Baptized</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstCommunion"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 rounded-md border border-border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <FormLabel className="m-0">First Communion</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmation"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 rounded-md border border-border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <FormLabel className="m-0">Confirmation</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="churchMarriage"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 rounded-md border border-border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <FormLabel className="m-0">Church Marriage</FormLabel>
                </FormItem>
              )}
            />
          </section>

          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="Optional notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap justify-end gap-2">
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
    </div>
  );
}
