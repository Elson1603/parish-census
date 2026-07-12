import type { ReactNode } from "react";
import { ThemeProvider } from "@/context/theme-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />

          <SidebarInset>
            <TopNav />

            <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-8 pt-5 sm:px-6 lg:px-8">
              {children}
            </main>

            <footer className="mt-auto border-t border-border bg-card/60 px-4 py-4 sm:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-1.5 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
                <p className="font-medium text-foreground/70">
                  Our Lady of Lourdes Church, Shirlai
                </p>
                <p>Parish Population Census Management System</p>
              </div>
            </footer>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
