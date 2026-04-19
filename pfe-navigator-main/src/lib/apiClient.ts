import type { ApiError, ApiFailure } from "./apiContracts";

export class ApiClientError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, params: { status: number; code?: string; details?: unknown }) {
    super(message);
    this.name = "ApiClientError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }
}

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

export const API_BASE_URL = normalizeBaseUrl(
  // Vite exposes env vars via import.meta.env
  (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:5000",
);

type JsonValue = unknown;

const readJsonSafely = async (res: Response): Promise<JsonValue | null> => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as JsonValue;
  } catch {
    return null;
  }
};

const isApiFailure = (value: unknown): value is ApiFailure => {
  if (!value || typeof value !== "object") return false;
  const v = value as any;
  return v.success === false && v.error && typeof v.error.message === "string";
};

const toApiError = (value: unknown): ApiError | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const v = value as any;
  if (!v.message || typeof v.message !== "string") return undefined;
  return {
    message: v.message,
    code: typeof v.code === "string" ? v.code : undefined,
    details: v.details,
  };
};

export const apiFetch = async <TResponse>(
  path: string,
  options?: RequestInit,
): Promise<TResponse> => {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options?.headers ?? {}),
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  const json = await readJsonSafely(res);

  if (!res.ok) {
    if (isApiFailure(json)) {
      throw new ApiClientError(json.error.message, {
        status: res.status,
        code: json.error.code,
        details: json.error.details,
      });
    }

    throw new ApiClientError(`Request failed with status ${res.status}`, { status: res.status });
  }

  // Backend uses a success envelope; some endpoints might still return plain JSON in the future.
  if (isApiFailure(json)) {
    throw new ApiClientError(json.error.message, {
      status: res.status,
      code: json.error.code,
      details: json.error.details,
    });
  }

  return json as TResponse;
};

export const apiPostJson = async <TResponse, TBody>(path: string, body: TBody): Promise<TResponse> => {
  return apiFetch<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
};
