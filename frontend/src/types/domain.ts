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
  houseNumber: string;
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
  houseNumber: string;
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
  churchGroup: string;
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

export interface ReportFilter {
  village?: string;
  occupation?: string;
  education?: string;
  fromDate?: string;
  toDate?: string;
}

export interface ReportResultRow {
  id: string;
  label: string;
  village: string;
  families: number;
  members: number;
  male: number;
  female: number;
}

export type ReportType =
  | "village-population"
  | "family"
  | "member"
  | "occupation"
  | "education"
  | "blood-group"
  | "age"
  | "gender"
  | "church-group"
  | "sacraments"
  | "special-needs";
