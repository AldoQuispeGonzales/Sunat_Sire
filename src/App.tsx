import { FormEvent, useEffect, useMemo, useState } from "react";
import { downloadMasivo, generateToken, getApiBaseUrl, getDownloadUrl, getHealth, getOperation } from "./api";
import type { DownloadResponse, FormatoSalida, HealthResponse, OperationDetail, TipoRegistro, TokenResponse } from "./types";

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string>("");
  const [token, setToken] = useState<TokenResponse | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string>("");

  const [tipo, setTipo] = useState<TipoRegistro>("compras");
  const [periodo, setPeriodo] = useState("202603");
  const [formato, setFormato] = useState<FormatoSalida>("csv");
  const [pageSize, setPageSize] = useState(500);
  const [filtrosRaw, setFiltrosRaw] = useState('{"estado":"aceptado"}');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string>("");
  const [operations, setOperations] = useState<DownloadResponse[]>([]);

  const [searchOperationId, setSearchOperationId] = useState("");
  const [operationDetail, setOperationDetail] = useState<OperationDetail | null>(null);
  const [searchError, setSearchError] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState(false);

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    void refreshHealth();
  }, []);

  async function refreshHealth() {
    setHealthError("");
    try {
      const response = await getHealth();
      setHealth(response);
    } catch (error) {
      setHealthError(error instanceof Error ? error.message : "No se pudo consultar health");
    }
  }

  async function handleGenerateToken() {
    setTokenLoading(true);
    setTokenError("");
    try {
      const response = await generateToken();
      setToken(response);
    } catch (error) {
      setTokenError(error instanceof Error ? error.message : "No se pudo generar token");
    } finally {
      setTokenLoading(false);
    }
  }

  async function handleDownload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDownloadLoading(true);
    setDownloadError("");

    try {
      let filtros: Record<string, unknown> | undefined;
      if (filtrosRaw.trim()) {
        filtros = JSON.parse(filtrosRaw) as Record<string, unknown>;
      }

      const result = await downloadMasivo(tipo, {
        periodo,
        formato,
        page_size: pageSize,
        filtros
      });

      setOperations((prev) => [result, ...prev].slice(0, 8));
      setSearchOperationId(result.operation_id);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Error en descarga masiva");
    } finally {
      setDownloadLoading(false);
    }
  }

  async function handleSearchOperation() {
    if (!searchOperationId.trim()) {
      setSearchError("Ingresa un operation_id valido");
      return;
    }

    setSearchLoading(true);
    setSearchError("");
    try {
      const detail = await getOperation(searchOperationId.trim());
      setOperationDetail(detail);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "No se pudo consultar la operacion");
      setOperationDetail(null);
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-kicker">SUNAT SIRE Console</p>
        <h1>Panel FrontEnd completo para compras y ventas</h1>
        <p>
          Interfaz separada para desplegar aparte del backend. Ejecuta autenticacion SUNAT, descarga masiva,
          consulta operaciones y descarga ZIP desde un solo lugar.
        </p>
        <div className="hero-meta">
          <span>
            API Base: <code>{apiBaseUrl}</code>
          </span>
          {health ? (
            <span className={health.mock_mode ? "pill mock" : "pill real"}>
              {health.mock_mode ? "Modo Mock" : "Modo Real"}
            </span>
          ) : null}
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <div className="card-head">
            <h2>Estado del servicio</h2>
            <button type="button" onClick={() => void refreshHealth()}>
              Actualizar
            </button>
          </div>
          {healthError ? <p className="error">{healthError}</p> : null}
          {health ? (
            <ul className="info-list">
              <li>
                <strong>Status:</strong> {health.status}
              </li>
              <li>
                <strong>App:</strong> {health.app}
              </li>
              <li>
                <strong>Version:</strong> {health.version}
              </li>
              <li>
                <strong>Timestamp:</strong> {new Date(health.timestamp).toLocaleString()}
              </li>
            </ul>
          ) : (
            <p>Cargando estado...</p>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Token SUNAT</h2>
            <button type="button" onClick={() => void handleGenerateToken()} disabled={tokenLoading}>
              {tokenLoading ? "Generando..." : "Generar token"}
            </button>
          </div>
          {tokenError ? <p className="error">{tokenError}</p> : null}
          {token ? (
            <ul className="info-list">
              <li>
                <strong>Token:</strong> <code>{token.access_token.slice(0, 24)}...</code>
              </li>
              <li>
                <strong>Tipo:</strong> {token.token_type}
              </li>
              <li>
                <strong>Expira en:</strong> {token.expires_in} segundos
              </li>
              <li>
                <strong>Generado:</strong> {new Date(token.generated_at).toLocaleString()}
              </li>
            </ul>
          ) : (
            <p>Genera un token para validar la conexion con SUNAT.</p>
          )}
        </section>

        <section className="card span-2">
          <h2>Descarga masiva SIRE</h2>
          <form className="form" onSubmit={(event) => void handleDownload(event)}>
            <label>
              Tipo de libro
              <select value={tipo} onChange={(event) => setTipo(event.target.value as TipoRegistro)}>
                <option value="compras">Compras</option>
                <option value="ventas">Ventas</option>
              </select>
            </label>

            <label>
              Periodo (YYYYMM)
              <input
                type="text"
                value={periodo}
                maxLength={6}
                pattern="[0-9]{6}"
                onChange={(event) => setPeriodo(event.target.value)}
                required
              />
            </label>

            <label>
              Formato
              <select value={formato} onChange={(event) => setFormato(event.target.value as FormatoSalida)}>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </label>

            <label>
              Registros por pagina
              <input
                type="number"
                value={pageSize}
                min={1}
                max={1000}
                onChange={(event) => setPageSize(Number(event.target.value))}
                required
              />
            </label>

            <label className="span-2">
              Filtros JSON (opcional)
              <textarea
                rows={5}
                value={filtrosRaw}
                onChange={(event) => setFiltrosRaw(event.target.value)}
                placeholder='{"estado":"aceptado","tipo_documento":"01"}'
              />
            </label>

            <button type="submit" className="primary span-2" disabled={downloadLoading}>
              {downloadLoading ? "Procesando descarga..." : "Ejecutar descarga masiva"}
            </button>
          </form>
          {downloadError ? <p className="error">{downloadError}</p> : null}
        </section>

        <section className="card span-2">
          <h2>Operaciones recientes</h2>
          {operations.length === 0 ? (
            <p>Aun no hay operaciones registradas en esta sesion.</p>
          ) : (
            <div className="op-grid">
              {operations.map((op) => (
                <article key={op.operation_id} className="op-item">
                  <p>
                    <strong>{op.tipo.toUpperCase()}</strong> - Periodo {op.periodo}
                  </p>
                  <p>{op.total_registros} registros</p>
                  <p>
                    ID: <code>{op.operation_id}</code>
                  </p>
                  <a href={getDownloadUrl(op.operation_id)} target="_blank" rel="noreferrer">
                    Descargar ZIP
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card span-2">
          <h2>Consulta y descarga por operation_id</h2>
          <div className="search-row">
            <input
              type="text"
              value={searchOperationId}
              onChange={(event) => setSearchOperationId(event.target.value)}
              placeholder="Ejemplo: 95bf734e-945e-4c7d-85eb-a77fd64f90a4"
            />
            <button type="button" onClick={() => void handleSearchOperation()} disabled={searchLoading}>
              {searchLoading ? "Buscando..." : "Consultar"}
            </button>
          </div>
          {searchError ? <p className="error">{searchError}</p> : null}

          {operationDetail ? (
            <ul className="info-list">
              <li>
                <strong>Tipo:</strong> {operationDetail.tipo}
              </li>
              <li>
                <strong>Periodo:</strong> {operationDetail.periodo}
              </li>
              <li>
                <strong>Formato:</strong> {operationDetail.formato}
              </li>
              <li>
                <strong>Total:</strong> {operationDetail.total_registros}
              </li>
              <li>
                <strong>Creado:</strong> {new Date(operationDetail.creado_en).toLocaleString()}
              </li>
              <li>
                <a href={getDownloadUrl(operationDetail.operation_id)} target="_blank" rel="noreferrer">
                  Descargar ZIP de esta operacion
                </a>
              </li>
            </ul>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;
