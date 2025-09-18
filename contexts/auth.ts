
import { api } from "./api";
import { storeToken, removeToken } from "./tokenStorage";

export type LoginCredentials = { username: string; password: string };

// This type now reflects both success and error responses from your backend
export type AuthResponse = {
  status?: "success" | "invalid_password" | "user_not_found" | string;
  token?: string;
  message?: string;
  staff_id?: number;
  SiteDepartmentProfileID?: string;
  error?: string; 
};

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth.php", credentials);
  
  // Store the token on successful login
  if (data?.token) {
    // The expiration can be decoded from the JWT itself if it has an 'exp' claim,
    // but we'll keep the 7-day default for now.
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    await storeToken(data.token, exp);
  }
  return data;
}

export async function logout(): Promise<void> {
  // No API call is needed for logout, just remove the token
  await removeToken();
}
