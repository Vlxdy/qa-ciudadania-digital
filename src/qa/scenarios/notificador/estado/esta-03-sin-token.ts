/**
 * esta-03 — Sin token: omitir Authorization en la consulta de estado
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaGet } from '../../../http/qa-http';
import { estadoUrl, UUID_INEXISTENTE } from './helpers';

const META = {
  id: 'esta-03',
  name: 'Sin TOKEN_CONFIGURACION — consulta estado',
  module: 'notificador' as const,
  tags: ['negative', 'auth', 'estado'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Omitir el header Authorization en la consulta de estado debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaGet(estadoUrl(UUID_INEXISTENTE), {
        'Content-Type': 'application/json',
        // Sin Authorization
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
