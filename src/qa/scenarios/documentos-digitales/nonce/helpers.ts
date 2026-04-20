/**
 * Helpers para escenarios del módulo documentos-digitales — endpoint POST /api/nonce/verificar.
 */
import type { NonceInput } from '../../../../schemas/nonce.schema';
import { NonceInputSchema } from '../../../../schemas/nonce.schema';
import { qaEnv } from '../../../config/qa-env';
import { qaPost } from '../../../http/qa-http';

// ─── Validación Zod ───────────────────────────────────────────────────────────

export function validateInputNonce(input: unknown): {
  valid: boolean;
  error: string;
  fields: string[];
} {
  const result = NonceInputSchema.safeParse(input);
  if (result.success) return { valid: true, error: '', fields: [] };

  const issues = result.error.issues;
  const error = issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  const fields = issues.map((i) => i.path.join('.'));
  return { valid: false, error, fields };
}

// ─── Helper build + send (omite Zod) ─────────────────────────────────────────

export async function tryBuildAndSendNonce(input: unknown): Promise<{
  httpStatus?: number;
  body?: unknown;
  request?: import('../../../types/scenario.types').QaRequestTrace;
  durationMs: number;
}> {
  const start = Date.now();
  try {
    return await qaPost(nonceUrl(), input, {
      Authorization: `Bearer ${defaultToken()}`,
      'Content-Type': 'application/json',
    });
  } catch {
    return { durationMs: Date.now() - start };
  }
}

// ─── Accesos rápidos ──────────────────────────────────────────────────────────

export const nonceUrl = () => `${qaEnv.DOC_DIGITAL_URL_BASE}/api/nonce/verificar`;

export const defaultToken = () => qaEnv.DOC_DIGITAL_TOKEN;

export function buildNonceBody(nonce: string): NonceInput {
  return { nonce };
}
