/**
 * avis-02 — Happy Path: envío a múltiples ciudadanos
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildAvisosBody, avisosUrl, defaultToken } from './helpers';
import { qaEnv } from '../../config/qa-env';

const META = {
  id: 'avis-02',
  name: 'Happy Path múltiple — envío de aviso a varios ciudadanos',
  module: 'avisos' as const,
  tags: ['happy', 'avisos'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ['finalizado', 'datos'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Solicitud POST con dos ciudadanos en el array envios debe retornar 200. Los UUIDs no disponibles aparecerán en datos.observados.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const base = buildAvisosBody();
      const body = {
        ...base,
        envios: [
          ...base.envios,
          {
            uuidCiudadano: qaEnv.AVISOS_UUID_CIUDADANO_2 || qaEnv.AVISOS_UUID_CIUDADANO,
            parametros: [qaEnv.AVISOS_PARAMETRO_1],
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
