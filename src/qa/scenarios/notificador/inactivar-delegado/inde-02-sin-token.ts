/**
 * inde-02 — Sin TOKEN_CONFIGURACION: sin header Authorization
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPatch } from '../../../http/qa-http';
import { BASE_INACTIVAR_DELEGADO, inactivarDelegadoUrl } from './helpers';

const META = {
  id: 'inde-02',
  name: 'Sin TOKEN_CONFIGURACION — inactivar delegado',
  module: 'notificador' as const,
  tags: ['negative', 'auth', 'inactivar-delegado'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Omitir el header Authorization en la inactivación de delegado debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPatch(inactivarDelegadoUrl(), BASE_INACTIVAR_DELEGADO, {
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
