/**
 * Variables de entorno para QA.
 * A diferencia de src/config/env.ts, NO hace process.exit si faltan vars —
 * simplemente deja el campo vacío y el runner reporta qué escenarios no pueden correr.
 *
 * Soporte de ambientes: --env=staging carga .env.staging sobre .env base.
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const envFlag = process.argv.find((a) => a.startsWith('--env='));
if (envFlag) {
  const envName = envFlag.split('=').slice(1).join('=');
  const envPath = path.resolve(`.env.${envName}`);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  } else {
    console.warn(`[qa-env] Advertencia: no se encontró .env.${envName} en ${envPath}`);
  }
}

// Persona base del operador QA.
// Es el fallback para notificador, autoridad, representante delegado y titular QR.
// Sobreescribe cada campo individualmente en .env si un escenario requiere una persona distinta.
const operadorTipoDoc   = (process.env.QA_OPERADOR_TIPO_DOC ?? 'CI') as 'CI' | 'CIE';
const operadorNumeroDoc = process.env.QA_OPERADOR_NUMERO_DOC;
const operadorFechaNac  = process.env.QA_OPERADOR_FECHA_NAC;

export const qaEnv = {
  // ─── Aprobador ────────────────────────────────────────────────────────────
  APROBADOR_URL: process.env.APROBADOR_URL ?? '',
  TOKEN_CLIENTE: process.env.TOKEN_CLIENTE ?? '',

  HASH_MODE: (process.env.HASH_MODE ?? 'BUFFER') as 'BUFFER' | 'BASE64',

  // ─── Notificador — conexión ───────────────────────────────────────────────
  ISSUER_NOTIFICADOR: process.env.ISSUER_NOTIFICADOR ?? '',
  TOKEN_CONFIGURACION: process.env.TOKEN_CONFIGURACION ?? '',
  RSA_PUBLIC_KEY_PATH: process.env.RSA_PUBLIC_KEY_PATH ?? './keys/public.pem',
  RSA_PADDING: (process.env.RSA_PADDING ?? 'PKCS1') as 'PKCS1' | 'OAEP',

  // ─── Notificador — datos de la notificación ───────────────────────────────
  NOTI_TITULO:      process.env.NOTI_TITULO,
  NOTI_DESCRIPCION: process.env.NOTI_DESCRIPCION,

  // Ciudadano notificador — fallback a QA_OPERADOR_*
  NOTI_NOTIFICADOR_TIPO_DOC: (process.env.NOTI_NOTIFICADOR_TIPO_DOC ?? operadorTipoDoc) as 'CI' | 'CIE',
  NOTI_NOTIFICADOR_NUMERO_DOC: process.env.NOTI_NOTIFICADOR_NUMERO_DOC ?? operadorNumeroDoc,
  NOTI_NOTIFICADOR_FECHA_NAC:  process.env.NOTI_NOTIFICADOR_FECHA_NAC  ?? operadorFechaNac,

  // Ciudadano autoridad — fallback a QA_OPERADOR_*
  NOTI_AUTORIDAD_TIPO_DOC: (process.env.NOTI_AUTORIDAD_TIPO_DOC ?? operadorTipoDoc) as 'CI' | 'CIE',
  NOTI_AUTORIDAD_NUMERO_DOC: process.env.NOTI_AUTORIDAD_NUMERO_DOC ?? operadorNumeroDoc,
  NOTI_AUTORIDAD_FECHA_NAC:  process.env.NOTI_AUTORIDAD_FECHA_NAC  ?? operadorFechaNac,

  // Ciudadano notificado principal
  NOTI_NOTIFICADO_TIPO_DOC: (process.env.NOTI_NOTIFICADO_TIPO_DOC ?? 'CI') as 'CI' | 'CIE',
  NOTI_NOTIFICADO_NUMERO_DOC: process.env.NOTI_NOTIFICADO_NUMERO_DOC,
  NOTI_NOTIFICADO_FECHA_NAC:  process.env.NOTI_NOTIFICADO_FECHA_NAC,

  // Ciudadano notificado secundario (para escenario CIE — noti-20)
  NOTI_NOTIFICADO_CIE_NUMERO_DOC: process.env.NOTI_NOTIFICADO_CIE_NUMERO_DOC,
  NOTI_NOTIFICADO_CIE_FECHA_NAC:  process.env.NOTI_NOTIFICADO_CIE_FECHA_NAC,

  // Enlace adjunto principal (tipo APROBACION)
  NOTI_ENLACE_URL:      process.env.NOTI_ENLACE_URL,
  NOTI_ENLACE_ETIQUETA: process.env.NOTI_ENLACE_ETIQUETA,
  NOTI_ENLACE_TIPO: process.env.NOTI_ENLACE_TIPO as 'FIRMA' | 'APROBACION' | undefined,
  // Si está vacío, helpers.ts computará el hash descargando el archivo (o usará placeholder)
  NOTI_ENLACE_HASH: process.env.NOTI_ENLACE_HASH ?? '',

  // Enlace para archivo firmado digitalmente (tipo FIRMA) — noti-19 y similares
  NOTI_ENLACE_FIRMA_URL:      process.env.NOTI_ENLACE_FIRMA_URL,
  NOTI_ENLACE_FIRMA_ETIQUETA: process.env.NOTI_ENLACE_FIRMA_ETIQUETA,
  NOTI_ENLACE_FIRMA_HASH: process.env.NOTI_ENLACE_FIRMA_HASH ?? '',

  // Formulario de notificación
  NOTI_FORMULARIO_URL:      process.env.NOTI_FORMULARIO_URL,
  NOTI_FORMULARIO_ETIQUETA: process.env.NOTI_FORMULARIO_ETIQUETA,
  NOTI_FORMULARIO_TIPO: process.env.NOTI_FORMULARIO_TIPO as 'FIRMA' | 'APROBACION' | undefined,
  NOTI_FORMULARIO_HASH: process.env.NOTI_FORMULARIO_HASH ?? '',

  // Entidad notificadora (opcional — omitir para usar la entidad origen)
  NOTI_ENTIDAD_NOTIFICADORA: process.env.NOTI_ENTIDAD_NOTIFICADORA ?? '',

  // ─── Delegado de Entidad Pública ─────────────────────────────────────────
  NOTI_DELEGADO_CODIGO_ENTIDAD: process.env.NOTI_DELEGADO_CODIGO_ENTIDAD,
  NOTI_DELEGADO_DESCRIPCION:    process.env.NOTI_DELEGADO_DESCRIPCION,

  // Representante legal — fallback a QA_OPERADOR_*
  NOTI_DELEGADO_REPRESENTANTE_TIPO_DOC: (process.env.NOTI_DELEGADO_REPRESENTANTE_TIPO_DOC ?? operadorTipoDoc) as 'CI' | 'CIE',
  NOTI_DELEGADO_REPRESENTANTE_NUMERO_DOC: process.env.NOTI_DELEGADO_REPRESENTANTE_NUMERO_DOC ?? operadorNumeroDoc,
  NOTI_DELEGADO_REPRESENTANTE_FECHA_NAC:  process.env.NOTI_DELEGADO_REPRESENTANTE_FECHA_NAC  ?? operadorFechaNac,

  // ─── QR-Seguro ───────────────────────────────────────────────────────────
  QR_SEGURO_URL_BASE: process.env.QR_SEGURO_URL_BASE ?? '',
  QR_SEGURO_TOKEN:    process.env.QR_SEGURO_TOKEN    ?? '',

  QR_SEGURO_CODIGO_DOCUMENTO:      process.env.QR_SEGURO_CODIGO_DOCUMENTO,
  QR_SEGURO_NOMBRE_DOCUMENTO:      process.env.QR_SEGURO_NOMBRE_DOCUMENTO,
  QR_SEGURO_DESCRIPCION_DOCUMENTO: process.env.QR_SEGURO_DESCRIPCION_DOCUMENTO,

  // Titular del documento — fallback a QA_OPERADOR_*
  QR_SEGURO_TITULAR_NOMBRE:     process.env.QR_SEGURO_TITULAR_NOMBRE,
  QR_SEGURO_TITULAR_TIPO_DOC: (process.env.QR_SEGURO_TITULAR_TIPO_DOC ?? operadorTipoDoc) as 'CI' | 'CIE',
  QR_SEGURO_TITULAR_NUMERO_DOC: process.env.QR_SEGURO_TITULAR_NUMERO_DOC ?? operadorNumeroDoc,
  QR_SEGURO_TITULAR_ROL:        process.env.QR_SEGURO_TITULAR_ROL,

  // ─── Avisos ───────────────────────────────────────────────────────────────
  AVISOS_URL_BASE:         process.env.AVISOS_URL_BASE         ?? '',
  AVISOS_TOKEN:            process.env.AVISOS_TOKEN            ?? '',
  AVISOS_CODIGO_PLANTILLA: process.env.AVISOS_CODIGO_PLANTILLA ?? '',
  AVISOS_UUID_CIUDADANO:   process.env.AVISOS_UUID_CIUDADANO   ?? '',
  AVISOS_UUID_CIUDADANO_2: process.env.AVISOS_UUID_CIUDADANO_2 ?? '',
  AVISOS_PARAMETRO_1:           process.env.AVISOS_PARAMETRO_1,
  AVISOS_PARAMETRO_REDIRECCION: process.env.AVISOS_PARAMETRO_REDIRECCION,

  // ─── Notificador — Obligatorio Legal ─────────────────────────────────────
  ISSUER_NOTIFICADOR_OBL_LEGAL:  process.env.ISSUER_NOTIFICADOR_OBL_LEGAL  ?? '',
  TOKEN_CONFIGURACION_OBL_LEGAL: process.env.TOKEN_CONFIGURACION_OBL_LEGAL ?? '',

  // ─── Notificador — Obligatorio Requerimiento ──────────────────────────────
  ISSUER_NOTIFICADOR_OBL_REQ:  process.env.ISSUER_NOTIFICADOR_OBL_REQ  ?? '',
  TOKEN_CONFIGURACION_OBL_REQ: process.env.TOKEN_CONFIGURACION_OBL_REQ ?? '',

  // ─── Notificador Jurídico ─────────────────────────────────────────────────
  NOTI_JURIDICO_CODIGO_ENTIDAD:   process.env.NOTI_JURIDICO_CODIGO_ENTIDAD,
  NOTI_JURIDICO_CODIGO_ENTIDAD_2: process.env.NOTI_JURIDICO_CODIGO_ENTIDAD_2,

  // ─── Documentos Digitales ────────────────────────────────────────────────
  DOC_DIGITAL_URL_BASE:         process.env.DOC_DIGITAL_URL_BASE         ?? '',
  DOC_DIGITAL_TOKEN:            process.env.DOC_DIGITAL_TOKEN            ?? '',
  DOC_DIGITAL_CODIGO_DOCUMENTO: process.env.DOC_DIGITAL_CODIGO_DOCUMENTO ?? '',

  // ─── Proveedor ────────────────────────────────────────────────────────────
  OIDC_ISSUER:             process.env.OIDC_ISSUER             ?? '',
  OIDC_CLIENT_ID:          process.env.OIDC_CLIENT_ID          ?? '',
  OIDC_CLIENT_SECRET:      process.env.OIDC_CLIENT_SECRET      ?? '',
  OIDC_REDIRECT_URI:       process.env.OIDC_REDIRECT_URI       ?? '',
  OIDC_TOKEN_PATH:         process.env.OIDC_TOKEN_PATH         ?? '/token',
  OIDC_CLIENT_AUTH_METHOD: (process.env.OIDC_CLIENT_AUTH_METHOD ?? 'post') as 'post' | 'basic' | 'mobile',
  OIDC_SCOPE:              process.env.OIDC_SCOPE              ?? 'openid profile',

  // ─── Proveedor — autenticación móvil (PKCE) ───────────────────────────────
  OIDC_MOBILE_CLIENT_ID:    process.env.OIDC_MOBILE_CLIENT_ID    ?? '',
  OIDC_MOBILE_REDIRECT_URI: process.env.OIDC_MOBILE_REDIRECT_URI ?? '',
  OIDC_MOBILE_SCOPE: process.env.OIDC_MOBILE_SCOPE ?? process.env.OIDC_SCOPE ?? 'openid profile',
} as const;

/** Retorna los nombres de las vars vacías para un módulo dado */
export function missingVars(module: 'aprobador' | 'notificador' | 'proveedor' | 'avisos' | 'qr-seguro' | 'documentos-digitales'): string[] {
  const checks: Record<typeof module, Record<string, string>> = {
    aprobador: {
      APROBADOR_URL: qaEnv.APROBADOR_URL,
      TOKEN_CLIENTE: qaEnv.TOKEN_CLIENTE,
    },
    notificador: {
      ISSUER_NOTIFICADOR: qaEnv.ISSUER_NOTIFICADOR,
      TOKEN_CONFIGURACION: qaEnv.TOKEN_CONFIGURACION,
    },
    proveedor: {
      OIDC_ISSUER:       qaEnv.OIDC_ISSUER,
      OIDC_CLIENT_ID:    qaEnv.OIDC_CLIENT_ID,
      OIDC_REDIRECT_URI: qaEnv.OIDC_REDIRECT_URI,
    },
    avisos: {
      AVISOS_URL_BASE:         qaEnv.AVISOS_URL_BASE,
      AVISOS_TOKEN:            qaEnv.AVISOS_TOKEN,
      AVISOS_CODIGO_PLANTILLA: qaEnv.AVISOS_CODIGO_PLANTILLA,
      AVISOS_UUID_CIUDADANO:   qaEnv.AVISOS_UUID_CIUDADANO,
    },
    'qr-seguro': {
      QR_SEGURO_URL_BASE: qaEnv.QR_SEGURO_URL_BASE,
      QR_SEGURO_TOKEN:    qaEnv.QR_SEGURO_TOKEN,
    },
    'documentos-digitales': {
      DOC_DIGITAL_URL_BASE:         qaEnv.DOC_DIGITAL_URL_BASE,
      DOC_DIGITAL_TOKEN:            qaEnv.DOC_DIGITAL_TOKEN,
      DOC_DIGITAL_CODIGO_DOCUMENTO: qaEnv.DOC_DIGITAL_CODIGO_DOCUMENTO,
    },
  };
  return Object.entries(checks[module])
    .filter(([, v]) => !v)
    .map(([k]) => k);
}
