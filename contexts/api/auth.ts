import { api } from "./api";
import { storeToken, removeToken } from "../tokenStorage";

export type LoginCredentials = { username: string; password: string };

export type AuthResponse = {
  status: "success" | "invalid_password" | "user_not_found" | string;
  token?: string;
  message?: string;
  staff_id?: number;
  SiteDepartmentProfileID?: string;
};

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth.php", credentials);
  if (data?.token) {
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    await storeToken(data.token, exp);
  }
  return data;
}

export async function logout(): Promise<void> {
  await removeToken();
}
