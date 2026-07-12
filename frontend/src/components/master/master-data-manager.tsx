import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMasterDataItem,
  deleteMasterDataItem,
  getMasterData,
  updateMasterDataItem,
} from "@/services/census.service";
import type { MasterDataKey } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";

export function MasterDataManager({
  title,
  keyName,
  description,
}: {
  title: string;
  keyName: MasterDataKey;
  description: string;
}) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["master", keyName], queryFn: () => getMasterData(keyName) });
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["master", keyName] });

  const createMutation = useMutation({
    mutationFn: (name: string) => createMasterDataItem(keyName, name),
    onSuccess: (item) => {
      toast.success(`${title.slice(0, -1)} added`, { description: item.name });
      setDraft("");
      invalidate();
    },
    onError: () => toast.error("Unable to add item"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateMasterDataItem(keyName, id, name),
    onSuccess: (item) => {
      toast.success("Item updated", { description: item.name });
      setEditingId(null);
      setEditingValue("");
      invalidate();
    },
    onError: () => toast.error("Unable to update item"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMasterDataItem(keyName, id),
    onSuccess: (_data, id) => {
      const name = query.data?.find((item) => item.id === id)?.name ?? "";
      toast.success("Item deleted", { description: name });
      invalidate();
    },
    onError: () => toast.error("Unable to delete item"),
  });

  const rows = query.data ?? [];

  if (query.isLoading) return <LoadingSpinner label={`Loading ${title.toLowerCase()}...`} />;
  if (query.isError)
    return (
      <ErrorState
        title={`Unable to load ${title}`}
        description="Please retry."
        onRetry={() => query.refetch()}
      />
    );

  const addItem = () => {
    if (!draft.trim()) return;
    createMutation.mutate(draft.trim());
  };

  const startEdit = (id: string, value: string) => {
    setEditingId(id);
    setEditingValue(value);
  };

  const saveEdit = () => {
    if (!editingValue.trim() || !editingId) return;
    updateMutation.mutate({ id: editingId, name: editingValue.trim() });
  };

  const removeItem = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <Card className="panel-surface">
        <CardHeader>
          <CardTitle>Add new</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={`Enter ${title.slice(0, -1).toLowerCase()} name`}
            />
            <Button type="button" onClick={addItem} disabled={createMutation.isPending}>
              <Plus className="size-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title={`No ${title.toLowerCase()} yet`}
          description="Create the first item to start managing this master list."
        />
      ) : (
        <Card className="panel-surface">
          <CardHeader>
            <CardTitle>Existing {title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {rows.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border border-border bg-background/70 p-2"
                >
                  {editingId === item.id ? (
                    <Input
                      value={editingValue}
                      onChange={(event) => setEditingValue(event.target.value)}
                    />
                  ) : (
                    <span className="truncate text-sm text-foreground">{item.name}</span>
                  )}

                  <div className="flex items-center gap-1">
                    {editingId === item.id ? (
                      <Button
                        size="sm"
                        type="button"
                        onClick={saveEdit}
                        disabled={updateMutation.isPending}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() => startEdit(item.id, item.name)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
