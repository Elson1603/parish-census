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
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5 border-b border-border pb-6 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="h-5 w-1 rounded-full bg-primary" />
          <h1 className="truncate text-2xl font-semibold tracking-[-0.035em] text-foreground sm:text-[1.75rem]">
            {title}
          </h1>
        </div>
        <p className="mt-2 max-w-2xl pl-3.5 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
