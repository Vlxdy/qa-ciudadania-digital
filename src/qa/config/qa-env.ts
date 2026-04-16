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
  NOTI_NOTIFICADOR_NUMERO_DOC: process.env.NOTI_NOTIFICADOR_NUMERO_DOC ?? '4160481',
  NOTI_NOTIFICADOR_FECHA_NAC: process.env.NOTI_NOTIFICADOR_FECHA_NAC ?? '1960-05-26',

  // Ciudadano autoridad
  NOTI_AUTORIDAD_TIPO_DOC: (process.env.NOTI_AUTORIDAD_TIPO_DOC ?? 'CI') as 'CI' | 'CIE',
  NOTI_AUTORIDAD_NUMERO_DOC: process.env.NOTI_AUTORIDAD_NUMERO_DOC ?? '4160481',
  NOTI_AUTORIDAD_FECHA_NAC: process.env.NOTI_AUTORIDAD_FECHA_NAC ?? '1960-05-26',

  // Ciudadano notificado principal (CI)
  NOTI_NOTIFICADO_TIPO_DOC: (process.env.NOTI_NOTIFICADO_TIPO_DOC ?? 'CI') as 'CI' | 'CIE',
  NOTI_NOTIFICADO_NUMERO_DOC: process.env.NOTI_NOTIFICADO_NUMERO_DOC ?? '5585535',
  NOTI_NOTIFICADO_FECHA_NAC: process.env.NOTI_NOTIFICADO_FECHA_NAC ?? '1974-01-31',

  // Ciudadano notificado secundario (para escenario CIE)
  NOTI_NOTIFICADO_CIE_NUMERO_DOC: process.env.NOTI_NOTIFICADO_CIE_NUMERO_DOC ?? 'E-123456',
  NOTI_NOTIFICADO_CIE_FECHA_NAC: process.env.NOTI_NOTIFICADO_CIE_FECHA_NAC ?? '1985-03-15',

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
export function missingVars(module: 'aprobador' | 'notificador' | 'proveedor'): string[] {
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
  };
  return Object.entries(checks[module])
    .filter(([, v]) => !v)
    .map(([k]) => k);
}
