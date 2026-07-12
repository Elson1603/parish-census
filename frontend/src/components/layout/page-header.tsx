import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border pb-5 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="h-6 w-1 rounded-full bg-primary" />
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
            {title}
          </h1>
        </div>
        <p className="mt-1.5 max-w-2xl pl-3.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
