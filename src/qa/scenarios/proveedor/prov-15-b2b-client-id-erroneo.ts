/**
 * prov-15 — B2B client_id erróneo.
 * Un client_id no registrado debe retornar 400 con error de autenticación.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPostForm } from '../../http/qa-http';
import { buildB2bPayload, tokenUrl } from './helpers';

const META = {
  id: 'prov-15',
  name: 'B2B — client_id erróneo',
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
  description: 'Client Credentials con client_id no registrado debe retornar 400.',
  run: async (): Promise<ScenarioResult> => {
    const { payload, headers } = buildB2bPayload({
      clientId: 'QA_B2B_CLIENT_ID_INVALIDO_99999',
    });
    const response = await qaPostForm(tokenUrl(), payload, headers);
    return makeResult(META, response, EXPECTED);
  },
};
