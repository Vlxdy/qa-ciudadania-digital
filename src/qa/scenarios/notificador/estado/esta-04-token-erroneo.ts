/**
 * esta-04 — Token erróneo en la consulta de estado
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaGet } from '../../../http/qa-http';
import { estadoUrl, UUID_INEXISTENTE } from './helpers';

const META = {
  id: 'esta-04',
  name: 'TOKEN_CONFIGURACION erróneo — consulta estado',
  module: 'notificador' as const,
  tags: ['negative', 'auth', 'estado'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Token de configuración incorrecto en la consulta de estado debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaGet(estadoUrl(UUID_INEXISTENTE), {
        Authorization: 'Bearer TOKEN_INCORRECTO_QA_XYZ',
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
