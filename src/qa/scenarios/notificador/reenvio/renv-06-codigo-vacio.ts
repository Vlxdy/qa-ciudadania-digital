/**
 * renv-06 — Campo codigoSeguimiento vacío en el body del reenvío
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { reenvioUrl, defaultToken } from './helpers';

const META = {
  id: 'renv-06',
  name: 'codigoSeguimiento vacío — reenvío webhook',
  module: 'notificador' as const,
  tags: ['negative', 'reenvio'],
};

const EXPECTED = {
  success: false,
  httpStatus: 400,
};

export const scenario: Scenario = {
  ...META,
  description: 'Body con codigoSeguimiento vacío debe retornar 400 en el reenvío webhook.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(
        reenvioUrl(),
        { codigoSeguimiento: '' },
        {
          Authorization: `Bearer ${defaultToken()}`,
          'Content-Type': 'application/json',
        },
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
