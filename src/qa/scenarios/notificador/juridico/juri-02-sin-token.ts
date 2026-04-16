/**
 * juri-02 — Sin TOKEN_CONFIGURACION: sin header Authorization
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildValidBodyJuridico, notificadorJuridicoUrl } from './helpers';

const META = {
  id: 'juri-02',
  name: 'Sin TOKEN_CONFIGURACION — jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'auth', 'juridico'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Omitir el header Authorization en /juridico debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildValidBodyJuridico();
      const response = await qaPost(notificadorJuridicoUrl(), body, {
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
