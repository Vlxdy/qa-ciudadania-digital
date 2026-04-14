/**
 * Cliente HTTP para QA.
 * Nunca lanza excepciones en 4xx/5xx — los captura como parte del resultado,
 * permitiendo que los escenarios negativos evalúen correctamente la respuesta.
 */
import axios from 'axios';
import type { ScenarioActual } from '../types/scenario.types';

type QaResponse = Omit<ScenarioActual, 'durationMs'> & { durationMs: number };

/**
 * POST genérico. validateStatus: () => true para capturar cualquier código HTTP.
 */
export async function qaPost(
  url: string,
  body: unknown,
  headers: Record<string, string>,
  timeoutMs = 30_000,
): Promise<QaResponse> {
  const start = Date.now();
  try {
    const response = await axios.post(url, body, {
      headers,
      validateStatus: () => true,
      timeout: timeoutMs,
    });
    return {
      httpStatus: response.status,
      body: response.data,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      localError: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}

/**
 * POST con body application/x-www-form-urlencoded (token endpoint OAuth).
 */
export async function qaPostForm(
  url: string,
  params: URLSearchParams,
  extraHeaders: Record<string, string> = {},
  timeoutMs = 30_000,
): Promise<QaResponse> {
  const start = Date.now();
  try {
    const response = await axios.post(url, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...extraHeaders,
      },
      validateStatus: () => true,
      timeout: timeoutMs,
    });
    return {
      httpStatus: response.status,
      body: response.data,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      localError: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}
