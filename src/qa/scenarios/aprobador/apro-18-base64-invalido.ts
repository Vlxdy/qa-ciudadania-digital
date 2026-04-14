/**
 * apro-18 — Documento con base64 inválido
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildSingleBody, singleUrl, defaultToken, fixtures } from './helpers';

const META = {
  id: 'apro-18',
  name: 'Documento base64 inválido',
  module: 'aprobador' as const,
  tags: ['negative', 'encoding'],
};

const EXPECTED = {
  success: false,
};

export const scenario: Scenario = {
  ...META,
  description:
    'String base64 malformado en el campo documento debe ser rechazado.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildSingleBody(fixtures.validPdf, {
        documento: '!!!ESTO_NO_ES_BASE64_VALIDO_@@@###',
      });
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
