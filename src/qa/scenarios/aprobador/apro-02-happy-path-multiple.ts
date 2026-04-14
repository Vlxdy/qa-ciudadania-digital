/**
 * apro-02 — Happy Path Multiple: 2 PDFs válidos
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildMultipleBody, multipleUrl, defaultToken, fixtures } from './helpers';

const META = {
  id: 'apro-02',
  name: 'Happy Path — Multiple PDFs',
  module: 'aprobador' as const,
  tags: ['happy', 'multiple', 'auth'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
};

export const scenario: Scenario = {
  ...META,
  description: '2 PDFs válidos en modo múltiple con tokens correctos.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildMultipleBody([fixtures.validPdf, fixtures.validPdf]);
      const response = await qaPost(multipleUrl(), body, {
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
