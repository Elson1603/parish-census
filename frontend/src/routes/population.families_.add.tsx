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
      headOfFamily: "",
      primaryMobile: "",
    },
  });

  const unsavedChangesDialog = useUnsavedChangesWarning(form.formState.isDirty);

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
      headOfFamily: values.headOfFamily,
      contactNumber: values.primaryMobile,
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="10-digit mobile number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit">Save Family</Button>
          </div>
        </form>
      </Form>
      {unsavedChangesDialog}
    </div>
  );
}
