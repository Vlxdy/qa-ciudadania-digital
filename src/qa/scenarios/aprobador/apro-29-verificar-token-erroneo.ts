/**
 * apro-29 — Verificar con TOKEN_CLIENTE erróneo.
 * POST /api/documentos/verificar con token inválido debe retornar 401.
 */
import type { ExpectedOutcome, Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { verificarUrl, fileToBase64, fixtures } from './helpers';

const META = {
  id: 'apro-29',
  name: 'Verificar — TOKEN_CLIENTE erróneo',
  module: 'aprobador' as const,
  tags: ['verificar', 'negative', 'auth'],
};

const EXPECTED: ExpectedOutcome = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Token de cliente incorrecto en /verificar debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const archivo = fileToBase64(fixtures.validPdf);
      const response = await qaPost(
        verificarUrl(),
        { archivo },
        {
          Authorization: 'Bearer TOKEN_INVALIDO_QA_XYZ_123',
          'Content-Type': 'application/json',
        },
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
