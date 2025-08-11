import { AUTH_TOKEN } from "../../constants/env";

export type ApiRequestInit = Omit<RequestInit, "headers" | "body"> & {
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;
};

function buildUrl(url: string, query?: Record<string, any>) {
  if (!query) return url;
  const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
  });
  return u.toString();
}

async function request<T>(url: string, init: ApiRequestInit = {}): Promise<T> {
  const { query, body, headers, ...rest } = init;

  const finalUrl = buildUrl(url, query);

  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const isBlob = typeof Blob !== "undefined" && body instanceof Blob;

  const finalHeaders: Record<string, string> = {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    ...(isForm || isBlob ? {} : { "Content-Type": "application/json" }),
    ...(headers || {}),
  };

  const res = await fetch(finalUrl, {
    ...rest,
    headers: finalHeaders,
    body: body === undefined || isForm || isBlob ? body : JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }

  if (res.status === 204) return undefined as unknown as T;

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    return text as unknown as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(url: string, query?: Record<string, any>, init?: ApiRequestInit) =>
    request<T>(url, { method: "GET", query, ...(init || {}) }),
  post: <T>(url: string, body?: any, init?: ApiRequestInit) =>
    request<T>(url, { method: "POST", body, ...(init || {}) }),
};
