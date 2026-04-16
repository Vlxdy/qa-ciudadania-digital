/**
 * Helpers para escenarios del módulo notificador — endpoint PATCH /delegado/representante_legal.
 * Inhabilitar a Ciudadano como Delegado de Entidad Pública.
 */
import type { InactivarDelegadoInput } from '../../../../schemas/inactivar-delegado.schema';
import { InactivarDelegadoInputSchema } from '../../../../schemas/inactivar-delegado.schema';
import { qaEnv } from '../../../config/qa-env';
import { qaPatch } from '../../../http/qa-http';

// ─── Input base leído desde variables de entorno ──────────────────────────────

function buildBaseInactivarDelegado(): InactivarDelegadoInput {
  return {
    codigoEntidad: qaEnv.NOTI_DELEGADO_CODIGO_ENTIDAD,
    representanteLegal: {
      tipoDocumento: qaEnv.NOTI_DELEGADO_REPRESENTANTE_TIPO_DOC,
      numeroDocumento: qaEnv.NOTI_DELEGADO_REPRESENTANTE_NUMERO_DOC,
      fechaNacimiento: qaEnv.NOTI_DELEGADO_REPRESENTANTE_FECHA_NAC,
    },
  };
}

export const BASE_INACTIVAR_DELEGADO: InactivarDelegadoInput = buildBaseInactivarDelegado();

// ─── Validación Zod ───────────────────────────────────────────────────────────

export function validateInputInactivarDelegado(input: unknown): {
  valid: boolean;
  error: string;
  fields: string[];
} {
  const result = InactivarDelegadoInputSchema.safeParse(input);
  if (result.success) return { valid: true, error: '', fields: [] };

  const issues = result.error.issues;
  const error = issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  const fields = issues.map((i) => i.path.join('.'));
  return { valid: false, error, fields };
}

// ─── Helper build + send (omite Zod) ─────────────────────────────────────────

export async function tryBuildAndSendInactivarDelegado(input: unknown): Promise<{
  httpStatus?: number;
  body?: unknown;
  request?: import('../../../types/scenario.types').QaRequestTrace;
  durationMs: number;
}> {
  const start = Date.now();
  try {
    return await qaPatch(inactivarDelegadoUrl(), input, {
      Authorization: `Bearer ${defaultToken()}`,
      'Content-Type': 'application/json',
    });
  } catch {
    return { durationMs: Date.now() - start };
  }
}

// ─── Accesos rápidos ──────────────────────────────────────────────────────────

export const inactivarDelegadoUrl = () =>
  `${qaEnv.ISSUER_NOTIFICADOR}/api/delegado/representante_legal`;

export const defaultToken = () => qaEnv.TOKEN_CONFIGURACION;
