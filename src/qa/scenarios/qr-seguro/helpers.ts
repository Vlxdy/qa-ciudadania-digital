/**
 * Helpers para escenarios del módulo qr-seguro — endpoint POST /api/qr/generar.
 */
import { randomUUID } from 'crypto';
import type { QrSeguroInput } from '../../../schemas/qr-seguro.schema';
import { QrSeguroInputSchema } from '../../../schemas/qr-seguro.schema';
import { qaEnv } from '../../config/qa-env';
import { qaPost } from '../../http/qa-http';
import { ensureAccessToken } from '../proveedor/services/token-provider';

function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function buildFechas(): { fechaEmision: string; fechaExpiracion: string } {
  const emision = new Date();
  const expiracion = new Date(emision);
  expiracion.setDate(expiracion.getDate() + 1);
  return { fechaEmision: formatDate(emision), fechaExpiracion: formatDate(expiracion) };
}

// ─── Builder dinámico ────────────────────────────────────────────────────────

/** Construye el body completo para la generación de QR.
 *  Genera un codigoTransaccion UUID v4 fresco en cada llamada.
 *  Si el store no tiene token ejecuta el flujo OAuth automáticamente. */
export async function buildQrSeguroBody(): Promise<QrSeguroInput> {
  const accessToken = await ensureAccessToken();
  const { fechaEmision, fechaExpiracion } = buildFechas();
  return {
    accessToken,
    mostrarEnlace: false,
    codigoTransaccion: randomUUID(),
    documentoDigital: {
      codigoDocumento: qaEnv.QR_SEGURO_CODIGO_DOCUMENTO,
      nombreDocumento: qaEnv.QR_SEGURO_NOMBRE_DOCUMENTO,
      descripcionDocumento: qaEnv.QR_SEGURO_DESCRIPCION_DOCUMENTO,
      validez: {
        fechaEmision,
        fechaExpiracion,
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
