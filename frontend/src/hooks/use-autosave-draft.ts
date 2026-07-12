import { useEffect } from "react";

export function useAutoSaveDraft<T>(
  values: T,
  enabled: boolean,
  onSave: (payload: T) => Promise<unknown>,
  intervalMs = 30000,
) {
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => {
      void onSave(values);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [values, enabled, onSave, intervalMs]);
}
