/**
 * Helpers para escenarios del módulo proveedor.
 * Se enfoca en el token endpoint (POST /token) ya que el flujo completo
 * requiere navegador y es catalogado como skip:true en escenarios automatizados.
 */
import { qaEnv } from '../../config/qa-env';

export function tokenUrl(): string {
  return `${qaEnv.OIDC_ISSUER}${qaEnv.OIDC_TOKEN_PATH}`;
}

/**
 * Construye el payload para el token endpoint.
 * Permite sobreescribir cualquier campo para simular escenarios negativos.
 */
export function buildTokenPayload(overrides: {
  code?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  grantType?: string;
  codeVerifier?: string;
  authMethod?: 'post' | 'basic';
}): { payload: URLSearchParams; headers: Record<string, string> } {
  const authMethod = overrides.authMethod ?? qaEnv.OIDC_CLIENT_AUTH_METHOD;
  const clientId = overrides.clientId ?? qaEnv.OIDC_CLIENT_ID;
  const clientSecret = overrides.clientSecret ?? qaEnv.OIDC_CLIENT_SECRET;
  const redirectUri = overrides.redirectUri ?? qaEnv.OIDC_REDIRECT_URI;
  const code = overrides.code ?? 'CODIGO_INVALIDO_QA_' + Date.now();

  const payload = new URLSearchParams({
    grant_type: overrides.grantType ?? 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  if (overrides.codeVerifier) {
    payload.set('code_verifier', overrides.codeVerifier);
  }

  const headers: Record<string, string> = {};

  if (authMethod === 'basic') {
    const cred = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${cred}`;
  } else {
    payload.set('client_id', clientId);
    payload.set('client_secret', clientSecret);
  }

  return { payload, headers };
}

/**
 * Simula la validación de state (lógica local de oauth-flow.ts).
 * Retorna el error si hay mismatch, null si coinciden.
 */
export function validateState(sent: string, received: string): string | null {
  if (received !== sent) return 'State inválido. Posible CSRF.';
  return null;
}

/**
 * Simula la validación de nonce (lógica local de oauth-flow.ts).
 * Retorna el error si hay mismatch, null si coinciden o si el nonce no viene en el callback.
 */
export function validateNonce(sent: string, received: string | undefined): string | null {
  if (received && received !== sent) return 'Nonce inválido.';
  return null;
}
