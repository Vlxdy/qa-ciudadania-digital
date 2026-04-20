import { qaEnv } from '../../../config/qa-env';

export interface MobileSessionStore {
  config: {
    issuer: string;
    clientId: string;
    redirectUri: string;
    scope: string;
    authPath: string;
    tokenPath: string;
    timeoutMs: number;
    prompt?: string;
    session: string;
    property: string;
    defaultStrategy: string;
  };
  runtime: {
    codeVerifier?: string;
    lastCallbackParams?: Record<string, string>;
    authorizationUrl?: string;
    lastTokenResponse?: Record<string, unknown>;
    accessToken?: string;
  };
}

const mobileStore: MobileSessionStore = {
  config: {
    issuer: qaEnv.OIDC_ISSUER,
    clientId: qaEnv.OIDC_MOBILE_CLIENT_ID,
    redirectUri: qaEnv.OIDC_MOBILE_REDIRECT_URI,
    scope: qaEnv.OIDC_MOBILE_SCOPE,
    authPath: process.env.OIDC_AUTH_PATH ?? '/auth',
    tokenPath: qaEnv.OIDC_TOKEN_PATH,
    timeoutMs: Number(process.env.OIDC_TIMEOUT_MS ?? 180000),
    prompt: process.env.OIDC_PROMPT,
    session: process.env.OIDC_SESSION ?? 'true',
    property: process.env.OIDC_PROPERTY ?? 'user',
    defaultStrategy: process.env.OIDC_DEFAULT_STRATEGY ?? 'oidc',
  },
  runtime: {},
};

export function getMobileSessionStore(): MobileSessionStore {
  return mobileStore;
}

export function setMobileCodeVerifier(verifier: string): void {
  mobileStore.runtime.codeVerifier = verifier;
}

export function setMobileAccessToken(token: string): void {
  mobileStore.runtime.accessToken = token;
}

export interface MobileLoginSessionSnapshot {
  authorizationUrl?: string;
  callbackParams?: Record<string, string>;
  codeVerifier?: string;
  tokenResponse?: Record<string, unknown>;
  accessToken?: string;
}

export function getMobileLoginSessionSnapshot(): MobileLoginSessionSnapshot | undefined {
  const { runtime } = mobileStore;
  if (!runtime.accessToken && !runtime.lastTokenResponse) return undefined;
  return {
    authorizationUrl: runtime.authorizationUrl,
    callbackParams: runtime.lastCallbackParams,
    codeVerifier: runtime.codeVerifier,
    tokenResponse: runtime.lastTokenResponse,
    accessToken: runtime.accessToken,
  };
}
