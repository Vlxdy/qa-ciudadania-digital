/**
 * prov-16 — B2B client_secret erróneo.
 * Un client_secret incorrecto debe retornar 400 con error de autenticación.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPostForm } from '../../http/qa-http';
import { buildB2bPayload, tokenUrl } from './helpers';

const META = {
  id: 'prov-16',
  name: 'B2B — client_secret erróneo',
  module: 'proveedor' as const,
  tags: ['negative', 'b2b', 'auth'],
};

const EXPECTED = {
  success: false,
  httpStatus: 400,
  bodyContains: ['client authentication failed'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Client Credentials con client_secret incorrecto debe retornar 400.',
  run: async (): Promise<ScenarioResult> => {
    const { payload, headers } = buildB2bPayload({
      clientSecret: 'QA_SECRET_INVALIDO_99999',
    });
    const response = await qaPostForm(tokenUrl(), payload, headers);
    return makeResult(META, response, EXPECTED);
  },
};
