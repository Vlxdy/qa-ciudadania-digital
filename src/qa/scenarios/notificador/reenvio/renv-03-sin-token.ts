/**
 * renv-03 — Sin token: omitir Authorization en el reenvío webhook
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { reenvioUrl, UUID_INEXISTENTE } from './helpers';

const META = {
  id: 'renv-03',
  name: 'Sin TOKEN_CONFIGURACION — reenvío webhook',
  module: 'notificador' as const,
  tags: ['negative', 'auth', 'reenvio'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Omitir el header Authorization en el reenvío webhook debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(
        reenvioUrl(),
        { codigoSeguimiento: UUID_INEXISTENTE },
        { 'Content-Type': 'application/json' },
      );
      return makeResult(META, response, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
