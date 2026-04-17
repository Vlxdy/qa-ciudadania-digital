/**
 * Helpers para escenarios del módulo qr-seguro — endpoint POST /api/qr/anulacion.
 */
import { QrSeguroTransaccionInputSchema } from '../../../../schemas/qr-seguro.schema';
import { qaEnv } from '../../../config/qa-env';
import { qaPost } from '../../../http/qa-http';

// ─── Validación Zod ───────────────────────────────────────────────────────────

export function validateInputAnulacion(input: unknown): {
  valid: boolean;
  error: string;
  fields: string[];
} {
  const result = QrSeguroTransaccionInputSchema.safeParse(input);
  if (result.success) return { valid: true, error: '', fields: [] };

  const issues = result.error.issues;
  const error = issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  const fields = issues.map((i) => i.path.join('.'));
  return { valid: false, error, fields };
}

// ─── Helper build + send (omite Zod) ─────────────────────────────────────────

export async function tryBuildAndSendAnulacion(input: unknown): Promise<{
  httpStatus?: number;
  body?: unknown;
  request?: import('../../../types/scenario.types').QaRequestTrace;
  durationMs: number;
}> {
  const start = Date.now();
  try {
    return await qaPost(anulacionUrl(), input, {
      Authorization: `Bearer ${defaultToken()}`,
      'Content-Type': 'application/json',
    });
  } catch {
    return { durationMs: Date.now() - start };
  }
}

// ─── Accesos rápidos ──────────────────────────────────────────────────────────

export const anulacionUrl = () => `${qaEnv.QR_SEGURO_URL_BASE}/api/qr/anulacion`;

export const defaultToken = () => qaEnv.QR_SEGURO_TOKEN;
