/**
 * Helpers para escenarios del módulo proveedor.
 */
import { getProveedorSessionStore } from "./services/session.store";
import { getMobileSessionStore } from "./services/mobile-session.store";

export function tokenUrl(): string {
  const { config } = getProveedorSessionStore();
  return `${config.issuer}${config.tokenPath}`;
}

export function mobileTokenUrl(): string {
  const { config } = getMobileSessionStore();
  return `${config.issuer}${config.tokenPath}`;
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
  authMethod?: "post" | "basic" | "mobile";
}): { payload: URLSearchParams; headers: Record<string, string> } {
  const { config } = getProveedorSessionStore();
  const mobileConfig = getMobileSessionStore().config;
  const mobileRuntime = getMobileSessionStore().runtime;

  const authMethod = overrides.authMethod ?? config.authMethod;

  const payload = new URLSearchParams({
    grant_type: overrides.grantType ?? "authorization_code",
    ...(overrides.code ? { code: overrides.code } : {}),
  });

  const headers: Record<string, string> = {};

  if (authMethod === "basic") {
    const clientId = overrides.clientId ?? config.clientId;
    const clientSecret = overrides.clientSecret ?? config.clientSecret;
    payload.set("redirect_uri", overrides.redirectUri ?? config.redirectUri);
    const cred = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    headers["Authorization"] = `Basic ${cred}`;
  } else if (authMethod === "mobile") {
    // Lee exclusivamente de la configuración móvil — sin mezclar con el store web
    const clientId = overrides.clientId ?? mobileConfig.clientId;
    const redirectUri = overrides.redirectUri ?? mobileConfig.redirectUri;
    payload.set("redirect_uri", redirectUri);
    payload.set("client_id", clientId);
    // PKCE: incluir code_verifier del store móvil; omitirlo deliberadamente si override es ''
    const verifier = "codeVerifier" in overrides
      ? overrides.codeVerifier
      : mobileRuntime.codeVerifier;
    if (verifier !== undefined && verifier !== "") {
      payload.set("code_verifier", verifier);
    }
  } else {
    // post (default)
    const clientId = overrides.clientId ?? config.clientId;
    const clientSecret = overrides.clientSecret ?? config.clientSecret;
    payload.set("redirect_uri", overrides.redirectUri ?? config.redirectUri);
    payload.set("client_id", clientId);
    payload.set("client_secret", clientSecret ?? "");
    if (overrides.codeVerifier) {
      payload.set("code_verifier", overrides.codeVerifier);
    }
  }

  return { payload, headers };
}

/**
 * Construye el payload para el flujo Client Credentials (B2B).
 * Reutiliza OIDC_CLIENT_ID y OIDC_CLIENT_SECRET del store existente.
 * No requiere redirect_uri ni authorization_code.
 *
 * @param authMethod 'post' — client_id+secret en el body (primera forma)
 *                   'basic' — Authorization: Basic header (segunda forma)
 */
export function buildB2bPayload(overrides: {
  clientId?: string;
  clientSecret?: string;
  grantType?: string;
  authMethod?: 'post' | 'basic';
}): { payload: URLSearchParams; headers: Record<string, string> } {
  const { config } = getProveedorSessionStore();
  const authMethod = overrides.authMethod ?? 'post';
  const clientId = overrides.clientId ?? config.clientId;
  const clientSecret = overrides.clientSecret ?? config.clientSecret;
  const grantType = overrides.grantType ?? 'client_credentials';

  const payload = new URLSearchParams({ grant_type: grantType });
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (authMethod === 'basic') {
    const cred = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${cred}`;
  } else {
    payload.set('client_id', clientId);
    payload.set('client_secret', clientSecret ?? '');
  }

  return { payload, headers };
}

/**
 * Simula la validación de state (lógica local del flujo OAuth).
 * Retorna el error si hay mismatch, null si coinciden.
 */
export function validateState(sent: string, received: string): string | null {
  if (received !== sent) return "State inválido. Posible CSRF.";
  return null;
}

/**
 * Simula la validación de nonce (lógica local del flujo OAuth).
 * Retorna el error si hay mismatch, null si coinciden o si el nonce no viene en el callback.
 */
export function validateNonce(
  sent: string,
  received: string | undefined,
): string | null {
  if (received && received !== sent) return "Nonce inválido.";
  return null;
}
