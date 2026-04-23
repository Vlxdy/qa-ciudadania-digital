/**
 * Store en memoria para callbacks recibidos por el webhook QA.
 * Al ser un singleton de módulo, el servidor webhook y los escenarios
 * comparten la misma instancia cuando corren en el mismo proceso Node.
 */

export interface CallbackEntry {
  path: string;
  method: string;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
  receivedAt: string;
}

export interface WaitForCallbackOptions {
  /** Ruta exacta a esperar, e.g. '/webhook/aprobacion-simple' */
  path: string;
  /** Método HTTP a esperar (default: 'POST') */
  method?: string;
  /**
   * Solo considera callbacks recibidos a partir de este índice del store.
   * Usar `callbackCount()` justo antes de enviar la solicitud para que cada
   * escenario no lea callbacks que pertenecen a escenarios anteriores.
   */
  afterIndex?: number;
  /**
   * Campos y valores que deben coincidir en el body (comparación superficial).
   * Forma simple: `bodyExpect: { aceptado: true, estado: 'APROBADO' }`
   */
  bodyExpect?: Record<string, unknown>;
  /** Predicado avanzado sobre el body — para lógica que bodyExpect no alcanza */
  bodyMatch?: (body: unknown) => boolean;
  /** Timeout en ms (default: 55 000 ms) */
  timeoutMs?: number;
  /** Intervalo de polling en ms (default: 250 ms) */
  pollMs?: number;
}

const entries: CallbackEntry[] = [];

export function pushCallback(entry: CallbackEntry): void {
  entries.push(entry);
}

export function clearCallbacks(): void {
  entries.length = 0;
}

export function snapshotCallbacks(): CallbackEntry[] {
  return [...entries];
}

/** Cantidad actual de callbacks en el store. Usar como punto de partida para afterIndex. */
export function callbackCount(): number {
  return entries.length;
}

function matchesExpect(body: unknown, expect: Record<string, unknown>): boolean {
  if (body === null || typeof body !== 'object') return false;
  const obj = body as Record<string, unknown>;
  return Object.entries(expect).every(([k, v]) => obj[k] === v);
}

/**
 * Espera hasta que llegue un callback que coincida con los criterios.
 * Retorna la entrada si fue encontrada, o null si se agotó el timeout.
 */
export async function waitForCallback(
  opts: WaitForCallbackOptions,
): Promise<CallbackEntry | null> {
  const {
    path,
    method = 'POST',
    afterIndex = 0,
    bodyExpect,
    bodyMatch,
    timeoutMs = 55_000,
    pollMs = 250,
  } = opts;

  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const match = entries.slice(afterIndex).find((e) => {
      if (e.path !== path) return false;
      if (e.method.toUpperCase() !== method.toUpperCase()) return false;
      if (bodyExpect && !matchesExpect(e.body, bodyExpect)) return false;
      if (bodyMatch && !bodyMatch(e.body)) return false;
      return true;
    });

    if (match) return match;

    await new Promise<void>((r) => setTimeout(r, pollMs));
  }

  return null;
}
