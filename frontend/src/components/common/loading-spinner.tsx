import { LoaderCircle } from "lucide-react";

export function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <LoaderCircle className="size-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
