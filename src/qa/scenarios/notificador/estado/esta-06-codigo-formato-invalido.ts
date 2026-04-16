/**
 * esta-06 — Código de seguimiento con formato inválido (no es un UUID)
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaGet } from '../../../http/qa-http';
import { estadoUrl, defaultToken, CODIGO_FORMATO_INVALIDO } from './helpers';

const META = {
  id: 'esta-06',
  name: 'Código seguimiento formato inválido — consulta estado',
  module: 'notificador' as const,
  tags: ['negative', 'estado'],
};

const EXPECTED = {
  success: false,
};

export const scenario: Scenario = {
  ...META,
  description: 'Código de seguimiento con formato no UUID debe retornar 400 o 404.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaGet(estadoUrl(CODIGO_FORMATO_INVALIDO), {
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
