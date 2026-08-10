import { apiRequest } from "./api";

export type TimeSheetStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "revision"
  | "rejected";

export type TimeSheetHistoryItem = {
  id: number;
  code: string;
  work_date: string | null;
  status: TimeSheetStatus;
  location: string | null;
  start_time: string | null;
  end_time: string | null;
  total_hours: string | null;
  total_hm: string | null;
  fuel_used: string | null;
  production: string | null;
  production_unit: string | null;
  review_notes: string | null;

  operator: {
    id: number;
    code: string;
    name: string;
  } | null;

  equipment_unit: {
    id: number;
    code: string;
    equipment_type: string;
  } | null;

  activity: {
    id: number;
    code: string;
    name: string;
  } | null;

  created_at: string | null;
  submitted_at: string | null;
  approved_at: string | null;
};

export type TimeSheetSavePayload = {
  work_date: string | null;
  contractor_id: number | null;
  operator_id: number | null;
  equipment_unit_id: number | null;
  activity_id: number | null;
  start_time: string | null;
  end_time: string | null;
  hm_start: number | null;
  hm_end: number | null;
  fuel_used: number | null;
  location: string | null;
  production: number | null;
  production_unit: string | null;
};

export type SavedTimeSheet = {
  id: number;
  code: string;
  status: TimeSheetStatus;
  work_date: string | null;
};

type TimeSheetHistoryResponse = {
  data: TimeSheetHistoryItem[];
};

type SaveTimeSheetResponse = {
  message: string;
  data: SavedTimeSheet;
};

export async function getTimeSheetHistory() {
  const response = await apiRequest<TimeSheetHistoryResponse>("/time-sheets");

  return response.data;
}

export async function createTimeSheetDraft(payload: TimeSheetSavePayload) {
  return apiRequest<SaveTimeSheetResponse>("/time-sheets/draft", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTimeSheetDraft(
  timeSheetId: number,
  payload: TimeSheetSavePayload,
) {
  return apiRequest<SaveTimeSheetResponse>(
    `/time-sheets/${timeSheetId}/draft`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function createAndSubmitTimeSheet(payload: TimeSheetSavePayload) {
  return apiRequest<SaveTimeSheetResponse>("/time-sheets/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function submitTimeSheetDraft(
  timeSheetId: number,
  payload: TimeSheetSavePayload,
) {
  return apiRequest<SaveTimeSheetResponse>(
    `/time-sheets/${timeSheetId}/submit`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
