
import axios from "axios";
import { getToken, removeToken } from "./tokenStorage";
import { toApiError } from "./error";
import { LOCAL_URL } from "../constants/env";

const instance = axios.create({
  baseURL: LOCAL_URL,
  timeout: 10000,
});

instance.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const apiErr = toApiError(err);
    if (apiErr.status === 401) {
      await removeToken();
    }
    return Promise.reject(apiErr);
  }
);

export const api = {
  get: <T = any>(url: string, params?: any) => instance.get<T>(url, { params }),
  post: <T = any>(url: string, data?: any) => instance.post<T>(url, data),
  put: <T = any>(url: string, data?: any) => instance.put<T>(url, data),
  patch: <T = any>(url: string, data?: any) => instance.patch<T>(url, data),
  del: <T = any>(url: string) => instance.delete<T>(url),
  upload: <T = any>(url: string, formData: FormData) =>
    instance.post<T>(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export type ApiInstance = typeof instance;
export { instance as https };
