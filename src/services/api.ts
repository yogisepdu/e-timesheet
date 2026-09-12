import * as SecureStore from "expo-secure-store";

export const API_BASE_URL = "http://10.232.140.114:8000/api";

const TOKEN_KEY = "etimesheet_auth_token";
const EXPIRES_AT_KEY = "etimesheet_auth_expires_at";
const USER_KEY = "etimesheet_auth_user";

export type AuthUser = {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role: string;
  position: string | null;
  phone: string | null;
  is_active: boolean;
  last_login_at: string | null;
};

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

/**
 * Menyimpan token authentication.
 */
export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Mengambil token authentication.
 */
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Menghapus token authentication.
 */
export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Menyimpan waktu expiration session.
 *
 * Nilai disimpan sebagai ISO 8601 string dari server Laravel.
 */
export async function saveExpiresAt(expiresAt: string): Promise<void> {
  await SecureStore.setItemAsync(EXPIRES_AT_KEY, expiresAt);
}

/**
 * Mengambil waktu expiration session.
 */
export async function getExpiresAt(): Promise<string | null> {
  return SecureStore.getItemAsync(EXPIRES_AT_KEY);
}

/**
 * Menghapus waktu expiration session.
 */
export async function removeExpiresAt(): Promise<void> {
  await SecureStore.deleteItemAsync(EXPIRES_AT_KEY);
}

/**
 * Menyimpan data user yang sedang login.
 *
 * Password tidak pernah disimpan.
 */
export async function saveAuthUser(user: AuthUser): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

/**
 * Mengambil data user dari session lokal.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const value = await SecureStore.getItemAsync(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Menghapus data user dari session lokal.
 */
export async function removeAuthUser(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY);
}

/**
 * Menyimpan seluruh session authentication.
 */
export async function saveAuthSession({
  token,
  expiresAt,
  user,
}: {
  token: string;
  expiresAt: string;
  user: AuthUser;
}): Promise<void> {
  await Promise.all([
    saveToken(token),
    saveExpiresAt(expiresAt),
    saveAuthUser(user),
  ]);
}

/**
 * Menghapus seluruh session authentication.
 */
export async function clearAuthSession(): Promise<void> {
  await Promise.all([removeToken(), removeExpiresAt(), removeAuthUser()]);
}

/**
 * Mengecek apakah session lokal masih berlaku.
 *
 * Catatan:
 * - Waktu expiration berasal dari server.
 * - Kita tidak membuat expiration baru di mobile.
 * - Session expired jika waktu sekarang sudah >= expires_at.
 */
export async function isAuthSessionValid(): Promise<boolean> {
  const [token, expiresAt] = await Promise.all([getToken(), getExpiresAt()]);

  if (!token || !expiresAt) {
    return false;
  }

  const expirationTime = Date.parse(expiresAt);

  if (Number.isNaN(expirationTime)) {
    return false;
  }

  return Date.now() < expirationTime;
}

/**
 * Jika session sudah expired, hapus session lokal.
 *
 * Return:
 * - true  = session masih valid
 * - false = session tidak valid / expired
 */
export async function ensureAuthSessionValid(): Promise<boolean> {
  const valid = await isAuthSessionValid();

  if (!valid) {
    await clearAuthSession();
    return false;
  }

  return true;
}

function getErrorMessage(
  data: ApiErrorPayload | null,
  fallback: string,
): string {
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

/**
 * Request utama ke Laravel API.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  /*
  |--------------------------------------------------------------------------
  | Cek session lokal sebelum request protected API
  |--------------------------------------------------------------------------
  |
  | Login adalah endpoint public, sehingga /login harus tetap bisa
  | dipanggil walaupun belum ada session.
  |
  */

  const isLoginRequest = endpoint === "/login";

  if (!isLoginRequest) {
    const sessionValid = await ensureAuthSessionValid();

    if (!sessionValid) {
      throw new ApiError(
        "Sesi login telah berakhir. Silakan login kembali.",
        401,
      );
    }
  }

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

    /*
    |--------------------------------------------------------------------------
    | Token ditolak server
    |--------------------------------------------------------------------------
    |
    | Misalnya token expired di Sanctum atau sudah dihapus.
    |
    */

    if (response.status === 401 && !isLoginRequest) {
      await clearAuthSession();
    }

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
