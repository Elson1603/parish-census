import type {
  DashboardData,
  Family,
  Member,
  ReportDefinition,
  ReportData,
  ReportExportFormat,
  Village,
} from "@/types/domain";
import { apiClient } from "@/services/http";

export const censusQueryKeys = {
  dashboard: ["dashboard"] as const,
  villages: ["villages"] as const,
  families: ["families"] as const,
  familyById: (familyId: string) => ["family", familyId] as const,
  members: ["members"] as const,
  reports: ["reports"] as const,
  reportData: (reportType: string) => ["reports", reportType] as const,
};

export interface MemberFilters {
  search?: string;
  village?: string;
  occupation?: string;
  education?: string;
  gender?: string;
  bloodGroup?: string;
  churchGroup?: string;
  specialNeeds?: string;
  maritalStatus?: string;
}

export interface FamilyFilters {
  search?: string;
  village?: string;
  houseNumber?: string;
}

function toParams<T extends object>(filters?: T) {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters ?? {})) {
    if (value) params[key] = String(value);
  }
  return params;
}

export async function getDashboardData() {
  const response = await apiClient.get<DashboardData>("/dashboard");
  return response.data;
}

export async function getVillages() {
  const response = await apiClient.get<Village[]>("/villages");
  return response.data;
}

export async function getFamilies(filters?: FamilyFilters) {
  const response = await apiClient.get<Family[]>("/families", { params: toParams(filters) });
  return response.data;
}

export async function getFamilyById(familyId: string) {
  const response = await apiClient.get<{ family: Family; familyMembers: Member[] }>(
    `/families/${familyId}`,
  );
  return response.data;
}

export async function getMembers(filters?: MemberFilters) {
  const response = await apiClient.get<Member[]>("/members", { params: toParams(filters) });
  return response.data;
}

export async function getMemberById(memberId: string) {
  const response = await apiClient.get<Member>(`/members/${memberId}`);
  return response.data;
}

export async function getReportsList() {
  const response = await apiClient.get<ReportDefinition[]>("/reports");
  return response.data;
}

export async function getReportData(reportType: string) {
  const response = await apiClient.get<ReportData>(`/reports/${reportType}`);
  return response.data;
}

export function getReportExportUrl(
  reportType: string,
  format: ReportExportFormat,
  mode: "inline" | "attachment" = "attachment",
) {
  const base = (apiClient.defaults.baseURL ?? "/api").replace(/\/$/, "");
  return `${base}/reports/${reportType}/export?format=${format}&mode=${mode}`;
}

export async function getGlobalSearchSuggestions(query: string) {
  const response = await apiClient.get<
    Array<{ id: string; type: string; label: string; meta: string }>
  >("/search", { params: { q: query } });
  return response.data;
}

export async function saveFamilyDraft(data: unknown) {
  const response = await apiClient.post("/drafts/family", data);
  return response.data;
}

export async function saveMemberDraft(data: unknown) {
  const response = await apiClient.post("/drafts/member", data);
  return response.data;
}

export async function createFamily(payload: unknown) {
  const response = await apiClient.post<Family>("/families", payload);
  return response.data;
}

export async function createMember(payload: unknown) {
  const response = await apiClient.post<Member>("/members", payload);
  return response.data;
}

export async function updateMember(memberId: string, payload: unknown) {
  const response = await apiClient.put<Member>(`/members/${memberId}`, payload);
  return response.data;
}

export async function submitFamilyCensus(payload: unknown) {
  const response = await apiClient.post<{ ok: boolean; message: string }>(
    "/census/intake",
    payload,
  );
  return response.data;
}
