/**
 * noti-10 — Validación Zod: notificados > 10 (máximo 10)
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, tryBuildAndSend, BASE_NOTIFICACION } from './helpers';

const META = {
  id: 'noti-10',
  name: 'Notificados > 10 — máximo excedido',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.notificados'],
};

export const scenario: Scenario = {
  ...META,
  description: '11 notificados (> máximo 10) debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const persona = BASE_NOTIFICACION.notificacion.notificados[0];
    const input = {
      notificacion: {
        ...BASE_NOTIFICACION.notificacion,
        notificados: Array(11).fill(persona),
      },
    };
    const validation = validateInput(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSend(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
