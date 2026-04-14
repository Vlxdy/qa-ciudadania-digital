/**
 * prov-03 — Client ID erróneo
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPostForm } from '../../http/qa-http';
import { buildTokenPayload, tokenUrl } from './helpers';

const META = {
  id: 'prov-03',
  name: 'Client ID erróneo',
  module: 'proveedor' as const,
  tags: ['negative', 'auth'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
  bodyContains: ['invalid_client'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Un client_id no registrado en el IDP debe retornar 401 con invalid_client.',
  run: async (): Promise<ScenarioResult> => {
    const { payload, headers } = buildTokenPayload({
      clientId: 'QA_CLIENT_ID_INVALIDO_99999',
    });
    const response = await qaPostForm(tokenUrl(), payload, headers);
    return makeResult(META, response, EXPECTED);
  },
};
