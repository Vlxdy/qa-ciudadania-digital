/**
 * comp-04 — Token erróneo en la consulta de comprobante
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaGet } from '../../../http/qa-http';
import { comprobanteUrl, UUID_INEXISTENTE } from './helpers';

const META = {
  id: 'comp-04',
  name: 'TOKEN_CONFIGURACION erróneo — comprobante',
  module: 'notificador' as const,
  tags: ['negative', 'auth', 'comprobante'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Token de configuración incorrecto en la consulta de comprobante debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaGet(comprobanteUrl(UUID_INEXISTENTE), {
        Authorization: 'Bearer TOKEN_INCORRECTO_QA_XYZ',
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
