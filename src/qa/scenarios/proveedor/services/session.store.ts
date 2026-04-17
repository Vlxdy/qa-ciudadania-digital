import { qaEnv } from "../../../config/qa-env";

export type ProveedorAuthMethod = "post" | "basic" | "mobile";

export interface ProveedorSessionStore {
  config: {
    issuer: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string;
    authPath: string;
    tokenPath: string;
    timeoutMs: number;
    authMethod: ProveedorAuthMethod;
    prompt?: string;
    session: string;
    property: string;
    defaultStrategy: string;
  };
  credentials: {
    cedulaIdentidad?: string;
    contrasena?: string;
    totpCode?: string;
  };
  runtime: {
    lastAuthorizationCode?: string;
    lastCallbackParams?: Record<string, string>;
    startedAt?: string;
    accessToken?: string;
    lastTokenResponse?: Record<string, unknown>;
  };
}

const store: ProveedorSessionStore = {
  config: {
    issuer: qaEnv.OIDC_ISSUER,
    clientId: qaEnv.OIDC_CLIENT_ID,
    clientSecret: qaEnv.OIDC_CLIENT_SECRET,
    redirectUri: qaEnv.OIDC_REDIRECT_URI,
    scope: qaEnv.OIDC_SCOPE,
    authPath: process.env.OIDC_AUTH_PATH ?? "/auth",
    tokenPath: qaEnv.OIDC_TOKEN_PATH,
    timeoutMs: Number(process.env.OIDC_TIMEOUT_MS ?? 180000),
    authMethod: qaEnv.OIDC_CLIENT_AUTH_METHOD,
    prompt: process.env.OIDC_PROMPT,
    session: process.env.OIDC_SESSION ?? "true",
    property: process.env.OIDC_PROPERTY ?? "user",
    defaultStrategy: process.env.OIDC_DEFAULT_STRATEGY ?? "oidc",
  },
  credentials: {
    cedulaIdentidad: process.env.CEDULA_IDENTIDAD,
    contrasena: process.env.CONTRASENA,
    totpCode: process.env.OIDC_TOTP_CODE,
  },
  runtime: {},
};

export function getProveedorSessionStore(): ProveedorSessionStore {
  return store;
}

export function setLastAuthorizationCode(
  code: string,
  callbackParams: Record<string, string>,
): void {
  store.runtime.lastAuthorizationCode = code;
  store.runtime.lastCallbackParams = callbackParams;
}

export function setAccessToken(token: string): void {
  store.runtime.accessToken = token;
}
