/**
 * dele-01 — Happy Path: solicitud de delegado válida completa
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildValidBodyDelegado, delegadoUrl, defaultToken } from './helpers';

const META = {
  id: 'dele-01',
  name: 'Happy Path — solicitud de delegado válida',
  module: 'notificador' as const,
  tags: ['happy', 'delegado'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['codigoSeguimiento', 'numeroDocumento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Solicitud válida de delegado de entidad pública debe retornar 201 con codigoSeguimiento y datos del representante legal.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildValidBodyDelegado();
      const response = await qaPost(delegadoUrl(), body, {
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
