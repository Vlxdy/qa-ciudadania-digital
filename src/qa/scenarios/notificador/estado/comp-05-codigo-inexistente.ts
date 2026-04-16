/**
 * comp-05 — Código de seguimiento con formato UUID válido pero inexistente en el servidor
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaGet } from '../../../http/qa-http';
import { comprobanteUrl, defaultToken, UUID_INEXISTENTE } from './helpers';

const META = {
  id: 'comp-05',
  name: 'Código seguimiento inexistente — comprobante',
  module: 'notificador' as const,
  tags: ['negative', 'comprobante'],
};

const EXPECTED = {
  success: false,
  httpStatus: 412,
};

export const scenario: Scenario = {
  ...META,
  description: 'UUID válido pero sin notificación asociada debe retornar 412 en la consulta de comprobante.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaGet(comprobanteUrl(UUID_INEXISTENTE), {
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
