/**
 * prov-21 — Introspección happy path con Basic auth.
 * POST /token/introspection con Authorization: Basic y token válido.
 * Respuesta esperada: active:true con los campos del token.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPostForm } from '../../http/qa-http';
import { buildIntrospectionPayload, introspectionUrl } from './helpers';
import { ensureAccessToken } from './services/token-provider';

const META = {
  id: 'prov-21',
  name: 'Introspección — Basic auth, token activo',
  module: 'proveedor' as const,
  tags: ['happy', 'introspection', 'auth', 'token'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ['"active":true', 'sub', 'client_id', 'token_type'],
};

export const scenario: Scenario = {
  ...META,
  description:
    'POST /token/introspection con Basic auth y token válido debe retornar 200 con active:true y los claims del token.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const accessToken = await ensureAccessToken();
      const { payload, headers } = buildIntrospectionPayload(accessToken, { authMethod: 'basic' });
      const response = await qaPostForm(introspectionUrl(), payload, headers);
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
