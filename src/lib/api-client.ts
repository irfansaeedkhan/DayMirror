import ky, { type HTTPError } from "ky";
import type { ApiError, ApiSuccess } from "@/types/api";

export class ApiClientError extends Error {
  status: number;
  code: string | undefined;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

const devUserId = process.env.NEXT_PUBLIC_DEV_USER_ID ?? process.env.DEV_USER_ID;

export const api = ky.create({
  credentials: "include",
  hooks: {
    beforeRequest: [
      ({ request }) => {
        if (devUserId && process.env.NODE_ENV === "development") {
          request.headers.set("x-user-id", devUserId);
        }
      },
    ],
    afterResponse: [
      async ({ response }) => {
        if (!response.ok) {
          const body = (await response.clone().json().catch(() => null)) as ApiError | null;
          const message = body?.error?.message ?? response.statusText;
          throw new ApiClientError(message, response.status, body?.error?.code);
        }
      },
    ],
  },
});

export async function apiGet<T>(path: string, searchParams?: Record<string, string>): Promise<T> {
  const res = await api.get(`/api/${path}`, { searchParams }).json<ApiSuccess<T>>();
  return res.data;
}

export async function apiPost<T>(path: string, json?: unknown): Promise<T> {
  const res = await api.post(`/api/${path}`, { json }).json<ApiSuccess<T>>();
  return res.data;
}

export async function apiPatch<T>(path: string, json?: unknown): Promise<T> {
  const res = await api.patch(`/api/${path}`, { json }).json<ApiSuccess<T>>();
  return res.data;
}

export async function apiPut<T>(path: string, json?: unknown): Promise<T> {
  const res = await api.put(`/api/${path}`, { json }).json<ApiSuccess<T>>();
  return res.data;
}

export async function apiDelete<T>(path: string, searchParams?: Record<string, string>): Promise<T> {
  const res = await api.delete(`/api/${path}`, { searchParams }).json<ApiSuccess<T>>();
  return res.data;
}

export function isHttpError(error: unknown): error is HTTPError {
  return error instanceof Error && error.name === "HTTPError";
}
