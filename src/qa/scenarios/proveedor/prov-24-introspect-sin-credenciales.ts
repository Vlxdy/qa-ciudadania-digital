/**
 * prov-24 — Introspección sin credenciales de cliente.
 * Llamar /token/introspection sin identificar al cliente debe retornar 401.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPostForm } from '../../http/qa-http';
import { introspectionUrl } from './helpers';

const META = {
  id: 'prov-24',
  name: 'Introspección — sin credenciales de cliente',
  module: 'proveedor' as const,
  tags: ['negative', 'introspection', 'auth'],
};

const EXPECTED = {
  success: false,
  httpStatus: 400,
};

export const scenario: Scenario = {
  ...META,
  description: 'Sin client_id/client_secret ni Authorization header debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const payload = new URLSearchParams({
      token: 'QA_TOKEN_CUALQUIERA_XXXXXXXXXXXXXXXX',
    });
    const response = await qaPostForm(introspectionUrl(), payload, {
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    return makeResult(META, response, EXPECTED);
  },
};
