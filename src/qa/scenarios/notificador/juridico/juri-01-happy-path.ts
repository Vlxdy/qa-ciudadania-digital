/**
 * juri-01 — Happy Path: notificación jurídica válida completa
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildValidBodyJuridicoAsync, notificadorJuridicoUrl, defaultJuridicoToken } from './helpers';

const META = {
  id: 'juri-01',
  name: 'Happy Path — notificación jurídica válida',
  module: 'notificador' as const,
  tags: ['happy', 'auth', 'juridico'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['codigoSeguimiento', 'notificados'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Notificación jurídica válida a entidad pública con token correcto debe retornar 201.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = await buildValidBodyJuridicoAsync();
      const response = await qaPost(notificadorJuridicoUrl(), body, {
        Authorization: `Bearer ${defaultJuridicoToken()}`,
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
