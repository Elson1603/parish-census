import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { ThemeProvider } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { LoginScreen } from "@/components/common/login-screen";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

function isAdminRoute(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname === "/reports" ||
    pathname === "/population" ||
    pathname.startsWith("/reports/") ||
    pathname.startsWith("/population/")
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const { isReady, role, logout } = useAuth();
  const adminRoute = isAdminRoute(pathname);

  return (
    <ThemeProvider>
      {!isReady ? (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">
          Loading...
        </div>
      ) : adminRoute ? (
        role === "admin" ? (
          <AdminShell>{children}</AdminShell>
        ) : (
          <LoginScreen role="admin" />
        )
      ) : role === "user" ? (
        <UserShell onLogout={logout}>{children}</UserShell>
      ) : role === "admin" ? (
        <AdminShell>{children}</AdminShell>
      ) : (
        <LoginScreen role="user" />
      )}
    </ThemeProvider>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <SidebarInset>
          <TopNav />

          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-8 pt-5 sm:px-6 lg:px-8">
            {children}
          </main>

          <AppFooter />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function UserShell({ children, onLogout }: { children: ReactNode; onLogout: () => void }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/85 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              Our Lady of Lourdes Church, Shirlai
            </p>
            <p className="truncate text-xs text-muted-foreground">Parish Census Data Entry</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-8 pt-5 sm:px-6 lg:px-8">
        {children}
      </main>

      <AppFooter />
    </div>
  );
}

function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card/60 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-1.5 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
        <p className="font-medium text-foreground/70">Our Lady of Lourdes Church, Shirlai</p>
        <p>Parish Population Census Management System</p>
      </div>
    </footer>
  );
}
