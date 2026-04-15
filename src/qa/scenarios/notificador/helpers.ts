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
import { QaFileHashService } from './qa-file-hash.service';
import { qaPost } from '../../http/qa-http';

// ─── Placeholder hash para URLs que no tienen hash real en env ────────────────
// El servidor validará el hash contra el archivo real; usar solo cuando la URL
// también es un placeholder (example.com).
const PLACEHOLDER_HASH_ENLACE = 'a'.repeat(64);
const PLACEHOLDER_HASH_FORMULARIO = 'b'.repeat(64);

// ─── Notificación base leída desde variables de entorno ───────────────────────

/**
 * Construye la notificación base usando las variables de entorno NOTI_*.
 * Si una variable no está definida, usa el valor por defecto declarado en qa-env.ts.
 */
function buildBaseNotificacion(): NotificacionInput {
  const base: NotificacionInput = {
    notificacion: {
      titulo: qaEnv.NOTI_TITULO,
      descripcion: qaEnv.NOTI_DESCRIPCION,
      notificador: {
        tipoDocumento: qaEnv.NOTI_NOTIFICADOR_TIPO_DOC,
        numeroDocumento: qaEnv.NOTI_NOTIFICADOR_NUMERO_DOC,
        fechaNacimiento: qaEnv.NOTI_NOTIFICADOR_FECHA_NAC,
      },
      autoridad: {
        tipoDocumento: qaEnv.NOTI_AUTORIDAD_TIPO_DOC,
        numeroDocumento: qaEnv.NOTI_AUTORIDAD_NUMERO_DOC,
        fechaNacimiento: qaEnv.NOTI_AUTORIDAD_FECHA_NAC,
      },
      notificados: [
        {
          tipoDocumento: qaEnv.NOTI_NOTIFICADO_TIPO_DOC,
          numeroDocumento: qaEnv.NOTI_NOTIFICADO_NUMERO_DOC,
          fechaNacimiento: qaEnv.NOTI_NOTIFICADO_FECHA_NAC,
        },
      ],
      enlaces: [
        {
          etiqueta: qaEnv.NOTI_ENLACE_ETIQUETA,
          url: qaEnv.NOTI_ENLACE_URL,
          tipo: qaEnv.NOTI_ENLACE_TIPO,
          hash: qaEnv.NOTI_ENLACE_HASH || PLACEHOLDER_HASH_ENLACE,
        },
      ],
      formularioNotificacion: {
        etiqueta: qaEnv.NOTI_FORMULARIO_ETIQUETA,
        url: qaEnv.NOTI_FORMULARIO_URL,
        tipo: qaEnv.NOTI_FORMULARIO_TIPO,
        hash: qaEnv.NOTI_FORMULARIO_HASH || PLACEHOLDER_HASH_FORMULARIO,
      },
    },
  };

  if (qaEnv.NOTI_ENTIDAD_NOTIFICADORA) {
    base.notificacion.entidadNotificadora = qaEnv.NOTI_ENTIDAD_NOTIFICADORA;
  }

  return base;
}

/**
 * Variante asíncrona: descarga los archivos adjuntos y calcula sus hashes SHA-256
 * cuando no están configurados en NOTI_ENLACE_HASH / NOTI_FORMULARIO_HASH.
 * Usar en escenarios happy-path contra un entorno real con PDFs accesibles.
 */
export async function buildBaseNotificacionAsync(): Promise<NotificacionInput> {
  const base = buildBaseNotificacion();

  if (!qaEnv.NOTI_ENLACE_HASH) {
    base.notificacion.enlaces[0].hash = await QaFileHashService.downloadAndHash(
      qaEnv.NOTI_ENLACE_URL,
    );
  }
  if (!qaEnv.NOTI_FORMULARIO_HASH) {
    base.notificacion.formularioNotificacion.hash = await QaFileHashService.downloadAndHash(
      qaEnv.NOTI_FORMULARIO_URL,
    );
  }

  return base;
}

export const BASE_NOTIFICACION: NotificacionInput = buildBaseNotificacion();

// ─── Accesos rápidos a personas base ─────────────────────────────────────────

export const baseNotificador = () => BASE_NOTIFICACION.notificacion.notificador;
export const baseAutoridad = () => BASE_NOTIFICACION.notificacion.autoridad;
export const baseNotificado = () => BASE_NOTIFICACION.notificacion.notificados[0];

// ─── Builder ──────────────────────────────────────────────────────────────────

/**
 * Construye el body final cifrado usando BASE_NOTIFICACION.
 * Lee la clave pública del path configurado en .env.
 */
export function buildValidBody(
  padding: 'PKCS1' | 'OAEP' = qaEnv.RSA_PADDING,
  fixedKeyHex?: string,
  fixedIvHex?: string,
): BodyFinal {
  const pem = readPublicKey();
  const aes = QaCryptoService.generateAesMaterial(fixedKeyHex, fixedIvHex);
  return QaBodyBuilder.build(BASE_NOTIFICACION, aes, pem, padding);
}

/**
 * Variante asíncrona: calcula hashes reales desde las URLs antes de cifrar.
 * Útil en happy-path contra un entorno con PDFs reales accesibles.
 */
export async function buildValidBodyAsync(padding: 'PKCS1' | 'OAEP' = qaEnv.RSA_PADDING): Promise<BodyFinal> {
  const pem = readPublicKey();
  const aes = QaCryptoService.generateAesMaterial();
  const input = await buildBaseNotificacionAsync();
  return QaBodyBuilder.build(input, aes, pem, padding);
}

/**
 * Construye el body con una clave pública PEM arbitraria (para escenarios de error).
 */
export function buildBodyWithPem(pem: string, padding: 'PKCS1' | 'OAEP' = qaEnv.RSA_PADDING): BodyFinal {
  const aes = QaCryptoService.generateAesMaterial();
  return QaBodyBuilder.build(BASE_NOTIFICACION, aes, pem, padding);
}

/**
 * Construye body cifrado para `input` con el padding correcto del .env.
 * Atajo para escenarios que necesitan llamar QaBodyBuilder directamente.
 */
export function buildBody(input: NotificacionInput): BodyFinal {
  const pem = readPublicKey();
  const aes = QaCryptoService.generateAesMaterial();
  return QaBodyBuilder.build(input, aes, pem, qaEnv.RSA_PADDING);
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

// ─── Helper para escenarios de validación ─────────────────────────────────────

/**
 * Construye el body cifrado con `input` (omitiendo Zod) y lo envía al servidor.
 * Retorna el resultado HTTP con su `request` poblado, permitiendo que el runner
 * guarde el CURL aunque la validación local haya fallado.
 *
 * Si el body building falla (p.ej. RSA key inválida), retorna solo `durationMs`
 * sin `request`, y el reporter generará un CURL parcial de documentación.
 */
export async function tryBuildAndSend(input: unknown): Promise<{
  httpStatus?: number;
  body?: unknown;
  request?: import('../../types/scenario.types').QaRequestTrace;
  durationMs: number;
}> {
  const start = Date.now();
  try {
    const pem = readPublicKey();
    const aes = QaCryptoService.generateAesMaterial();
    const body = QaBodyBuilder.build(input as NotificacionInput, aes, pem, qaEnv.RSA_PADDING);
    return await qaPost(notificadorUrl(), body, {
      Authorization: `Bearer ${defaultToken()}`,
      'Content-Type': 'application/json',
    });
  } catch {
    return { durationMs: Date.now() - start };
  }
}
