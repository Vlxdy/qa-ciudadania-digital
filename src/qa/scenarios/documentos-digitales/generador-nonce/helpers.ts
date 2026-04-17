/**
 * Helpers para escenarios del módulo documentos-digitales — endpoint POST /nonce.
 */
import type { GeneradorNonceInput } from '../../../../schemas/generador-nonce.schema';
import { GeneradorNonceInputSchema } from '../../../../schemas/generador-nonce.schema';
import { qaEnv } from '../../../config/qa-env';
import { qaPost } from '../../../http/qa-http';
import { ensureAccessToken } from '../../proveedor/services/token-provider';

// ─── Validación Zod ───────────────────────────────────────────────────────────

export function validateInputGeneradorNonce(input: unknown): {
  valid: boolean;
  error: string;
  fields: string[];
} {
  const result = GeneradorNonceInputSchema.safeParse(input);
  if (result.success) return { valid: true, error: '', fields: [] };

  const issues = result.error.issues;
  const error = issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  const fields = issues.map((i) => i.path.join('.'));
  return { valid: false, error, fields };
}

// ─── Helper build + send (omite Zod, usa access token del ciudadano) ──────────

export async function tryBuildAndSendGeneradorNonce(input: unknown): Promise<{
  httpStatus?: number;
  body?: unknown;
  request?: import('../../../types/scenario.types').QaRequestTrace;
  durationMs: number;
}> {
  const start = Date.now();
  try {
    const token = await ensureAccessToken();
    return await qaPost(generadorNonceUrl(), input, {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  } catch {
    return { durationMs: Date.now() - start };
  }
}

// ─── Accesos rápidos ──────────────────────────────────────────────────────────

export const generadorNonceUrl = () => `${qaEnv.DOC_DIGITAL_URL_BASE}/api/nonce`;

export function buildGeneradorNonceBody(): GeneradorNonceInput {
  return { codigoDocumento: qaEnv.DOC_DIGITAL_CODIGO_DOCUMENTO };
}
