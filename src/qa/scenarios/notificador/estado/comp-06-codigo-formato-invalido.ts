/**
 * comp-06 — Código de seguimiento con formato inválido (no es un UUID)
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaGet } from '../../../http/qa-http';
import { comprobanteUrl, defaultToken, CODIGO_FORMATO_INVALIDO } from './helpers';

const META = {
  id: 'comp-06',
  name: 'Código seguimiento formato inválido — comprobante',
  module: 'notificador' as const,
  tags: ['negative', 'comprobante'],
};

const EXPECTED = {
  success: false,
};

export const scenario: Scenario = {
  ...META,
  description: 'Código de seguimiento con formato no UUID debe retornar 400 o 412 en la consulta de comprobante.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaGet(comprobanteUrl(CODIGO_FORMATO_INVALIDO), {
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
