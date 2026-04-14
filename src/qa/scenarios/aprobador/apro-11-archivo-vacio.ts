/**
 * apro-11 — Archivo vacío (0 bytes)
 * El archivo tiene extensión .pdf pero 0 bytes — se envía al servidor y se verifica el rechazo.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildSingleBody, singleUrl, defaultToken, fixtures } from './helpers';

const META = {
  id: 'apro-11',
  name: 'Archivo vacío — 0 bytes',
  module: 'aprobador' as const,
  tags: ['negative', 'file-size'],
};

const EXPECTED = {
  success: false,
};

export const scenario: Scenario = {
  ...META,
  description: 'Un PDF de 0 bytes debe ser rechazado por el servidor.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildSingleBody(fixtures.emptyPdf);
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
