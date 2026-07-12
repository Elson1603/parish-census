import {
  BarChart3,
  Building2,
  ClipboardList,
  HeartHandshake,
  Home,
  LayoutDashboard,
  Layers3,
  Settings,
  Users,
  UserSquare,
} from "lucide-react";

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
    title: "Master Data",
    to: "/master/occupations",
    icon: Layers3,
    children: [
      { title: "Occupations", to: "/master/occupations", icon: ClipboardList },
      { title: "Education", to: "/master/education", icon: ClipboardList },
      { title: "Church Groups", to: "/master/church-groups", icon: HeartHandshake },
      { title: "Marital Status", to: "/master/marital-status", icon: ClipboardList },
      { title: "Blood Groups", to: "/master/blood-groups", icon: ClipboardList },
      { title: "Special Needs", to: "/master/special-needs", icon: ClipboardList },
    ],
  },
  {
    title: "Reports",
    to: "/reports/village-population",
    icon: BarChart3,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: Settings,
  },
];

export const reportOptions = [
  { label: "Village-wise Population", value: "village-population" },
  { label: "Family Report", value: "family" },
  { label: "Member Report", value: "member" },
  { label: "Occupation Report", value: "occupation" },
  { label: "Education Report", value: "education" },
  { label: "Blood Group Report", value: "blood-group" },
  { label: "Age Report", value: "age" },
  { label: "Gender Report", value: "gender" },
  { label: "Church Group Report", value: "church-group" },
  { label: "Sacraments Report", value: "sacraments" },
  { label: "Special Needs Report", value: "special-needs" },
];
