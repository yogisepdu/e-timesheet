import {
  apiRequest,
  clearAuthSession,
  ensureAuthSessionValid,
  getAuthUser,
  isAuthSessionValid,
  saveAuthSession,
  saveAuthUser,
  type AuthUser,
} from "./api";

export type { AuthUser };

type LoginResponse = {
  message: string;
  token_type: string;
  token: string;
  expires_at: string;
  logged_in_at: string;
  expires_in_hours: number;
  user: AuthUser;
};

type MeResponse = {
  data: AuthUser;
};

type LogoutResponse = {
  message: string;
};

/**
 * Login user ke API Laravel.
 *
 * Session yang berhasil dibuat akan disimpan secara lokal:
 * - token
 * - expires_at
 * - user
 *
 * Password tidak pernah disimpan.
 */
export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>("/login", {
    method: "POST",

    body: JSON.stringify({
      username: username.trim(),
      password,
      device_name: "e-Time Sheet Android",
    }),
  });

  await saveAuthSession({
    token: response.token,
    expiresAt: response.expires_at,
    user: response.user,
  });

  return response;
}

/**
 * Mengambil user terbaru dari server.
 */
export async function getAuthenticatedUser(): Promise<AuthUser> {
  const sessionValid = await ensureAuthSessionValid();

  if (!sessionValid) {
    throw new Error("Sesi login telah berakhir. Silakan login kembali.");
  }

  const response = await apiRequest<MeResponse>("/me");

  /*
  | Server adalah sumber data user terbaru.
  */
  await saveAuthUser(response.data);

  return response.data;
}

/**
 * Mengambil user dari session lokal.
 *
 * Fungsi ini dapat digunakan ketika offline.
 */
export async function getLocalAuthenticatedUser(): Promise<AuthUser | null> {
  const valid = await isAuthSessionValid();

  if (!valid) {
    await clearAuthSession();

    return null;
  }

  return getAuthUser();
}

/**
 * Mengecek apakah session login masih berlaku.
 */
export async function hasValidSession(): Promise<boolean> {
  return isAuthSessionValid();
}

/**
 * Logout.
 *
 * Server dihubungi jika session masih valid.
 * Session lokal tetap dihapus walaupun server gagal merespons.
 */
export async function logout(): Promise<void> {
  try {
    const sessionValid = await isAuthSessionValid();

    if (sessionValid) {
      await apiRequest<LogoutResponse>("/logout", {
        method: "POST",
      });
    }
  } catch (error) {
    console.warn("Logout server gagal:", error);
  } finally {
    await clearAuthSession();
  }
}
