/**
 * prov-20 — GET /me con token inválido.
 * Un Bearer token que no fue emitido por el IDP debe retornar 401.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaGet } from '../../http/qa-http';
import { meUrl } from './helpers';

const META = {
  id: 'prov-20',
  name: 'GET /me — token inválido',
  module: 'proveedor' as const,
  tags: ['negative', 'me', 'auth'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Bearer token malformado/no emitido por el IDP debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const response = await qaGet(meUrl(), {
      Authorization: 'Bearer QA_TOKEN_INVALIDO_XXXXXXXXXXXXXXXXXXXXXXXX',
    });
    return makeResult(META, response, EXPECTED);
  },
};
