// ─────────────────────────────────────────────────────────────────────────────
// Tipos base del sistema de escenarios QA
// ─────────────────────────────────────────────────────────────────────────────

export type ModuleName = 'proveedor' | 'aprobador' | 'notificador' | 'avisos' | 'qr-seguro' | 'documentos-digitales';

// ─── Resultado esperado ───────────────────────────────────────────────────────

export interface ExpectedOutcome {
  /** true → se espera 2xx sin error local | false → se espera 4xx/5xx o error local */
  success: boolean;
  /** Código HTTP exacto (opcional — omitir si solo importa success/failure) */
  httpStatus?: number;
  /** Fragmentos que DEBEN estar en el JSON serializado de la respuesta */
  bodyContains?: string[];
  /** Fragmentos que NO deben estar en el JSON serializado de la respuesta */
  bodyNotContains?: string[];
  /** Texto o regex que debe aparecer en el error local (Zod, crypto, fs, etc.) */
  errorMessage?: string | RegExp;
  /** Campos que deben aparecer en el mensaje de error de validación */
  validationFields?: string[];
}

// ─── Resultado real capturado ─────────────────────────────────────────────────

export interface ScenarioActual {
  httpStatus?: number;
  body?: unknown;
  request?: QaRequestTrace;
  /** Error capturado antes de llegar al HTTP (Zod, throw local, crypto, fs, etc.) */
  localError?: string;
  durationMs: number;
}

export interface QaRequestTrace {
  method: 'GET' | 'POST' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  encoding: 'json' | 'form';
}

// ─── Resultado final del escenario ───────────────────────────────────────────

export interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  module: ModuleName;
  tags: string[];
  passed: boolean;
  actual: ScenarioActual;
  expected: ExpectedOutcome;
  /** Lista legible de lo que no coincidió (vacía si passed=true) */
  failures: string[];
}

// ─── Definición de un escenario ───────────────────────────────────────────────

export interface Scenario {
  id: string;
  name: string;
  description: string;
  module: ModuleName;
  tags: string[];
  /** Si true el runner lo omite y lo reporta como "skipped" */
  skip?: boolean;
  run: () => Promise<ScenarioResult>;
}

// ─── Helpers de evaluación ────────────────────────────────────────────────────

/**
 * Compara actual vs expected y retorna la lista de diferencias.
 * Lista vacía → escenario pasado.
 */
export function evaluate(
  actual: ScenarioActual,
  expected: ExpectedOutcome,
): string[] {
  const failures: string[] = [];
  const hasLocalError = !!actual.localError;
  const { httpStatus } = actual;
  const bodyStr =
    actual.body !== undefined ? JSON.stringify(actual.body) : '';

  // 1 — Código HTTP exacto
  if (
    expected.httpStatus !== undefined &&
    httpStatus !== expected.httpStatus
  ) {
    failures.push(
      `httpStatus esperado: ${expected.httpStatus}, recibido: ${httpStatus ?? 'sin respuesta'}`,
    );
  }

  // 2 — Éxito vs fracaso general
  if (expected.success === true) {
    if (hasLocalError) {
      failures.push(
        `Se esperaba éxito pero ocurrió error local: ${actual.localError}`,
      );
    } else if (httpStatus !== undefined && httpStatus >= 400) {
      failures.push(`Se esperaba 2xx pero recibió: ${httpStatus}`);
    }
  } else if (expected.success === false) {
    if (!hasLocalError && (httpStatus === undefined || httpStatus < 400)) {
      failures.push(
        `Se esperaba fallo/rechazo pero todo fue exitoso (httpStatus: ${httpStatus ?? 'sin respuesta'})`,
      );
    }
  }

  // 3 — Fragmentos en body
  for (const fragment of expected.bodyContains ?? []) {
    if (!bodyStr.includes(fragment)) {
      failures.push(`body debe contener: "${fragment}"`);
    }
  }
  for (const fragment of expected.bodyNotContains ?? []) {
    if (bodyStr.includes(fragment)) {
      failures.push(`body NO debe contener: "${fragment}"`);
    }
  }

  // 4 — Mensaje de error local
  if (expected.errorMessage) {
    const errStr = actual.localError ?? '';
    if (typeof expected.errorMessage === 'string') {
      if (!errStr.includes(expected.errorMessage)) {
        failures.push(`error debe contener: "${expected.errorMessage}"`);
      }
    } else {
      if (!expected.errorMessage.test(errStr)) {
        failures.push(`error debe coincidir con patrón: ${expected.errorMessage}`);
      }
    }
  }

  // 5 — Campos de validación
  if (expected.validationFields?.length) {
    const searchStr = `${actual.localError ?? ''} ${bodyStr}`;
    for (const field of expected.validationFields) {
      if (!searchStr.includes(field)) {
        failures.push(`Campo de validación esperado: "${field}"`);
      }
    }
  }

  return failures;
}

/**
 * Construye un ScenarioResult a partir del meta, actual y expected.
 * Llama evaluate() internamente.
 */
export function makeResult(
  meta: { id: string; name: string; module: ModuleName; tags: string[] },
  actual: ScenarioActual,
  expected: ExpectedOutcome,
): ScenarioResult {
  const failures = evaluate(actual, expected);
  return {
    scenarioId: meta.id,
    scenarioName: meta.name,
    module: meta.module,
    tags: meta.tags,
    passed: failures.length === 0,
    actual,
    expected,
    failures,
  };
}
