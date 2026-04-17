/**
 * avis-10 — Sin campos opcionales: sin parametros ni parametroRedireccion
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildAvisosBody, avisosUrl, defaultToken } from './helpers';

const META = {
  id: 'avis-10',
  name: 'Sin campos opcionales — avisos',
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
  description: 'Envío de aviso sin parámetros dinámicos ni parametroRedireccion debe retornar 200.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const base = await buildAvisosBody();
      const body = {
        codigoPlantilla: base.codigoPlantilla,
        accessToken: base.accessToken,
        envios: [
          { uuidCiudadano: base.envios[0].uuidCiudadano },
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
