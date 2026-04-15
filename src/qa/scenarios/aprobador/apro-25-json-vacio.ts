/**
 * apro-25 — JSON vacío (0 bytes)
 * Archivo de extensión JSON pero con 0 bytes — el servidor debe rechazarlo.
 */
import type { ExpectedOutcome, Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildSingleBody, singleUrl, defaultToken, fixtures } from './helpers';

const META = {
  id: 'apro-25',
  name: 'JSON vacío — 0 bytes',
  module: 'aprobador' as const,
  tags: ['negative', 'json', 'file-size'],
};

const EXPECTED: ExpectedOutcome = {
  success: false,
  httpStatus: 400,
};

export const scenario: Scenario = {
  ...META,
  description: 'Un archivo JSON de 0 bytes debe ser rechazado por el servidor.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      // Reutiliza emptyPdf (0 bytes) declarándolo como JSON
      const body = buildSingleBody(fixtures.emptyPdf, { tipoDocumento: 'JSON' });
      const response = await qaPost(singleUrl(), body, {
        Authorization: `Bearer ${defaultToken()}`,
        'Content-Type': 'application/json',
      });
      return makeResult(META, response, EXPECTED);
    } catch (err) {
      return makeResult(
        META,
        {
          localError: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - start,
        },
        EXPECTED,
      );
    }
  },
};
