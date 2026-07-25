import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/http";

async function checkBackendHealth() {
  await apiClient.get("/health");
  return true;
}

export function BackendStatus() {
  const query = useQuery({
    queryKey: ["backend-health"],
    queryFn: checkBackendHealth,
    refetchInterval: 10000,
    retry: false,
  });

  const isRunning = query.isSuccess;
  const label = query.isLoading
    ? "Checking backend"
    : isRunning
      ? "Backend running"
      : "Backend offline";
  const dotClass = isRunning ? "bg-emerald-500" : query.isLoading ? "bg-red-500" : "bg-destructive";

  return (
    <div className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-input bg-background/70 px-3 text-sm font-medium text-muted-foreground shadow-sm">
      <span className={`size-2 rounded-full ${dotClass}`} />
      <span>{label}</span>
    </div>
  );
}
