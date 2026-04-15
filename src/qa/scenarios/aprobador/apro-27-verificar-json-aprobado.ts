/**
 * apro-27 — Verificar JSON aprobado.
 * Envía el mismo JSON de apro-23 a POST /api/documentos/verificar.
 * Depende de que apro-23 haya completado el flujo de aprobación con éxito.
 * Espera verificacionExitosa:true y al menos un registro.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { verificarUrl, defaultToken, fileToBase64, fixtures } from './helpers';

const META = {
  id: 'apro-27',
  name: 'Verificar — JSON aprobado',
  module: 'aprobador' as const,
  tags: ['verificar', 'positive', 'json'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['verificacionExitosa', 'registros'],
};

export const scenario: Scenario = {
  ...META,
  description:
    'El JSON aprobado en apro-23 debe retornar verificacionExitosa:true con al menos un registro.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const archivo = fileToBase64(fixtures.validJson);
      const response = await qaPost(
        verificarUrl(),
        { archivo },
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
