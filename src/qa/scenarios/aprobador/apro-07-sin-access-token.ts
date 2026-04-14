/**
 * apro-07 — Campo accessToken vacío en el body
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildSingleBody, singleUrl, defaultToken, fixtures } from './helpers';

const META = {
  id: 'apro-07',
  name: 'Sin accessToken en body',
  module: 'aprobador' as const,
  tags: ['negative', 'auth', 'validation'],
};

const EXPECTED = {
  success: false,
};

export const scenario: Scenario = {
  ...META,
  description: 'accessToken vacío en el body debe ser rechazado.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildSingleBody(fixtures.validPdf, { accessToken: '' });
      const response = await qaPost(singleUrl(), body, {
        Authorization: `Bearer ${defaultToken()}`,
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
