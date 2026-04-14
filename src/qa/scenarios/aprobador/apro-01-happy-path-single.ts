/**
 * apro-01 — Happy Path Single: PDF válido, tokens correctos
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildSingleBody, singleUrl, defaultToken, fixtures } from './helpers';

const META = {
  id: 'apro-01',
  name: 'Happy Path — Single PDF',
  module: 'aprobador' as const,
  tags: ['happy', 'single', 'auth'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ['link'],
};

export const scenario: Scenario = {
  ...META,
  description: 'PDF válido con tokens correctos debe retornar 200 y link de aprobación.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildSingleBody(fixtures.validPdf);
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
