import { useBlocker } from "@tanstack/react-router";
import { useEffect } from "react";

export function useUnsavedChangesWarning(isDirty: boolean) {
  useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: isDirty,
  });

  useEffect(() => {
    if (!isDirty) return;
    const listener = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, [isDirty]);
}
