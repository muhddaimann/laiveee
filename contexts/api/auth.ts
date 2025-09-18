import { api } from "./api";
import { storeToken, removeToken } from "../tokenStorage";

export type AuthResponse = {
  status: "success" | "error";
  message?: string;
  staff_id?: number;
  token?: string;
  SiteDepartmentProfileID?: string;
};

function decodeJwtExp(token?: string): number | undefined {
  if (!token) return undefined;
  try {
    const payload = token.split(".")[1];
    const base = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const obj = JSON.parse(json);
    return typeof obj.exp === "number" ? obj.exp : undefined;
  } catch {
    return undefined;
  }
}

export async function login(body: { username: string; password: string }) {
  const res = await api.post<AuthResponse>("/auth.php", body);
  const data = res.data;
  if (data.status === "success" && data.token) {
    const exp =
      decodeJwtExp(data.token) ?? Math.floor(Date.now() / 1000) + 3600;
    await storeToken(data.token, exp);
  }
  return data;
}

export async function logout() {
  await removeToken();
  return { status: "success" as const };
}
