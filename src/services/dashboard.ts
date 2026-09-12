import { apiRequest } from "./api";

export type DashboardSummary = {
  draft: number;
  submitted: number;
  approved: number;
  revision: number;
};

export type DashboardReport = {
  id: number;
  code: string;
  operator: string;
  unit: string;
  status: "draft" | "submitted" | "approved" | "revision" | "rejected";
  status_label: string;
  work_date: string | null;
};

export type DashboardData = {
  summary: DashboardSummary;
  recent_reports: DashboardReport[];
};

type DashboardResponse = {
  data: DashboardData;
};

export async function getDashboard(): Promise<DashboardData> {
  const response = await apiRequest<DashboardResponse>("/dashboard");

  return response.data;
}
