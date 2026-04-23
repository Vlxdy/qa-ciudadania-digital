/**
 * prov-23 — Introspección con token inválido.
 * Per RFC 7662, un token no reconocido devuelve 200 con active:false
 * (no 4xx) — el endpoint en sí fue alcanzado correctamente.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPostForm } from '../../http/qa-http';
import { buildIntrospectionPayload, introspectionUrl } from './helpers';

const META = {
  id: 'prov-23',
  name: 'Introspección — token inválido (active:false)',
  module: 'proveedor' as const,
  tags: ['negative', 'introspection', 'auth'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ['"active":false'],
};

export const scenario: Scenario = {
  ...META,
  description:
    'Token no emitido por el IDP debe retornar 200 con active:false (RFC 7662 §2.2).',
  run: async (): Promise<ScenarioResult> => {
    const { payload, headers } = buildIntrospectionPayload(
      'QA_TOKEN_INVALIDO_XXXXXXXXXXXXXXXXXXXXXXXX',
    );
    const response = await qaPostForm(introspectionUrl(), payload, headers);
    return makeResult(META, response, EXPECTED);
  },
};
