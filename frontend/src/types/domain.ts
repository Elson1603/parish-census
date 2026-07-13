export type Gender = "Male" | "Female";

export interface Village {
  id: string;
  name: string;
  totalFamilies: number;
  totalMembers: number;
}

export interface Family {
  id: string;
  villageId: string;
  villageName: string;
  headOfFamily: string;
  contactNumber: string;
  alternateNumber?: string;
  email?: string;
  address: string;
  remarks?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  familyId: string;
  villageId: string;
  villageName: string;
  fullName: string;
  gender: Gender;
  dob: string;
  age: number;
  photoUrl?: string;
  bloodGroup: string;
  mobile: string;
  email?: string;
  occupation: string;
  education: string;
  baptized: boolean;
  firstCommunion: boolean;
  confirmation: boolean;
  churchMarriage: boolean;
  churchGroup: string[];
  relationshipWithHead: string;
  maritalStatus: string;
  specialNeeds?: string;
  remarks?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalVillages: number;
  totalFamilies: number;
  totalMembers: number;
  maleMembers: number;
  femaleMembers: number;
  children: number;
  youth: number;
  seniorCitizens: number;
  baptized: number;
  firstCommunion: number;
  confirmation: number;
  churchMarriage: number;
  completedFamilies: number;
  totalExpectedFamilies: number;
}

export interface ChartDatum {
  name: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardData {
  stats: DashboardStats;
  villagePopulation: ChartDatum[];
  genderDistribution: ChartDatum[];
  maritalStatusDistribution: ChartDatum[];
  occupationDistribution: ChartDatum[];
  ageDistribution: ChartDatum[];
  recentFamilies: Family[];
  recentMembers: Member[];
  timeline: ActivityItem[];
}

export interface ReportDefinition {
  reportType: string;
  title: string;
  description: string;
}

export interface ReportTable {
  headers: string[];
  rows: string[][];
}

export interface ReportChart {
  title: string;
  kind: "bar" | "pie";
  labels: string[];
  values: number[];
}

export interface ReportData {
  reportType: string;
  title: string;
  description: string;
  summary: ReportTable | null;
  detail: ReportTable;
  charts: ReportChart[];
}

export type ReportExportFormat = "pdf" | "excel" | "csv";
