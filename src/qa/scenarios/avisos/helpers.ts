/**
 * Helpers para escenarios del módulo avisos — endpoint POST /ciudadanos/avisos.
 */
import type { AvisosInput } from '../../../schemas/avisos.schema';
import { AvisosInputSchema } from '../../../schemas/avisos.schema';
import { qaEnv } from '../../config/qa-env';
import { qaPost } from '../../http/qa-http';
import { getProveedorSessionStore } from '../proveedor/services/session.store';

// ─── Token de acceso (obtenido del flujo proveedor prov-00 + prov-01) ─────────

export function getAccessToken(): string {
  return getProveedorSessionStore().runtime.accessToken ?? '';
}

// ─── Input base estructural (sin accessToken — se lee en tiempo de ejecución) ─

/** Referencia estructural estática: útil para spread en escenarios de validación.
 *  NO usar directamente en llamadas HTTP — usar buildAvisosBody() en su lugar. */
export const BASE_AVISOS_STRUCT = {
  codigoPlantilla: qaEnv.AVISOS_CODIGO_PLANTILLA,
  envios: [
    {
      uuidCiudadano: qaEnv.AVISOS_UUID_CIUDADANO,
      parametros: [qaEnv.AVISOS_PARAMETRO_1],
    },
  ],
};

// ─── Builder dinámico (lee el accessToken del store en cada llamada) ──────────

/** Construye el body completo incluyendo el accessToken desde el session store.
 *  Debe llamarse dentro del run() del escenario para capturar el token actual. */
export function buildAvisosBody(): AvisosInput {
  return {
    codigoPlantilla: qaEnv.AVISOS_CODIGO_PLANTILLA,
    accessToken: getAccessToken(),
    envios: [
      {
        uuidCiudadano: qaEnv.AVISOS_UUID_CIUDADANO,
        parametros: [qaEnv.AVISOS_PARAMETRO_1],
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

export const avisosUrl = () => `${qaEnv.AVISOS_URL_BASE}/ciudadanos/avisos`;

export const defaultToken = () => qaEnv.AVISOS_TOKEN;
