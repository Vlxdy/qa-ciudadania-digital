/**
 * prov-17 — B2B grant_type inválido.
 * Un grant_type no soportado debe retornar 400 con error de grant type.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPostForm } from '../../http/qa-http';
import { buildB2bPayload, tokenUrl } from './helpers';

const META = {
  id: 'prov-17',
  name: 'B2B — grant_type inválido',
  module: 'proveedor' as const,
  tags: ['negative', 'b2b', 'auth'],
};

const EXPECTED = {
  success: false,
  httpStatus: 400,
};

export const scenario: Scenario = {
  ...META,
  description: 'grant_type no soportado (unsupported_grant_type) debe retornar 400.',
  run: async (): Promise<ScenarioResult> => {
    const { payload, headers } = buildB2bPayload({
      grantType: 'unsupported_grant_type',
    });
    const response = await qaPostForm(tokenUrl(), payload, headers);
    return makeResult(META, response, EXPECTED);
  },
};
