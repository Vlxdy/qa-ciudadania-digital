/**
 * Helpers para escenarios del módulo proveedor.
 */
import { getProveedorSessionStore } from "./services/session.store";

export function tokenUrl(): string {
  const { config } = getProveedorSessionStore();
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
  authMethod?: "post" | "basic";
}): { payload: URLSearchParams; headers: Record<string, string> } {
  const { config } = getProveedorSessionStore();

  const authMethod = overrides.authMethod ?? config.authMethod;
  const clientId = overrides.clientId ?? config.clientId;
  const clientSecret = overrides.clientSecret ?? config.clientSecret;
  const redirectUri = overrides.redirectUri ?? config.redirectUri;
  const code = overrides.code;

  const payload = new URLSearchParams({
    grant_type: overrides.grantType ?? "authorization_code",
    ...(code ? { code: code } : {}),
    redirect_uri: redirectUri,
  });

  if (overrides.codeVerifier) {
    payload.set("code_verifier", overrides.codeVerifier);
  }

  const headers: Record<string, string> = {};

  if (authMethod === "basic") {
    const cred = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    headers["Authorization"] = `Basic ${cred}`;
  } else {
    payload.set("client_id", clientId);
    payload.set("client_secret", clientSecret ?? "");
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
