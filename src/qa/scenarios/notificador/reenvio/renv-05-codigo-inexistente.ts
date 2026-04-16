/**
 * renv-05 — Código de seguimiento con formato UUID válido pero inexistente
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { reenvioUrl, defaultToken, UUID_INEXISTENTE } from './helpers';

const META = {
  id: 'renv-05',
  name: 'Código seguimiento inexistente — reenvío webhook',
  module: 'notificador' as const,
  tags: ['negative', 'reenvio'],
};

const EXPECTED = {
  success: false,
  httpStatus: 412,
};

export const scenario: Scenario = {
  ...META,
  description: 'UUID válido pero sin notificación asociada debe retornar 412 en el reenvío webhook.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(
        reenvioUrl(),
        { codigoSeguimiento: UUID_INEXISTENTE },
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
