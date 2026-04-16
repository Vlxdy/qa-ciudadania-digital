/**
 * Helpers para escenarios del módulo notificador — endpoint /juridico (entidad pública).
 */
import fs from 'fs';
import type { NotificacionJuridicoInput } from '../../../../schemas/notification-juridico.schema';
import { NotificacionJuridicoInputSchema } from '../../../../schemas/notification-juridico.schema';
import { QaCryptoService } from '../../../services/qa-crypto.service';
import { QaBodyBuilderJuridico } from '../../../services/qa-body-builder-juridico';
import type { BodyFinal } from '../../../../services/body-builder.service';
import { qaEnv } from '../../../config/qa-env';
import { fixturesPaths } from '../../../fixtures/paths';
import { QaFileHashService } from '../qa-file-hash.service';
import { qaPost } from '../../../http/qa-http';

// ─── Placeholder hash para URLs que no tienen hash real en env ────────────────
const PLACEHOLDER_HASH_ENLACE = 'a'.repeat(64);
const PLACEHOLDER_HASH_FORMULARIO = 'b'.repeat(64);

// ─── Notificación base leída desde variables de entorno ───────────────────────

/**
 * Construye la notificación base jurídica usando las variables de entorno.
 * Los campos notificador/autoridad son PersonaNatural (igual que en natural).
 * El campo notificados usa { codigoEntidad } en lugar de PersonaNatural.
 */
function buildBaseJuridico(): NotificacionJuridicoInput {
  const base: NotificacionJuridicoInput = {
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
        { codigoEntidad: qaEnv.NOTI_JURIDICO_CODIGO_ENTIDAD },
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
 * Variante asíncrona: descarga adjuntos y calcula hashes SHA-256 reales.
 */
export async function buildBaseJuridicoAsync(): Promise<NotificacionJuridicoInput> {
  const base = buildBaseJuridico();

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

export const BASE_JURIDICO: NotificacionJuridicoInput = buildBaseJuridico();

// ─── Accesos rápidos ──────────────────────────────────────────────────────────

export const baseJuridicoNotificador = () => BASE_JURIDICO.notificacion.notificador;
export const baseJuridicoAutoridad = () => BASE_JURIDICO.notificacion.autoridad;
export const baseJuridicoNotificado = () => BASE_JURIDICO.notificacion.notificados[0];

// ─── Builder ──────────────────────────────────────────────────────────────────

/**
 * Construye el body final cifrado usando BASE_JURIDICO.
 */
export function buildValidBodyJuridico(
  padding: 'PKCS1' | 'OAEP' = qaEnv.RSA_PADDING,
  fixedKeyHex?: string,
  fixedIvHex?: string,
): BodyFinal {
  const pem = readPublicKey();
  const aes = QaCryptoService.generateAesMaterial(fixedKeyHex, fixedIvHex);
  return QaBodyBuilderJuridico.build(BASE_JURIDICO, aes, pem, padding);
}

/**
 * Variante asíncrona: calcula hashes reales desde las URLs antes de cifrar.
 */
export async function buildValidBodyJuridicoAsync(
  padding: 'PKCS1' | 'OAEP' = qaEnv.RSA_PADDING,
  fixedKeyHex?: string,
  fixedIvHex?: string,
): Promise<BodyFinal> {
  const pem = readPublicKey();
  const aes = QaCryptoService.generateAesMaterial(fixedKeyHex, fixedIvHex);
  const input = await buildBaseJuridicoAsync();
  return QaBodyBuilderJuridico.build(input, aes, pem, padding);
}

/**
 * Reemplaza hashes placeholder descargando los PDFs de cada URL.
 */
async function resolveHashesJuridico(
  input: NotificacionJuridicoInput,
): Promise<NotificacionJuridicoInput> {
  const isPlaceholder = (h: string) =>
    h === PLACEHOLDER_HASH_ENLACE || h === PLACEHOLDER_HASH_FORMULARIO || h === '';

  const enlaces = await Promise.all(
    input.notificacion.enlaces.map(async (e) =>
      isPlaceholder(e.hash ?? '')
        ? { ...e, hash: await QaFileHashService.downloadAndHash(e.url) }
        : e,
    ),
  );

  const f = input.notificacion.formularioNotificacion;
  const formularioNotificacion = isPlaceholder(f.hash ?? '')
    ? { ...f, hash: await QaFileHashService.downloadAndHash(f.url) }
    : f;

  return { notificacion: { ...input.notificacion, enlaces, formularioNotificacion } };
}

/**
 * Versión asíncrona: calcula hashes reales para cualquier input personalizado.
 */
export async function buildBodyJuridicoAsync(
  input: NotificacionJuridicoInput,
  padding: 'PKCS1' | 'OAEP' = qaEnv.RSA_PADDING,
): Promise<BodyFinal> {
  const pem = readPublicKey();
  const aes = QaCryptoService.generateAesMaterial();
  const withHashes = await resolveHashesJuridico(input);
  return QaBodyBuilderJuridico.build(withHashes, aes, pem, padding);
}

/**
 * Construye el body con una clave pública PEM arbitraria (para escenarios de error).
 */
export function buildBodyJuridicoWithPem(
  pem: string,
  padding: 'PKCS1' | 'OAEP' = qaEnv.RSA_PADDING,
): BodyFinal {
  const aes = QaCryptoService.generateAesMaterial();
  return QaBodyBuilderJuridico.build(BASE_JURIDICO, aes, pem, padding);
}

// ─── Validación Zod ───────────────────────────────────────────────────────────

/**
 * Valida un input contra el schema Zod jurídico.
 */
export function validateInputJuridico(input: unknown): {
  valid: boolean;
  error: string;
  fields: string[];
} {
  const result = NotificacionJuridicoInputSchema.safeParse(input);
  if (result.success) return { valid: true, error: '', fields: [] };

  const issues = result.error.issues;
  const error = issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('; ');
  const fields = issues.map((i) => i.path.join('.'));
  return { valid: false, error, fields };
}

// ─── Accesos rápidos ──────────────────────────────────────────────────────────

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

export const notificadorJuridicoUrl = () =>
  `${qaEnv.ISSUER_NOTIFICADOR}/api/notificacion/juridico`;

export const defaultJuridicoToken = () => qaEnv.TOKEN_CONFIGURACION;

// ─── Helper para escenarios de validación ─────────────────────────────────────

/**
 * Construye el body cifrado con `input` (omitiendo Zod) y lo envía al servidor.
 */
export async function tryBuildAndSendJuridico(input: unknown): Promise<{
  httpStatus?: number;
  body?: unknown;
  request?: import('../../../types/scenario.types').QaRequestTrace;
  durationMs: number;
}> {
  const start = Date.now();
  try {
    const pem = readPublicKey();
    const aes = QaCryptoService.generateAesMaterial();
    const withHashes = await resolveHashesJuridico(input as NotificacionJuridicoInput);
    const body = QaBodyBuilderJuridico.build(withHashes, aes, pem, qaEnv.RSA_PADDING);
    return await qaPost(notificadorJuridicoUrl(), body, {
      Authorization: `Bearer ${defaultJuridicoToken()}`,
      'Content-Type': 'application/json',
    });
  } catch {
    return { durationMs: Date.now() - start };
  }
}
