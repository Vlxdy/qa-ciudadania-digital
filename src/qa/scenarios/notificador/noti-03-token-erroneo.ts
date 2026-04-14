/**
 * noti-03 — TOKEN_CONFIGURACION erróneo
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildValidBody, notificadorUrl } from './helpers';

const META = {
  id: 'noti-03',
  name: 'TOKEN_CONFIGURACION erróneo',
  module: 'notificador' as const,
  tags: ['negative', 'auth'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Token de configuración incorrecto debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildValidBody();
      const response = await qaPost(notificadorUrl(), body, {
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
