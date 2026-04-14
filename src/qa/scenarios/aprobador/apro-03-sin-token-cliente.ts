/**
 * apro-03 — Sin TOKEN_CLIENTE: sin header Authorization
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildSingleBody, singleUrl, fixtures } from './helpers';

const META = {
  id: 'apro-03',
  name: 'Sin TOKEN_CLIENTE',
  module: 'aprobador' as const,
  tags: ['negative', 'auth'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Omitir el header Authorization debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildSingleBody(fixtures.validPdf);
      // Sin Authorization header
      const response = await qaPost(singleUrl(), body, {
        'Content-Type': 'application/json',
      });
      return makeResult(META, response, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
