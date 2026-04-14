/**
 * apro-12 — Archivo corrupto: bytes inválidos con extensión .pdf
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildSingleBody, singleUrl, defaultToken, fixtures } from './helpers';

const META = {
  id: 'apro-12',
  name: 'Archivo corrupto — bytes inválidos',
  module: 'aprobador' as const,
  tags: ['negative', 'file-type'],
};

const EXPECTED = {
  success: false,
};

export const scenario: Scenario = {
  ...META,
  description:
    'Un archivo con bytes corruptos pero extensión .pdf debe ser rechazado.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildSingleBody(fixtures.corruptedPdf);
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
