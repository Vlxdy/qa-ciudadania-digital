/**
 * Variables de entorno para QA.
 * A diferencia de src/config/env.ts, NO hace process.exit si faltan vars —
 * simplemente deja el campo vacío y el runner reporta qué escenarios no pueden correr.
 */
import dotenv from 'dotenv';
dotenv.config();

export const qaEnv = {
  // ─── Aprobador ────────────────────────────────────────────────────────────
  APROBADOR_URL: process.env.APROBADOR_URL ?? '',
  TOKEN_CLIENTE: process.env.TOKEN_CLIENTE ?? '',
  ACCESS_TOKEN_CIUDADANIA: process.env.ACCESS_TOKEN_CIUDADANIA ?? '',
  HASH_MODE: (process.env.HASH_MODE ?? 'BUFFER') as 'BUFFER' | 'BASE64',

  // ─── Notificador — conexión ───────────────────────────────────────────────
  ISSUER_NOTIFICADOR: process.env.ISSUER_NOTIFICADOR ?? '',
  TOKEN_CONFIGURACION: process.env.TOKEN_CONFIGURACION ?? '',
  RSA_PUBLIC_KEY_PATH: process.env.RSA_PUBLIC_KEY_PATH ?? './keys/public.pem',
  RSA_PADDING: (process.env.RSA_PADDING ?? 'PKCS1') as 'PKCS1' | 'OAEP',

  // ─── Notificador — datos de la notificación ───────────────────────────────
  // Contenido de la notificación
  NOTI_TITULO: process.env.NOTI_TITULO ?? 'Notificación de prueba QA',
  NOTI_DESCRIPCION: process.env.NOTI_DESCRIPCION ?? 'Se notifica al ciudadano sobre el proceso de prueba automatizada.',

  // Ciudadano notificador
  NOTI_NOTIFICADOR_TIPO_DOC: (process.env.NOTI_NOTIFICADOR_TIPO_DOC ?? 'CI') as 'CI' | 'CIE',
  NOTI_NOTIFICADOR_NUMERO_DOC: process.env.NOTI_NOTIFICADOR_NUMERO_DOC ?? 'NONE',
  NOTI_NOTIFICADOR_FECHA_NAC: process.env.NOTI_NOTIFICADOR_FECHA_NAC ?? 'NONE',

  // Ciudadano autoridad
  NOTI_AUTORIDAD_TIPO_DOC: (process.env.NOTI_AUTORIDAD_TIPO_DOC ?? 'CI') as 'CI' | 'CIE',
  NOTI_AUTORIDAD_NUMERO_DOC: process.env.NOTI_AUTORIDAD_NUMERO_DOC ?? 'NONE',
  NOTI_AUTORIDAD_FECHA_NAC: process.env.NOTI_AUTORIDAD_FECHA_NAC ?? 'NONE',

  // Ciudadano notificado principal (CI)
  NOTI_NOTIFICADO_TIPO_DOC: (process.env.NOTI_NOTIFICADO_TIPO_DOC ?? 'CI') as 'CI' | 'CIE',
  NOTI_NOTIFICADO_NUMERO_DOC: process.env.NOTI_NOTIFICADO_NUMERO_DOC ?? '5585535',
  NOTI_NOTIFICADO_FECHA_NAC: process.env.NOTI_NOTIFICADO_FECHA_NAC ?? '1974-01-31',

  // Ciudadano notificado secundario (para escenario CIE)
  NOTI_NOTIFICADO_CIE_NUMERO_DOC: process.env.NOTI_NOTIFICADO_CIE_NUMERO_DOC ?? 'NONE',
  NOTI_NOTIFICADO_CIE_FECHA_NAC: process.env.NOTI_NOTIFICADO_CIE_FECHA_NAC ?? 'NONE',

  // Enlace adjunto principal (tipo APROBACION)
  NOTI_ENLACE_URL: process.env.NOTI_ENLACE_URL ?? 'https://example.com/qa/documento.pdf',
  NOTI_ENLACE_ETIQUETA: process.env.NOTI_ENLACE_ETIQUETA ?? 'Documento QA',
  NOTI_ENLACE_TIPO: (process.env.NOTI_ENLACE_TIPO ?? 'APROBACION') as 'FIRMA' | 'APROBACION',
  // Si está vacío, helpers.ts computará el hash descargando el archivo (o usará placeholder)
  NOTI_ENLACE_HASH: process.env.NOTI_ENLACE_HASH ?? '',

  // Enlace para archivo firmado digitalmente (tipo FIRMA) — usado en noti-19 y similares
  NOTI_ENLACE_FIRMA_URL: process.env.NOTI_ENLACE_FIRMA_URL ?? 'https://example.com/qa/firmado.pdf',
  NOTI_ENLACE_FIRMA_ETIQUETA: process.env.NOTI_ENLACE_FIRMA_ETIQUETA ?? 'Documento Firmado QA',
  NOTI_ENLACE_FIRMA_HASH: process.env.NOTI_ENLACE_FIRMA_HASH ?? '',

  // Formulario de notificación
  NOTI_FORMULARIO_URL: process.env.NOTI_FORMULARIO_URL ?? 'https://example.com/qa/formulario.pdf',
  NOTI_FORMULARIO_ETIQUETA: process.env.NOTI_FORMULARIO_ETIQUETA ?? 'Formulario QA',
  NOTI_FORMULARIO_TIPO: (process.env.NOTI_FORMULARIO_TIPO ?? 'FIRMA') as 'FIRMA' | 'APROBACION',
  NOTI_FORMULARIO_HASH: process.env.NOTI_FORMULARIO_HASH ?? '',

  // Entidad notificadora (opcional — omitir para usar la entidad origen)
  NOTI_ENTIDAD_NOTIFICADORA: process.env.NOTI_ENTIDAD_NOTIFICADORA ?? '',

  // ─── Delegado de Entidad Pública ─────────────────────────────────────────
  // Código gob.bo de la entidad para la cual se solicita el delegado
  NOTI_DELEGADO_CODIGO_ENTIDAD: process.env.NOTI_DELEGADO_CODIGO_ENTIDAD ?? '97',

  // Descripción de la solicitud de delegado
  NOTI_DELEGADO_DESCRIPCION: process.env.NOTI_DELEGADO_DESCRIPCION ?? 'Solicitud de delegación de buzón de entidad para pruebas QA.',

  // Representante legal que recibirá la autorización de delegación
  NOTI_DELEGADO_REPRESENTANTE_TIPO_DOC: (process.env.NOTI_DELEGADO_REPRESENTANTE_TIPO_DOC ?? 'CI') as 'CI' | 'CIE',
  NOTI_DELEGADO_REPRESENTANTE_NUMERO_DOC: process.env.NOTI_DELEGADO_REPRESENTANTE_NUMERO_DOC ?? 'NONE',
  NOTI_DELEGADO_REPRESENTANTE_FECHA_NAC: process.env.NOTI_DELEGADO_REPRESENTANTE_FECHA_NAC ?? 'NONE',

  // ─── Avisos ───────────────────────────────────────────────────────────────
  // URL base del servicio de avisos (generada en módulo Developer al crear plantilla)
  AVISOS_URL_BASE: process.env.AVISOS_URL_BASE ?? '',

  // Token Bearer generado en módulo Developer al crear la plantilla de aviso
  AVISOS_TOKEN: process.env.AVISOS_TOKEN ?? '',

  // Código UUID de la plantilla de aviso creada en Developer
  AVISOS_CODIGO_PLANTILLA: process.env.AVISOS_CODIGO_PLANTILLA ?? '',

  // UUID del ciudadano digital de prueba (receptor principal del aviso)
  AVISOS_UUID_CIUDADANO: process.env.AVISOS_UUID_CIUDADANO ?? '',

  // UUID de un segundo ciudadano (para escenarios de envío múltiple)
  AVISOS_UUID_CIUDADANO_2: process.env.AVISOS_UUID_CIUDADANO_2 ?? '',

  // Parámetro dinámico 1 de la plantilla (se reemplaza en {{1}})
  AVISOS_PARAMETRO_1: process.env.AVISOS_PARAMETRO_1 ?? 'Ciudadano QA',

  // Fragmento adicional para URL de redirección (parametroRedireccion)
  AVISOS_PARAMETRO_REDIRECCION: process.env.AVISOS_PARAMETRO_REDIRECCION ?? 'tramite/qa-test',

  // ─── Notificador Jurídico (entidad pública) ───────────────────────────────
  // Código gob.bo de la entidad principal que recibirá la notificación jurídica
  NOTI_JURIDICO_CODIGO_ENTIDAD: process.env.NOTI_JURIDICO_CODIGO_ENTIDAD ?? '340',

  // Código gob.bo de una segunda entidad (para escenarios de múltiples notificados)
  NOTI_JURIDICO_CODIGO_ENTIDAD_2: process.env.NOTI_JURIDICO_CODIGO_ENTIDAD_2 ?? '341',


  // ─── Proveedor ────────────────────────────────────────────────────────────
  OIDC_ISSUER: process.env.OIDC_ISSUER ?? '',
  OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID ?? '',
  OIDC_CLIENT_SECRET: process.env.OIDC_CLIENT_SECRET ?? '',
  OIDC_REDIRECT_URI: process.env.OIDC_REDIRECT_URI ?? '',
  OIDC_TOKEN_PATH: process.env.OIDC_TOKEN_PATH ?? '/token',
  OIDC_CLIENT_AUTH_METHOD: (process.env.OIDC_CLIENT_AUTH_METHOD ?? 'post') as
    | 'post'
    | 'basic'
    | 'mobile',
  OIDC_SCOPE: process.env.OIDC_SCOPE ?? 'openid profile',
} as const;

/** Retorna los nombres de las vars vacías para un módulo dado */
export function missingVars(module: 'aprobador' | 'notificador' | 'proveedor' | 'avisos'): string[] {
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
      OIDC_ISSUER: qaEnv.OIDC_ISSUER,
      OIDC_CLIENT_ID: qaEnv.OIDC_CLIENT_ID,
      OIDC_REDIRECT_URI: qaEnv.OIDC_REDIRECT_URI,
    },
    avisos: {
      AVISOS_URL_BASE: qaEnv.AVISOS_URL_BASE,
      AVISOS_TOKEN: qaEnv.AVISOS_TOKEN,
      AVISOS_CODIGO_PLANTILLA: qaEnv.AVISOS_CODIGO_PLANTILLA,
      AVISOS_UUID_CIUDADANO: qaEnv.AVISOS_UUID_CIUDADANO,
    },
  };
  return Object.entries(checks[module])
    .filter(([, v]) => !v)
    .map(([k]) => k);
}
