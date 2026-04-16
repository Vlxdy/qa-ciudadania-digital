/**
 * esta-05 — Código de seguimiento con formato UUID válido pero inexistente en el servidor
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaGet } from '../../../http/qa-http';
import { estadoUrl, defaultToken, UUID_INEXISTENTE } from './helpers';

const META = {
  id: 'esta-05',
  name: 'Código seguimiento inexistente — consulta estado',
  module: 'notificador' as const,
  tags: ['negative', 'estado'],
};

const EXPECTED = {
  success: false,
  httpStatus: 412,
};

export const scenario: Scenario = {
  ...META,
  description: 'UUID válido pero sin notificación asociada debe retornar 412.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaGet(estadoUrl(UUID_INEXISTENTE), {
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
