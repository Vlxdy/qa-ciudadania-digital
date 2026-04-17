/**
 * avis-12 — Plantilla inexistente: codigoPlantilla UUID que no existe en el sistema
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildAvisosBody, avisosUrl, defaultToken } from './helpers';

const META = {
  id: 'avis-12',
  name: 'Plantilla inexistente — avisos',
  module: 'avisos' as const,
  tags: ['negative', 'server', 'avisos'],
};

const EXPECTED = {
  success: false,
  httpStatus: 412,
};

export const scenario: Scenario = {
  ...META,
  description: 'codigoPlantilla con UUID que no existe en el sistema debe retornar 412 Precondition Failed.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = {
        ...(await buildAvisosBody()),
        codigoPlantilla: '00000000-0000-0000-0000-000000000000',
      };
      const response = await qaPost(avisosUrl(), body, {
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
