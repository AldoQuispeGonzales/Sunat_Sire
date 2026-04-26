import type {
  DownloadRequest,
  DownloadResponse,
  HealthResponse,
  OperationDetail,
  TipoRegistro,
  TokenResponse
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    }
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) {
        detail = payload.detail;
      }
    } catch {
      detail = await response.text();
    }
    throw new Error(detail || "Error desconocido en la API");
  }

  return (await response.json()) as T;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

export function generateToken(): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/token", { method: "POST" });
}

export function downloadMasivo(tipo: TipoRegistro, body: DownloadRequest): Promise<DownloadResponse> {
  return request<DownloadResponse>(`/sire/descarga/${tipo}`, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function getOperation(operationId: string): Promise<OperationDetail> {
  return request<OperationDetail>(`/sire/operaciones/${operationId}`);
}

export function getDownloadUrl(operationId: string): string {
  return `${API_BASE_URL}/sire/operaciones/${operationId}/archivo`;
}
