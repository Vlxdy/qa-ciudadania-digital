/**
 * Helpers para escenarios del módulo qr-seguro — endpoint POST /api/qr/generar.
 */
import { randomUUID } from 'crypto';
import type { QrSeguroInput } from '../../../schemas/qr-seguro.schema';
import { QrSeguroInputSchema } from '../../../schemas/qr-seguro.schema';
import { qaEnv } from '../../config/qa-env';
import { qaPost } from '../../http/qa-http';
import { getProveedorSessionStore } from '../proveedor/services/session.store';

// ─── Token de acceso (flujo proveedor prov-00 + prov-01) ─────────────────────

export function getAccessToken(): string {
  return getProveedorSessionStore().runtime.accessToken ?? '';
}

// ─── Builder dinámico ────────────────────────────────────────────────────────

/** Construye el body completo para la generación de QR.
 *  Genera un codigoTransaccion UUID v4 fresco en cada llamada.
 *  Debe llamarse dentro del run() del escenario para capturar el accessToken actual. */
export function buildQrSeguroBody(): QrSeguroInput {
  return {
    accessToken: getAccessToken(),
    mostrarEnlace: false,
    codigoTransaccion: randomUUID(),
    documentoDigital: {
      codigoDocumento: qaEnv.QR_SEGURO_CODIGO_DOCUMENTO,
      nombreDocumento: qaEnv.QR_SEGURO_NOMBRE_DOCUMENTO,
      descripcionDocumento: qaEnv.QR_SEGURO_DESCRIPCION_DOCUMENTO,
      validez: {
        fechaEmision: qaEnv.QR_SEGURO_FECHA_EMISION,
        fechaExpiracion: qaEnv.QR_SEGURO_FECHA_EXPIRACION,
      },
      titulares: [
        {
          nombreCompleto: qaEnv.QR_SEGURO_TITULAR_NOMBRE,
          tipoDocumento: qaEnv.QR_SEGURO_TITULAR_TIPO_DOC,
          numeroDocumento: qaEnv.QR_SEGURO_TITULAR_NUMERO_DOC,
          rol: qaEnv.QR_SEGURO_TITULAR_ROL,
        },
      ],
    },
  };
}

// ─── Validación Zod ───────────────────────────────────────────────────────────

export function validateInputQrSeguro(input: unknown): {
  valid: boolean;
  error: string;
  fields: string[];
} {
  const result = QrSeguroInputSchema.safeParse(input);
  if (result.success) return { valid: true, error: '', fields: [] };

  const issues = result.error.issues;
  const error = issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  const fields = issues.map((i) => i.path.join('.'));
  return { valid: false, error, fields };
}

// ─── Helper build + send (omite Zod) ─────────────────────────────────────────

export async function tryBuildAndSendQrSeguro(input: unknown): Promise<{
  httpStatus?: number;
  body?: unknown;
  request?: import('../../types/scenario.types').QaRequestTrace;
  durationMs: number;
}> {
  const start = Date.now();
  try {
    return await qaPost(qrSeguroUrl(), input, {
      Authorization: `Bearer ${defaultToken()}`,
      'Content-Type': 'application/json',
    });
  } catch {
    return { durationMs: Date.now() - start };
  }
}

// ─── Accesos rápidos ──────────────────────────────────────────────────────────

export const qrSeguroUrl = () => `${qaEnv.QR_SEGURO_URL_BASE}/api/qr/generar`;

export const defaultToken = () => qaEnv.QR_SEGURO_TOKEN;
