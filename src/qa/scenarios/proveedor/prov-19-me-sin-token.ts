/**
 * prov-19 — GET /me sin token de autorización.
 * Llamar /me sin el header Authorization debe retornar 401.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaGet } from '../../http/qa-http';
import { meUrl } from './helpers';

const META = {
  id: 'prov-19',
  name: 'GET /me — sin token',
  module: 'proveedor' as const,
  tags: ['negative', 'me', 'auth'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Sin header Authorization debe retornar 401 Unauthorized.',
  run: async (): Promise<ScenarioResult> => {
    const response = await qaGet(meUrl(), {});
    return makeResult(META, response, EXPECTED);
  },
};
