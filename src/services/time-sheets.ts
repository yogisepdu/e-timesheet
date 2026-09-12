import * as FileSystem from "expo-file-system/legacy";

import { API_BASE_URL, ApiError, apiRequest, getToken } from "./api";

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

/**
 * Mengambil seluruh riwayat Time Sheet milik user yang sedang login.
 */
export async function getTimeSheetHistory() {
  const response = await apiRequest<TimeSheetHistoryResponse>("/time-sheets");

  return response.data;
}

/**
 * Membuat Time Sheet sebagai draft.
 */
export async function createTimeSheetDraft(payload: TimeSheetSavePayload) {
  return apiRequest<SaveTimeSheetResponse>("/time-sheets/draft", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Mengubah Time Sheet draft.
 */
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

/**
 * Membuat Time Sheet dan langsung submit.
 */
export async function createAndSubmitTimeSheet(payload: TimeSheetSavePayload) {
  return apiRequest<SaveTimeSheetResponse>("/time-sheets/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Submit Time Sheet draft.
 */
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

/**
 * Download PDF Time Sheet dari Laravel.
 *
 * PDF dibuat oleh Laravel menggunakan view PDF yang sama
 * dengan Admin Dashboard.
 *
 * Hasil download disimpan ke cache directory aplikasi.
 */
export async function downloadTimeSheetPdf(
  timeSheetId: number,
  timeSheetCode: string,
): Promise<string> {
  const token = await getToken();

  if (!token) {
    throw new ApiError(
      "Sesi login tidak ditemukan. Silakan login kembali.",
      401,
    );
  }

  const safeFileName = sanitizeFileName(timeSheetCode);

  const fileUri = `${FileSystem.cacheDirectory}${safeFileName}.pdf`;

  const endpoint = `${API_BASE_URL}/time-sheets/${timeSheetId}/pdf`;

  try {
    const result = await FileSystem.downloadAsync(endpoint, fileUri, {
      headers: {
        Accept: "application/pdf",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!result || !result.uri) {
      throw new ApiError("File PDF tidak berhasil diunduh.", 500);
    }

    if (result.status === 401) {
      throw new ApiError(
        "Sesi login telah berakhir. Silakan login kembali.",
        401,
      );
    }

    if (result.status < 200 || result.status >= 300) {
      throw new ApiError(
        `Gagal mengunduh PDF (${result.status}).`,
        result.status,
      );
    }

    return result.uri;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.warn("Gagal download PDF Time Sheet:", error);

    throw new ApiError(
      "PDF tidak dapat diunduh. Periksa koneksi internet dan coba lagi.",
      0,
    );
  }
}

/**
 * Membersihkan kode Time Sheet agar aman digunakan
 * sebagai nama file.
 */
function sanitizeFileName(value: string): string {
  const sanitized = value
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, "-");

  return sanitized || "time-sheet";
}
