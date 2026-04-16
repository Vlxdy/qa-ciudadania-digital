/**
 * inde-01 — Happy Path: inactivación de delegado válida
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPatch } from '../../../http/qa-http';
import { BASE_INACTIVAR_DELEGADO, inactivarDelegadoUrl, defaultToken } from './helpers';

const META = {
  id: 'inde-01',
  name: 'Happy Path — inactivar delegado válido',
  module: 'notificador' as const,
  tags: ['happy', 'inactivar-delegado'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ['finalizado'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Solicitud PATCH válida para inhabilitar a un ciudadano como delegado debe retornar 200 con finalizado:true.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPatch(inactivarDelegadoUrl(), BASE_INACTIVAR_DELEGADO, {
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
