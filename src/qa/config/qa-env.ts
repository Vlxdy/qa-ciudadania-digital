/**
 * Variables de entorno para QA, parseadas y validadas con Zod.
 *
 * Todos los campos de `qaEnv` tienen tipos precisos (sin string | undefined):
 *  - Campos requeridos con default: z.string().default('') → siempre string
 *  - Campos enum con fallback:      z.enum([...]).catch('DEFAULT') → nunca undefined
 *  - Campos numéricos:              z.coerce.number().catch(N) → siempre number
 *  - Campos booleanos:              derivados de string vía transform
 *
 * La validación semántica (campos vacíos requeridos para cada módulo) vive en
 * qa-env.schema.ts y se ejecuta al inicio de `npm run qa`.
 *
 * Soporte de ambientes: --env=staging carga .env.staging sobre .env base.
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

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

// ─── Schema de parseo de process.env ─────────────────────────────────────────
// z.string().default('') → acepta undefined y lo convierte en '', nunca falla.
// z.enum([...]).catch(X) → acepta undefined o valores inválidos y los reemplaza por X.
// z.coerce.number().catch(N) → convierte string → number; si falla, usa N.

const str = (d = '') => z.string().default(d);
const num = (d: number) => z.coerce.number().catch(d);

function tipoDoc() {
  return z.enum(['CI', 'CIE'] as const).catch('CI' as const);
}
function tipoDocOpt() {
  return z.enum(['CI', 'CIE'] as const).optional();
}

const rawSchema = z.object({
  // ─── QA Webhook ─────────────────────────────────────────────────────────
  WEBHOOK_PORT:       num(4000),
  QA_WEBHOOK_ENABLED: str('true'),

  // ─── Operador QA base ────────────────────────────────────────────────────
  QA_OPERADOR_TIPO_DOC:   tipoDoc(),
  QA_OPERADOR_NUMERO_DOC: str(),
  QA_OPERADOR_FECHA_NAC:  str(),

  // ─── Aprobador ───────────────────────────────────────────────────────────
  APROBADOR_URL: str(),
  TOKEN_CLIENTE:  str(),
  HASH_MODE: z.enum(['BUFFER', 'BASE64'] as const).catch('BUFFER' as const),
  APRO_CALLBACK_PATH:       str('/webhook/aprobador'),
  APRO_CALLBACK_TIMEOUT_MS: num(55_000),

  // ─── Notificador — callbacks webhook ─────────────────────────────────────
  NOTI_CALLBACK_PATH:       str('/webhook/notificador'),
  NOTI_CALLBACK_TIMEOUT_MS: num(55_000),

  NOTI_OBL_LEGAL_CALLBACK_PATH:       str('/webhook/notificador-obligatorio'),
  NOTI_OBL_LEGAL_CALLBACK_TIMEOUT_MS: num(55_000),

  NOTI_OBL_REQ_CALLBACK_PATH:       str('/webhook/notificador-requerimiento'),
  NOTI_OBL_REQ_CALLBACK_TIMEOUT_MS: num(55_000),

  NOTI_WEBHOOK_WATCH_PATHS:           str(),
  NOTI_OBL_LEGAL_WEBHOOK_WATCH_PATHS: str(),
  NOTI_OBL_REQ_WEBHOOK_WATCH_PATHS:   str(),

  // ─── Notificador — conexión ───────────────────────────────────────────────
  ISSUER_NOTIFICADOR:  str(),
  TOKEN_CONFIGURACION: str(),
  RSA_PUBLIC_KEY_PATH: str('./keys/public.pem'),
  RSA_PADDING: z.enum(['PKCS1', 'OAEP'] as const).catch('PKCS1' as const),

  // ─── Notificador — contenido de la notificación ───────────────────────────
  NOTI_TITULO:      str(),
  NOTI_DESCRIPCION: str(),

  NOTI_NOTIFICADOR_TIPO_DOC:    tipoDocOpt(),
  NOTI_NOTIFICADOR_NUMERO_DOC:  str().optional(),
  NOTI_NOTIFICADOR_FECHA_NAC:   str().optional(),

  NOTI_AUTORIDAD_TIPO_DOC:   tipoDocOpt(),
  NOTI_AUTORIDAD_NUMERO_DOC: str().optional(),
  NOTI_AUTORIDAD_FECHA_NAC:  str().optional(),

  NOTI_NOTIFICADO_TIPO_DOC:    tipoDoc(),
  NOTI_NOTIFICADO_NUMERO_DOC:  str(),
  NOTI_NOTIFICADO_FECHA_NAC:   str(),

  NOTI_NOTIFICADO_CIE_NUMERO_DOC: str(),
  NOTI_NOTIFICADO_CIE_FECHA_NAC:  str(),

  NOTI_ENLACE_URL:      str(),
  NOTI_ENLACE_ETIQUETA: str(),
  NOTI_ENLACE_TIPO: z.enum(['FIRMA', 'APROBACION'] as const).catch('APROBACION' as const),
  NOTI_ENLACE_HASH: str(),

  NOTI_ENLACE_FIRMA_URL:      str(),
  NOTI_ENLACE_FIRMA_ETIQUETA: str(),
  NOTI_ENLACE_FIRMA_HASH:     str(),

  NOTI_FORMULARIO_URL:      str(),
  NOTI_FORMULARIO_ETIQUETA: str(),
  NOTI_FORMULARIO_TIPO: z.enum(['FIRMA', 'APROBACION'] as const).catch('FIRMA' as const),
  NOTI_FORMULARIO_HASH: str(),

  NOTI_ENTIDAD_NOTIFICADORA: str(),

  // ─── Delegado de Entidad Pública ─────────────────────────────────────────
  NOTI_DELEGADO_CODIGO_ENTIDAD: str(),
  NOTI_DELEGADO_DESCRIPCION:    str(),

  NOTI_DELEGADO_REPRESENTANTE_TIPO_DOC:    tipoDocOpt(),
  NOTI_DELEGADO_REPRESENTANTE_NUMERO_DOC:  str().optional(),
  NOTI_DELEGADO_REPRESENTANTE_FECHA_NAC:   str().optional(),

  // ─── QR-Seguro ───────────────────────────────────────────────────────────
  QR_SEGURO_URL_BASE: str(),
  QR_SEGURO_TOKEN:    str(),

  QR_SEGURO_CODIGO_DOCUMENTO:      str(),
  QR_SEGURO_NOMBRE_DOCUMENTO:      str(),
  QR_SEGURO_DESCRIPCION_DOCUMENTO: str(),
  QR_SEGURO_TITULAR_NOMBRE:        str(),
  QR_SEGURO_TITULAR_TIPO_DOC:      tipoDocOpt(),
  QR_SEGURO_TITULAR_NUMERO_DOC:    str().optional(),
  QR_SEGURO_TITULAR_ROL:           str(),

  // ─── Avisos ───────────────────────────────────────────────────────────────
  AVISOS_URL_BASE:         str(),
  AVISOS_TOKEN:            str(),
  AVISOS_CODIGO_PLANTILLA: str(),
  AVISOS_UUID_CIUDADANO:   str(),
  AVISOS_UUID_CIUDADANO_2: str(),
  AVISOS_PARAMETRO_1:           str(),
  AVISOS_PARAMETRO_REDIRECCION: str(),

  // ─── Notificador — Obligatorio Legal / Requerimiento ─────────────────────
  ISSUER_NOTIFICADOR_OBL_LEGAL:  str(),
  TOKEN_CONFIGURACION_OBL_LEGAL: str(),

  ISSUER_NOTIFICADOR_OBL_REQ:  str(),
  TOKEN_CONFIGURACION_OBL_REQ: str(),

  // ─── Notificador Jurídico ─────────────────────────────────────────────────
  NOTI_JURIDICO_CODIGO_ENTIDAD:   str(),
  NOTI_JURIDICO_CODIGO_ENTIDAD_2: str(),

  // ─── Documentos Digitales ────────────────────────────────────────────────
  DOC_DIGITAL_URL_BASE:         str(),
  DOC_DIGITAL_TOKEN:            str(),
  DOC_DIGITAL_CODIGO_DOCUMENTO: str(),

  // ─── Proveedor OIDC ───────────────────────────────────────────────────────
  OIDC_ISSUER:        str(),
  OIDC_CLIENT_ID:     str(),
  OIDC_CLIENT_SECRET: str(),
  OIDC_REDIRECT_URI:  str(),
  OIDC_TOKEN_PATH:    str('/token'),
  OIDC_CLIENT_AUTH_METHOD: z.enum(['post', 'basic', 'mobile'] as const).catch('post' as const),
  OIDC_SCOPE: str('openid profile'),

  OIDC_MOBILE_CLIENT_ID:    str(),
  OIDC_MOBILE_REDIRECT_URI: str(),
  OIDC_MOBILE_SCOPE:        str().optional(),
});

// ─── Parseo + post-proceso ────────────────────────────────────────────────────

const _raw = rawSchema.parse(process.env);

// Fallback: cuando la persona específica no está configurada, se usa el operador QA.
const _op = {
  tipoDoc:    _raw.QA_OPERADOR_TIPO_DOC,
  numeroDoc:  _raw.QA_OPERADOR_NUMERO_DOC,
  fechaNac:   _raw.QA_OPERADOR_FECHA_NAC,
};

export const qaEnv = {
  // ─── QA Webhook ─────────────────────────────────────────────────────────
  QA_WEBHOOK_PORT:    _raw.WEBHOOK_PORT,
  QA_WEBHOOK_ENABLED: _raw.QA_WEBHOOK_ENABLED !== 'false',

  // ─── Aprobador ───────────────────────────────────────────────────────────
  APROBADOR_URL: _raw.APROBADOR_URL,
  TOKEN_CLIENTE:  _raw.TOKEN_CLIENTE,
  HASH_MODE:      _raw.HASH_MODE,

  APRO_CALLBACK_PATH:       _raw.APRO_CALLBACK_PATH,
  APRO_CALLBACK_TIMEOUT_MS: _raw.APRO_CALLBACK_TIMEOUT_MS,

  // ─── Notificador — callbacks webhook ─────────────────────────────────────
  NOTI_CALLBACK_PATH:       _raw.NOTI_CALLBACK_PATH,
  NOTI_CALLBACK_TIMEOUT_MS: _raw.NOTI_CALLBACK_TIMEOUT_MS,

  NOTI_OBL_LEGAL_CALLBACK_PATH:       _raw.NOTI_OBL_LEGAL_CALLBACK_PATH,
  NOTI_OBL_LEGAL_CALLBACK_TIMEOUT_MS: _raw.NOTI_OBL_LEGAL_CALLBACK_TIMEOUT_MS,

  NOTI_OBL_REQ_CALLBACK_PATH:       _raw.NOTI_OBL_REQ_CALLBACK_PATH,
  NOTI_OBL_REQ_CALLBACK_TIMEOUT_MS: _raw.NOTI_OBL_REQ_CALLBACK_TIMEOUT_MS,

  NOTI_WEBHOOK_WATCH_PATHS:           _raw.NOTI_WEBHOOK_WATCH_PATHS,
  NOTI_OBL_LEGAL_WEBHOOK_WATCH_PATHS: _raw.NOTI_OBL_LEGAL_WEBHOOK_WATCH_PATHS,
  NOTI_OBL_REQ_WEBHOOK_WATCH_PATHS:   _raw.NOTI_OBL_REQ_WEBHOOK_WATCH_PATHS,

  // ─── Notificador — conexión ───────────────────────────────────────────────
  ISSUER_NOTIFICADOR:  _raw.ISSUER_NOTIFICADOR,
  TOKEN_CONFIGURACION: _raw.TOKEN_CONFIGURACION,
  RSA_PUBLIC_KEY_PATH: _raw.RSA_PUBLIC_KEY_PATH,
  RSA_PADDING:         _raw.RSA_PADDING,

  // ─── Notificador — contenido ──────────────────────────────────────────────
  NOTI_TITULO:      _raw.NOTI_TITULO,
  NOTI_DESCRIPCION: _raw.NOTI_DESCRIPCION,

  NOTI_NOTIFICADOR_TIPO_DOC:   _raw.NOTI_NOTIFICADOR_TIPO_DOC   ?? _op.tipoDoc,
  NOTI_NOTIFICADOR_NUMERO_DOC: _raw.NOTI_NOTIFICADOR_NUMERO_DOC ?? _op.numeroDoc,
  NOTI_NOTIFICADOR_FECHA_NAC:  _raw.NOTI_NOTIFICADOR_FECHA_NAC  ?? _op.fechaNac,

  NOTI_AUTORIDAD_TIPO_DOC:   _raw.NOTI_AUTORIDAD_TIPO_DOC   ?? _op.tipoDoc,
  NOTI_AUTORIDAD_NUMERO_DOC: _raw.NOTI_AUTORIDAD_NUMERO_DOC ?? _op.numeroDoc,
  NOTI_AUTORIDAD_FECHA_NAC:  _raw.NOTI_AUTORIDAD_FECHA_NAC  ?? _op.fechaNac,

  NOTI_NOTIFICADO_TIPO_DOC:   _raw.NOTI_NOTIFICADO_TIPO_DOC,
  NOTI_NOTIFICADO_NUMERO_DOC: _raw.NOTI_NOTIFICADO_NUMERO_DOC,
  NOTI_NOTIFICADO_FECHA_NAC:  _raw.NOTI_NOTIFICADO_FECHA_NAC,

  NOTI_NOTIFICADO_CIE_NUMERO_DOC: _raw.NOTI_NOTIFICADO_CIE_NUMERO_DOC,
  NOTI_NOTIFICADO_CIE_FECHA_NAC:  _raw.NOTI_NOTIFICADO_CIE_FECHA_NAC,

  NOTI_ENLACE_URL:      _raw.NOTI_ENLACE_URL,
  NOTI_ENLACE_ETIQUETA: _raw.NOTI_ENLACE_ETIQUETA,
  NOTI_ENLACE_TIPO:     _raw.NOTI_ENLACE_TIPO,
  NOTI_ENLACE_HASH:     _raw.NOTI_ENLACE_HASH,

  NOTI_ENLACE_FIRMA_URL:      _raw.NOTI_ENLACE_FIRMA_URL,
  NOTI_ENLACE_FIRMA_ETIQUETA: _raw.NOTI_ENLACE_FIRMA_ETIQUETA,
  NOTI_ENLACE_FIRMA_HASH:     _raw.NOTI_ENLACE_FIRMA_HASH,

  NOTI_FORMULARIO_URL:      _raw.NOTI_FORMULARIO_URL,
  NOTI_FORMULARIO_ETIQUETA: _raw.NOTI_FORMULARIO_ETIQUETA,
  NOTI_FORMULARIO_TIPO:     _raw.NOTI_FORMULARIO_TIPO,
  NOTI_FORMULARIO_HASH:     _raw.NOTI_FORMULARIO_HASH,

  NOTI_ENTIDAD_NOTIFICADORA: _raw.NOTI_ENTIDAD_NOTIFICADORA,

  // ─── Delegado de Entidad Pública ─────────────────────────────────────────
  NOTI_DELEGADO_CODIGO_ENTIDAD: _raw.NOTI_DELEGADO_CODIGO_ENTIDAD,
  NOTI_DELEGADO_DESCRIPCION:    _raw.NOTI_DELEGADO_DESCRIPCION,

  NOTI_DELEGADO_REPRESENTANTE_TIPO_DOC:   _raw.NOTI_DELEGADO_REPRESENTANTE_TIPO_DOC   ?? _op.tipoDoc,
  NOTI_DELEGADO_REPRESENTANTE_NUMERO_DOC: _raw.NOTI_DELEGADO_REPRESENTANTE_NUMERO_DOC ?? _op.numeroDoc,
  NOTI_DELEGADO_REPRESENTANTE_FECHA_NAC:  _raw.NOTI_DELEGADO_REPRESENTANTE_FECHA_NAC  ?? _op.fechaNac,

  // ─── QR-Seguro ───────────────────────────────────────────────────────────
  QR_SEGURO_URL_BASE: _raw.QR_SEGURO_URL_BASE,
  QR_SEGURO_TOKEN:    _raw.QR_SEGURO_TOKEN,

  QR_SEGURO_CODIGO_DOCUMENTO:      _raw.QR_SEGURO_CODIGO_DOCUMENTO,
  QR_SEGURO_NOMBRE_DOCUMENTO:      _raw.QR_SEGURO_NOMBRE_DOCUMENTO,
  QR_SEGURO_DESCRIPCION_DOCUMENTO: _raw.QR_SEGURO_DESCRIPCION_DOCUMENTO,
  QR_SEGURO_TITULAR_NOMBRE:        _raw.QR_SEGURO_TITULAR_NOMBRE,
  QR_SEGURO_TITULAR_TIPO_DOC:      _raw.QR_SEGURO_TITULAR_TIPO_DOC   ?? _op.tipoDoc,
  QR_SEGURO_TITULAR_NUMERO_DOC:    _raw.QR_SEGURO_TITULAR_NUMERO_DOC ?? _op.numeroDoc,
  QR_SEGURO_TITULAR_ROL:           _raw.QR_SEGURO_TITULAR_ROL,

  // ─── Avisos ───────────────────────────────────────────────────────────────
  AVISOS_URL_BASE:         _raw.AVISOS_URL_BASE,
  AVISOS_TOKEN:            _raw.AVISOS_TOKEN,
  AVISOS_CODIGO_PLANTILLA: _raw.AVISOS_CODIGO_PLANTILLA,
  AVISOS_UUID_CIUDADANO:   _raw.AVISOS_UUID_CIUDADANO,
  AVISOS_UUID_CIUDADANO_2: _raw.AVISOS_UUID_CIUDADANO_2,
  AVISOS_PARAMETRO_1:           _raw.AVISOS_PARAMETRO_1,
  AVISOS_PARAMETRO_REDIRECCION: _raw.AVISOS_PARAMETRO_REDIRECCION,

  // ─── Notificador — Obligatorio Legal / Requerimiento ─────────────────────
  ISSUER_NOTIFICADOR_OBL_LEGAL:  _raw.ISSUER_NOTIFICADOR_OBL_LEGAL,
  TOKEN_CONFIGURACION_OBL_LEGAL: _raw.TOKEN_CONFIGURACION_OBL_LEGAL,

  ISSUER_NOTIFICADOR_OBL_REQ:  _raw.ISSUER_NOTIFICADOR_OBL_REQ,
  TOKEN_CONFIGURACION_OBL_REQ: _raw.TOKEN_CONFIGURACION_OBL_REQ,

  // ─── Notificador Jurídico ─────────────────────────────────────────────────
  NOTI_JURIDICO_CODIGO_ENTIDAD:   _raw.NOTI_JURIDICO_CODIGO_ENTIDAD,
  NOTI_JURIDICO_CODIGO_ENTIDAD_2: _raw.NOTI_JURIDICO_CODIGO_ENTIDAD_2,

  // ─── Documentos Digitales ────────────────────────────────────────────────
  DOC_DIGITAL_URL_BASE:         _raw.DOC_DIGITAL_URL_BASE,
  DOC_DIGITAL_TOKEN:            _raw.DOC_DIGITAL_TOKEN,
  DOC_DIGITAL_CODIGO_DOCUMENTO: _raw.DOC_DIGITAL_CODIGO_DOCUMENTO,

  // ─── Proveedor OIDC ───────────────────────────────────────────────────────
  OIDC_ISSUER:             _raw.OIDC_ISSUER,
  OIDC_CLIENT_ID:          _raw.OIDC_CLIENT_ID,
  OIDC_CLIENT_SECRET:      _raw.OIDC_CLIENT_SECRET,
  OIDC_REDIRECT_URI:       _raw.OIDC_REDIRECT_URI,
  OIDC_TOKEN_PATH:         _raw.OIDC_TOKEN_PATH,
  OIDC_CLIENT_AUTH_METHOD: _raw.OIDC_CLIENT_AUTH_METHOD,
  OIDC_SCOPE:              _raw.OIDC_SCOPE,

  OIDC_MOBILE_CLIENT_ID:    _raw.OIDC_MOBILE_CLIENT_ID,
  OIDC_MOBILE_REDIRECT_URI: _raw.OIDC_MOBILE_REDIRECT_URI,
  OIDC_MOBILE_SCOPE:        _raw.OIDC_MOBILE_SCOPE ?? _raw.OIDC_SCOPE,
};
