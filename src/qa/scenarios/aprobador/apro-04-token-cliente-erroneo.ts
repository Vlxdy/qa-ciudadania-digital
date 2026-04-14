/**
 * apro-04 — TOKEN_CLIENTE erróneo
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildSingleBody, singleUrl, fixtures } from './helpers';

const META = {
  id: 'apro-04',
  name: 'TOKEN_CLIENTE erróneo',
  module: 'aprobador' as const,
  tags: ['negative', 'auth'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Token de cliente incorrecto debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildSingleBody(fixtures.validPdf);
      const response = await qaPost(singleUrl(), body, {
        Authorization: 'Bearer TOKEN_INVALIDO_QA_XYZ_123',
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
