/**
 * dele-03 — TOKEN_CONFIGURACION erróneo
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildValidBodyDelegado, delegadoUrl } from './helpers';

const META = {
  id: 'dele-03',
  name: 'TOKEN_CONFIGURACION erróneo — delegado',
  module: 'notificador' as const,
  tags: ['negative', 'auth', 'delegado'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Token de configuración incorrecto en la solicitud de delegado debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildValidBodyDelegado();
      const response = await qaPost(delegadoUrl(), body, {
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
