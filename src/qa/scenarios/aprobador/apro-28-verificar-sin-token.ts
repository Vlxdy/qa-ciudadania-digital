/**
 * apro-28 — Verificar sin TOKEN_CLIENTE: sin header Authorization.
 * POST /api/documentos/verificar sin Authorization debe retornar 401.
 */
import type { ExpectedOutcome, Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { verificarUrl, fileToBase64, fixtures } from './helpers';

const META = {
  id: 'apro-28',
  name: 'Verificar — sin TOKEN_CLIENTE',
  module: 'aprobador' as const,
  tags: ['verificar', 'negative', 'auth'],
};

const EXPECTED: ExpectedOutcome = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Omitir el header Authorization en /verificar debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const archivo = fileToBase64(fixtures.validPdf);
      const response = await qaPost(
        verificarUrl(),
        { archivo },
        { 'Content-Type': 'application/json' },
      );
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
