import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { useAutoSaveDraft } from "@/hooks/use-autosave-draft";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { createMember, getFamilies, getVillages, saveMemberDraft } from "@/services/census.service";
import { getApiErrorMessage } from "@/lib/api-error";
import { MARITAL_STATUS_OPTIONS } from "@/constants/census-form-options";
import { memberFormSchema, type MemberFormValues } from "@/types/forms";
import { calculateAge, parseIsoDate, toIsoDate } from "@/utils/date";
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

export const Route = createFileRoute("/population/members_/add")({
  component: AddMemberPage,
});

function AddMemberPage() {
  const villagesQuery = useQuery({ queryKey: ["villages"], queryFn: getVillages });

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
      remarks: "",
    },
  });

  const selectedVillageId = form.watch("villageId");
  const familiesQuery = useQuery({
    queryKey: ["families", { village: selectedVillageId || "all" }],
    queryFn: () => getFamilies({ village: selectedVillageId || "all" }),
  });

  useUnsavedChangesWarning(form.formState.isDirty);
  useAutoSaveDraft(form.watch(), form.formState.isDirty, async (values) => {
    await saveMemberDraft(values);
  });

  const loading = villagesQuery.isLoading || familiesQuery.isLoading;
  const hasError = villagesQuery.isError || familiesQuery.isError;

  if (loading) return <LoadingSpinner label="Loading member form..." />;
  if (hasError) return <ErrorState title="Unable to load form data" description="Please retry." />;

  const onSubmit = async (values: MemberFormValues) => {
    try {
      await createMember(values);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save member. Please try again."));
      return;
    }
    toast.success("Member saved successfully");
    form.reset();
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link to="/population/members" className="text-sm text-primary hover:underline">
          ← Back to members
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Add Member</h1>
        <p className="text-sm text-muted-foreground">
          Register a parish member with household and sacramental details.
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
                const value = field.value ? parseIsoDate(field.value) : undefined;

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

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          </section>

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
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit">Save Member</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
