/**
 * inde-03 — TOKEN_CONFIGURACION erróneo
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPatch } from '../../../http/qa-http';
import { BASE_INACTIVAR_DELEGADO, inactivarDelegadoUrl } from './helpers';

const META = {
  id: 'inde-03',
  name: 'TOKEN_CONFIGURACION erróneo — inactivar delegado',
  module: 'notificador' as const,
  tags: ['negative', 'auth', 'inactivar-delegado'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Token de configuración incorrecto en la inactivación de delegado debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPatch(inactivarDelegadoUrl(), BASE_INACTIVAR_DELEGADO, {
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
