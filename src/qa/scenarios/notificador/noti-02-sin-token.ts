/**
 * noti-02 — Sin TOKEN_CONFIGURACION: sin header Authorization
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildValidBody, notificadorUrl } from './helpers';

const META = {
  id: 'noti-02',
  name: 'Sin TOKEN_CONFIGURACION',
  module: 'notificador' as const,
  tags: ['negative', 'auth'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Omitir el header Authorization debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildValidBody();
      const response = await qaPost(notificadorUrl(), body, {
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
