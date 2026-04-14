/**
 * Helpers para escenarios del módulo notificador.
 */
import fs from 'fs';
import type { NotificacionInput } from '../../../schemas/notification.schema';
import { NotificacionInputSchema } from '../../../schemas/notification.schema';
import { QaCryptoService } from '../../services/qa-crypto.service';
import { QaBodyBuilder } from '../../services/qa-body-builder';
import type { BodyFinal } from '../../../services/body-builder.service';
import { qaEnv } from '../../config/qa-env';
import { fixturesPaths } from '../../fixtures/paths';

// ─── Notificación base válida ─────────────────────────────────────────────────

export const BASE_NOTIFICACION: NotificacionInput = {
  notificacion: {
    titulo: 'Notificación de prueba QA',
    descripcion: 'Se notifica al ciudadano sobre el proceso de prueba automatizada.',
    notificador: {
      tipoDocumento: 'CI',
      numeroDocumento: '4160481',
      fechaNacimiento: '1960-05-26',
    },
    autoridad: {
      tipoDocumento: 'CI',
      numeroDocumento: '4160481',
      fechaNacimiento: '1960-05-26',
    },
    notificados: [
      {
        tipoDocumento: 'CI',
        numeroDocumento: '5585535',
        fechaNacimiento: '1974-01-31',
      },
    ],
    enlaces: [
      {
        etiqueta: 'Documento QA',
        url: 'https://example.com/qa/documento.pdf',
        tipo: 'APROBACION',
        hash: 'a'.repeat(64),
      },
    ],
    formularioNotificacion: {
      etiqueta: 'Formulario QA',
      url: 'https://example.com/qa/formulario.pdf',
      tipo: 'FIRMA',
      hash: 'b'.repeat(64),
    },
  },
};

// ─── Builder ──────────────────────────────────────────────────────────────────

/**
 * Construye el body final cifrado para el notificador.
 * Lee la clave pública del path configurado en .env.
 */
export function buildValidBody(
  padding: 'PKCS1' | 'OAEP' = 'PKCS1',
  fixedKeyHex?: string,
  fixedIvHex?: string,
): BodyFinal {
  const pem = readPublicKey();
  const aes = QaCryptoService.generateAesMaterial(fixedKeyHex, fixedIvHex);
  return QaBodyBuilder.build(BASE_NOTIFICACION, aes, pem, padding);
}

/**
 * Construye el body con una clave pública PEM arbitraria (para escenarios de error).
 */
export function buildBodyWithPem(pem: string, padding: 'PKCS1' | 'OAEP' = 'PKCS1'): BodyFinal {
  const aes = QaCryptoService.generateAesMaterial();
  return QaBodyBuilder.build(BASE_NOTIFICACION, aes, pem, padding);
}

// ─── Validación Zod ───────────────────────────────────────────────────────────

/**
 * Valida un input contra el schema Zod.
 * Retorna { valid, error, fields } para que el escenario construya el resultado.
 */
export function validateInput(input: unknown): {
  valid: boolean;
  error: string;
  fields: string[];
} {
  const result = NotificacionInputSchema.safeParse(input);
  if (result.success) return { valid: true, error: '', fields: [] };

  const issues = result.error.issues;
  const error = issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('; ');
  const fields = issues.map((i) => i.path.join('.'));
  return { valid: false, error, fields };
}

// ─── Accesos rápidos ─────────────────────────────────────────────────────────

export function readPublicKey(): string {
  const keyPath = qaEnv.RSA_PUBLIC_KEY_PATH;
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Clave pública RSA no encontrada en: ${keyPath}`);
  }
  return fs.readFileSync(keyPath, 'utf-8');
}

export function readInvalidPem(): string {
  return fs.readFileSync(fixturesPaths.invalidPem, 'utf-8');
}

export const notificadorUrl = () =>
  `${qaEnv.ISSUER_NOTIFICADOR}/api/notificacion/natural`;
export const defaultToken = () => qaEnv.TOKEN_CONFIGURACION;
