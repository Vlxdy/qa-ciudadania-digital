/**
 * avis-11 — Con parametroRedireccion: fragmento de URL adicional
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildAvisosBody, avisosUrl, defaultToken } from './helpers';
import { qaEnv } from '../../config/qa-env';

const META = {
  id: 'avis-11',
  name: 'Con parametroRedireccion — avisos',
  module: 'avisos' as const,
  tags: ['happy', 'avisos'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ['finalizado'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Envío de aviso con parametroRedireccion configurado debe retornar 200 (requiere que la plantilla tenga URL de redirección habilitada).',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const base = await buildAvisosBody();
      const body = {
        ...base,
        envios: [
          {
            ...base.envios[0],
            parametroRedireccion: qaEnv.AVISOS_PARAMETRO_REDIRECCION,
          },
        ],
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
