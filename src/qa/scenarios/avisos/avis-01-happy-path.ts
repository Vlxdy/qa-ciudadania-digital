/**
 * avis-01 — Happy Path: envío válido a un ciudadano con parámetros dinámicos
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildAvisosBody, avisosUrl, defaultToken } from './helpers';

const META = {
  id: 'avis-01',
  name: 'Happy Path — envío de aviso a un ciudadano',
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
  description: 'Solicitud POST válida con un ciudadano y parámetros dinámicos debe retornar 200 con finalizado:true y datos.enviados.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(avisosUrl(), buildAvisosBody(), {
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
