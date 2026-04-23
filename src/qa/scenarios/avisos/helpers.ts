/**
 * Helpers para escenarios del módulo avisos — endpoint POST /ciudadanos/avisos.
 */
import type { AvisosInput } from '../../../schemas/avisos.schema';
import { AvisosInputSchema } from '../../../schemas/avisos.schema';
import { qaEnv } from '../../config/qa-env';
import { qaPost } from '../../http/qa-http';
import { ensureAccessToken } from '../proveedor/services/token-provider';

// ─── Builder dinámico (obtiene el accessToken via OAuth si no está en el store) ─

/** Construye el body completo incluyendo el accessToken del ciudadano.
 *  Si el store no tiene token ejecuta el flujo OAuth automáticamente. */
export async function buildAvisosBody(): Promise<AvisosInput> {
  const accessToken = await ensureAccessToken();
  return {
    codigoPlantilla: qaEnv.AVISOS_CODIGO_PLANTILLA,
    accessToken,
    envios: [
      {
        uuidCiudadano: qaEnv.AVISOS_UUID_CIUDADANO,
        parametros: qaEnv.AVISOS_PARAMETRO_1 ? [qaEnv.AVISOS_PARAMETRO_1] : undefined,
      },
    ],
  };
}

// ─── Validación Zod ───────────────────────────────────────────────────────────

export function validateInputAvisos(input: unknown): {
  valid: boolean;
  error: string;
  fields: string[];
} {
  const result = AvisosInputSchema.safeParse(input);
  if (result.success) return { valid: true, error: '', fields: [] };

  const issues = result.error.issues;
  const error = issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  const fields = issues.map((i) => i.path.join('.'));
  return { valid: false, error, fields };
}

// ─── Helper build + send (omite Zod) ─────────────────────────────────────────

export async function tryBuildAndSendAvisos(input: unknown): Promise<{
  httpStatus?: number;
  body?: unknown;
  request?: import('../../types/scenario.types').QaRequestTrace;
  durationMs: number;
}> {
  const start = Date.now();
  try {
    return await qaPost(avisosUrl(), input, {
      Authorization: `Bearer ${defaultToken()}`,
      'Content-Type': 'application/json',
    });
  } catch {
    return { durationMs: Date.now() - start };
  }
}

// ─── Accesos rápidos ──────────────────────────────────────────────────────────

export const avisosUrl = () => `${qaEnv.AVISOS_URL_BASE}/api/ciudadanos/avisos`;

export const defaultToken = () => qaEnv.AVISOS_TOKEN;
