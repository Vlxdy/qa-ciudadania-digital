import { randomBytes, createHash } from 'crypto';

/** Genera un code_verifier PKCE: 43 chars, charset [A-Za-z0-9\-._~] */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url');
}

/** Genera el code_challenge: BASE64URL(SHA256(codeVerifier)) */
export function generateCodeChallenge(codeVerifier: string): string {
  return createHash('sha256').update(codeVerifier).digest('base64url');
}
