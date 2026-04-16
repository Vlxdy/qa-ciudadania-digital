/**
 * comp-03 — Sin token: omitir Authorization en la consulta de comprobante
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaGet } from '../../../http/qa-http';
import { comprobanteUrl, UUID_INEXISTENTE } from './helpers';

const META = {
  id: 'comp-03',
  name: 'Sin TOKEN_CONFIGURACION — comprobante',
  module: 'notificador' as const,
  tags: ['negative', 'auth', 'comprobante'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Omitir el header Authorization en la consulta de comprobante debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaGet(comprobanteUrl(UUID_INEXISTENTE), {
        'Content-Type': 'application/json',
        // Sin Authorization
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
