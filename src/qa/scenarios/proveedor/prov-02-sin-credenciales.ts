/**
 * prov-02 — Sin credenciales: client_id y client_secret vacíos
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPostForm } from '../../http/qa-http';
import { buildTokenPayload, tokenUrl } from './helpers';

const META = {
  id: 'prov-02',
  name: 'Sin credenciales',
  module: 'proveedor' as const,
  tags: ['negative', 'auth'],
};

const EXPECTED = {
  success: false,
  httpStatus: 400,
};

export const scenario: Scenario = {
  ...META,
  description: 'client_id y client_secret vacíos deben retornar 400 del IDP.',
  run: async (): Promise<ScenarioResult> => {
    const { payload, headers } = buildTokenPayload({
      clientId: '',
      clientSecret: '',
    });
    const response = await qaPostForm(tokenUrl(), payload, headers);
    return makeResult(META, response, EXPECTED);
  },
};
