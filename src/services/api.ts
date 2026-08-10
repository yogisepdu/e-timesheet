import * as SecureStore from "expo-secure-store";

export const API_BASE_URL = "http://10.0.2.2:8000/api";

const TOKEN_KEY = "etimesheet_auth_token";

type ApiErrorPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  status: number;
  data: ApiErrorPayload | null;

  constructor(
    message: string,
    status: number,
    data: ApiErrorPayload | null = null,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

function getErrorMessage(data: ApiErrorPayload | null, fallback: string) {
  if (data?.message) {
    return data.message;
  }

  if (data?.errors) {
    const firstError = Object.values(data.errors).flat().find(Boolean);

    if (firstError) {
      return firstError;
    }
  }

  return fallback;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      "Tidak dapat terhubung ke server. Periksa koneksi dan pastikan server Laravel sedang berjalan.",
      0,
    );
  }

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const payload = data as ApiErrorPayload | null;

    throw new ApiError(
      getErrorMessage(
        payload,
        `Terjadi kesalahan pada server (${response.status}).`,
      ),
      response.status,
      payload,
    );
  }

  return data as T;
}
