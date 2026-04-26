export type TipoRegistro = "compras" | "ventas";
export type FormatoSalida = "csv" | "json";

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  mock_mode: boolean;
  timestamp: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  generated_at: string;
}

export interface DownloadRequest {
  periodo: string;
  formato: FormatoSalida;
  page_size: number;
  filtros?: Record<string, unknown>;
}

export interface DownloadResponse {
  operation_id: string;
  tipo: TipoRegistro;
  periodo: string;
  total_registros: number;
  archivo_generado: string;
  created_at: string;
}

export interface OperationDetail {
  operation_id: string;
  tipo: TipoRegistro;
  periodo: string;
  formato: FormatoSalida;
  total_registros: number;
  archivo: string;
  creado_en: string;
}
