import { BarChart3, Building2, Home, LayoutDashboard, Users, UserSquare } from "lucide-react";

export interface NavItem {
  title: string;
  to: string;
  icon: typeof Home;
}

export interface NavSection {
  title: string;
  to: string;
  icon: typeof Home;
  children?: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Census Data Entry",
    to: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Population Census",
    to: "/population/villages",
    icon: Users,
    children: [
      { title: "Villages", to: "/population/villages", icon: Building2 },
      { title: "Families", to: "/population/families", icon: UserSquare },
      { title: "Members", to: "/population/members", icon: Users },
    ],
  },
  {
    title: "Reports",
    to: "/reports",
    icon: BarChart3,
  },
];
