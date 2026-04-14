/**
 * apro-22 — Multiple con PDF y JSON en el mismo batch
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildMultipleBody, multipleUrl, defaultToken, fixtures } from './helpers';

const META = {
  id: 'apro-22',
  name: 'Multiple — tipos mixtos PDF + JSON',
  module: 'aprobador' as const,
  tags: ['positive', 'multiple'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
};

export const scenario: Scenario = {
  ...META,
  description: 'Batch con un PDF y un JSON válidos debe ser aceptado.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildMultipleBody([fixtures.validPdf, fixtures.validJson]);
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
