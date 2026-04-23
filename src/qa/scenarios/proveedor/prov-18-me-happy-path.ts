/**
 * prov-18 — GET /me happy path.
 * Con access_token válido debe retornar 200 con los claims del usuario.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaGet } from '../../http/qa-http';
import { meUrl } from './helpers';
import { ensureAccessToken } from './services/token-provider';

const META = {
  id: 'prov-18',
  name: 'GET /me — claims del usuario',
  module: 'proveedor' as const,
  tags: ['happy', 'me', 'auth', 'token'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ['sub', 'profile'],
};

export const scenario: Scenario = {
  ...META,
  description:
    'Con access_token válido debe retornar 200 con claims: sub, profile y demás scopes configurados.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const accessToken = await ensureAccessToken();
      const response = await qaGet(meUrl(), {
        Authorization: `Bearer ${accessToken}`,
      });
      return makeResult(META, { ...response, durationMs: Date.now() - start }, EXPECTED);
    } catch (err) {
      return makeResult(
        META,
        { localError: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start },
        EXPECTED,
      );
    }
  },
};
