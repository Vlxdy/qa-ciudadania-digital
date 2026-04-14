/**
 * prov-04 — Client Secret erróneo
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPostForm } from '../../http/qa-http';
import { buildTokenPayload, tokenUrl } from './helpers';

const META = {
  id: 'prov-04',
  name: 'Client Secret erróneo',
  module: 'proveedor' as const,
  tags: ['negative', 'auth'],
};

const EXPECTED = {
  success: false,
  httpStatus: 400,
};

export const scenario: Scenario = {
  ...META,
  description: 'client_secret incorrecto debe retornar 401 aunque el client_id sea válido.',
  run: async (): Promise<ScenarioResult> => {
    const { payload, headers } = buildTokenPayload({
      clientSecret: 'SECRET_INCORRECTO_QA_XYZ',
    });
    const response = await qaPostForm(tokenUrl(), payload, headers);
    return makeResult(META, response, EXPECTED);
  },
};
