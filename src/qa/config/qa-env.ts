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

  // ─── Notificador ──────────────────────────────────────────────────────────
  ISSUER_NOTIFICADOR: process.env.ISSUER_NOTIFICADOR ?? '',
  TOKEN_CONFIGURACION: process.env.TOKEN_CONFIGURACION ?? '',
  RSA_PUBLIC_KEY_PATH: process.env.RSA_PUBLIC_KEY_PATH ?? './keys/public.pem',
  RSA_PADDING: (process.env.RSA_PADDING ?? 'PKCS1') as 'PKCS1' | 'OAEP',

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
