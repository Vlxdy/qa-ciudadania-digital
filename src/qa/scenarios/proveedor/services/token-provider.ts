/**
 * Proveedor de access token para escenarios QA.
 *
 * ensureAccessToken() devuelve el token almacenado en el session store.
 * Si el store está vacío ejecuta automáticamente el flujo OAuth completo
 * (login en navegador + intercambio de código por token).
 */
import { getProveedorSessionStore, setAccessToken } from './session.store';
import { getMobileSessionStore, setMobileAccessToken } from './mobile-session.store';
import { runQaProveedorLogin, runQaMobileLogin } from './oauth-browser-flow';
import { buildTokenPayload, tokenUrl, mobileTokenUrl } from '../helpers';
import { qaPostForm } from '../../../http/qa-http';

export async function ensureMobileAccessToken(): Promise<string> {
  const stored = getMobileSessionStore().runtime.accessToken;
  if (stored) return stored;

  const { callbackParams } = await runQaMobileLogin();
  const { payload, headers } = buildTokenPayload({ code: callbackParams.code, authMethod: 'mobile' });
  const response = await qaPostForm(mobileTokenUrl(), payload, headers);

  const token = (response.body as Record<string, unknown>)?.access_token;
  if (typeof token !== 'string' || !token) {
    throw new Error('No se pudo obtener access_token en el flujo automático de autenticación móvil.');
  }

  setMobileAccessToken(token);

  const store = getMobileSessionStore();
  store.runtime.lastTokenResponse = response.body as Record<string, unknown>;

  return token;
}

export async function ensureAccessToken(): Promise<string> {
  const stored = getProveedorSessionStore().runtime.accessToken;
  if (stored) return stored;

  // 1. Flujo browser: obtener authorization code
  const { callbackParams } = await runQaProveedorLogin();
  const code = callbackParams.code;

  // 2. Intercambio de código por token
  const { payload, headers } = buildTokenPayload({ code });
  const response = await qaPostForm(tokenUrl(), payload, headers);

  const token = (response.body as Record<string, unknown>)?.access_token;
  if (typeof token !== 'string' || !token) {
    throw new Error('No se pudo obtener access_token en el flujo automático de autenticación.');
  }

  setAccessToken(token);

  const store = getProveedorSessionStore();
  store.runtime.lastTokenResponse = response.body as Record<string, unknown>;

  return token;
}
