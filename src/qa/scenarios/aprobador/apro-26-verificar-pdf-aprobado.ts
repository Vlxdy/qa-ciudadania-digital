/**
 * apro-26 — Verificar PDF aprobado.
 * Envía el mismo PDF de apro-01 a POST /api/documentos/verificar.
 * Depende de que apro-01 haya completado el flujo de aprobación con éxito.
 * Espera verificacionExitosa:true y al menos un registro.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { verificarUrl, defaultToken, fileToBase64, fixtures } from './helpers';

const META = {
  id: 'apro-26',
  name: 'Verificar — PDF aprobado',
  module: 'aprobador' as const,
  tags: ['verificar', 'positive', 'pdf'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['verificacionExitosa', 'registros'],
};

export const scenario: Scenario = {
  ...META,
  description:
    'El PDF aprobado en apro-01 debe retornar verificacionExitosa:true con al menos un registro.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const archivo = fileToBase64(fixtures.validPdf);
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
