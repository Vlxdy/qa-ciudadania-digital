/**
 * juri-03 — TOKEN_CONFIGURACION erróneo en endpoint /juridico
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildValidBodyJuridico, notificadorJuridicoUrl } from './helpers';

const META = {
  id: 'juri-03',
  name: 'TOKEN_CONFIGURACION erróneo — jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'auth', 'juridico'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Token de configuración incorrecto en /juridico debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildValidBodyJuridico();
      const response = await qaPost(notificadorJuridicoUrl(), body, {
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
