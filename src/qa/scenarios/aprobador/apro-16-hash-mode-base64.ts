/**
 * apro-16 — Hash mode BASE64: SHA256 sobre el string base64
 * Nota: solo uno de los dos modos (BUFFER o BASE64) es el correcto para el servidor.
 * Este escenario permite verificar cuál acepta el backend.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildSingleBody, singleUrl, defaultToken, fixtures } from './helpers';

const META = {
  id: 'apro-16',
  name: 'Hash mode BASE64',
  module: 'aprobador' as const,
  tags: ['config', 'hash'],
};

// Si el servidor solo acepta BUFFER, ajustar a success: false
const EXPECTED = {
  success: true,
  httpStatus: 200,
};

export const scenario: Scenario = {
  ...META,
  description:
    'Hash calculado sobre string base64 (BASE64). ' +
    'Ajustar expected.success según qué modo acepta el backend.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildSingleBody(fixtures.validPdf, { hashMode: 'BASE64' });
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
