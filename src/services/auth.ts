import { apiRequest, removeToken, saveToken } from "./api";

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

type LoginResponse = {
  message: string;
  token_type: string;
  token: string;
  user: AuthUser;
};

type MeResponse = {
  data: AuthUser;
};

type LogoutResponse = {
  message: string;
};

export async function login(username: string, password: string) {
  const response = await apiRequest<LoginResponse>("/login", {
    method: "POST",

    body: JSON.stringify({
      username: username.trim(),
      password,
      device_name: "e-Time Sheet Android",
    }),
  });

  await saveToken(response.token);

  return response;
}

export async function getAuthenticatedUser() {
  const response = await apiRequest<MeResponse>("/me");

  return response.data;
}

export async function logout() {
  try {
    await apiRequest<LogoutResponse>("/logout", {
      method: "POST",
    });
  } finally {
    /**
     * Walaupun server gagal merespons,
     * token lokal tetap dihapus.
     */
    await removeToken();
  }
}
