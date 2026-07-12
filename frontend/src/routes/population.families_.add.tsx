import { useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAutoSaveDraft } from "@/hooks/use-autosave-draft";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import { createFamily, getVillages, saveFamilyDraft } from "@/services/census.service";
import { familyFormSchema, type FamilyFormValues } from "@/types/forms";
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
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";

export const Route = createFileRoute("/population/families_/add")({
  component: AddFamilyPage,
});

function AddFamilyPage() {
  const villagesQuery = useQuery({ queryKey: ["villages"], queryFn: getVillages });

  const form = useForm<FamilyFormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      villageId: "",
      houseNumber: "",
      headOfFamily: "",
      primaryMobile: "",
      alternateMobile: "",
      email: "",
      address: "",
      remarks: "",
    },
  });

  useUnsavedChangesWarning(form.formState.isDirty);

  const autoSave = useCallback(async (values: FamilyFormValues) => {
    await saveFamilyDraft(values);
  }, []);

  useAutoSaveDraft(form.watch(), form.formState.isDirty, autoSave);

  if (villagesQuery.isLoading) return <LoadingSpinner label="Loading form..." />;
  if (villagesQuery.isError)
    return (
      <ErrorState
        title="Unable to load villages"
        description="Please retry."
        onRetry={() => villagesQuery.refetch()}
      />
    );

  const onSubmit = async (values: FamilyFormValues) => {
    await createFamily({
      villageId: values.villageId,
      houseNumber: values.houseNumber,
      headOfFamily: values.headOfFamily,
      contactNumber: values.primaryMobile,
      alternateNumber: values.alternateMobile,
      email: values.email,
      address: values.address,
      remarks: values.remarks,
    });
    toast.success("Family saved successfully");
    form.reset();
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link to="/population/families" className="text-sm text-primary hover:underline">
          ← Back to families
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Add Family</h1>
        <p className="text-sm text-muted-foreground">
          Register a new family under parish population census.
        </p>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="panel-surface space-y-4 rounded-lg p-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="villageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Village</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
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
              name="houseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House Number</FormLabel>
                  <FormControl>
                    <Input placeholder="H-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headOfFamily"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Head of Family</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="primaryMobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Mobile</FormLabel>
                  <FormControl>
                    <Input placeholder="10-digit mobile" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alternateMobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alternate Mobile</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
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
                    <Input type="email" placeholder="family@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="Street, area, village" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Optional notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit">Save Family</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
