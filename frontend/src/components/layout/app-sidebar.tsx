import { Link, useRouterState } from "@tanstack/react-router";
import { Church } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { navSections } from "@/components/layout/navigation";

export function AppSidebar() {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const adminNavSections = navSections.filter((section) => section.to !== "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="parish-gradient grid size-9 shrink-0 place-items-center rounded-lg text-sidebar-primary-foreground shadow-md shadow-black/20">
            <Church className="size-5" />
          </span>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                Parish Census
              </p>
              <h2 className="mt-0.5 truncate text-sm font-semibold leading-tight text-sidebar-foreground">
                Our Lady of Lourdes
              </h2>
            </div>
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavSections.map((section) => {
                const isSectionActive =
                  pathname === section.to ||
                  (section.children?.some((item) => pathname.startsWith(item.to)) ?? false);

                return (
                  <SidebarMenuItem key={section.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isSectionActive}
                      tooltip={section.title}
                      className="data-[active=true]:font-medium data-[active=true]:shadow-sm"
                    >
                      <Link to={section.to}>
                        <section.icon />
                        <span>{section.title}</span>
                      </Link>
                    </SidebarMenuButton>

                    {section.children ? (
                      <SidebarMenuSub className="border-sidebar-border/70">
                        {section.children.map((item) => (
                          <SidebarMenuSubItem key={item.to}>
                            <SidebarMenuSubButton asChild isActive={pathname.startsWith(item.to)}>
                              <Link to={item.to}>
                                <item.icon />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
