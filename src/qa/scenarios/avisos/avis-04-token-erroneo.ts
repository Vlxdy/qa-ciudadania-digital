/**
 * avis-04 — Token erróneo
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildAvisosBody, avisosUrl } from './helpers';

const META = {
  id: 'avis-04',
  name: 'Token erróneo — avisos',
  module: 'avisos' as const,
  tags: ['negative', 'auth', 'avisos'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Token Bearer incorrecto en el envío de avisos debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(avisosUrl(), buildAvisosBody(), {
        Authorization: 'Bearer TOKEN_INCORRECTO_QA_XYZ',
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
