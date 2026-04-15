/**
 * apro-32 — Verificar sin el campo "archivo".
 * POST /api/documentos/verificar con body vacío (sin campo archivo).
 * El servidor debe rechazar la solicitud con 4xx por validación.
 */
import type { ExpectedOutcome, Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { verificarUrl, defaultToken } from './helpers';

const META = {
  id: 'apro-32',
  name: 'Verificar — sin campo archivo',
  module: 'aprobador' as const,
  tags: ['verificar', 'negative', 'validation'],
};

const EXPECTED: ExpectedOutcome = {
  success: false,
  httpStatus: 400,
};

export const scenario: Scenario = {
  ...META,
  description: 'Omitir el campo archivo en /verificar debe retornar 400.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(
        verificarUrl(),
        {},
        {
          Authorization: `Bearer ${defaultToken()}`,
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
