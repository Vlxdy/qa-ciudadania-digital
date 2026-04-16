/**
 * dele-02 — Sin TOKEN_CONFIGURACION: sin header Authorization
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildValidBodyDelegado, delegadoUrl } from './helpers';

const META = {
  id: 'dele-02',
  name: 'Sin TOKEN_CONFIGURACION — delegado',
  module: 'notificador' as const,
  tags: ['negative', 'auth', 'delegado'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Omitir el header Authorization en la solicitud de delegado debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildValidBodyDelegado();
      const response = await qaPost(delegadoUrl(), body, {
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
