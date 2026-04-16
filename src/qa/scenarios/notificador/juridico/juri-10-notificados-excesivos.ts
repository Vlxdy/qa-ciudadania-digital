/**
 * juri-10 — Validación Zod: notificados > 10 (máximo 10 entidades)
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputJuridico, tryBuildAndSendJuridico, BASE_JURIDICO } from './helpers';

const META = {
  id: 'juri-10',
  name: 'Notificados > 10 — máximo excedido jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'juridico'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.notificados'],
};

export const scenario: Scenario = {
  ...META,
  description: '11 entidades notificadas (> máximo 10) debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const entidad = BASE_JURIDICO.notificacion.notificados[0];
    const input = {
      notificacion: {
        ...BASE_JURIDICO.notificacion,
        notificados: Array(11).fill(entidad),
      },
    };
    const validation = validateInputJuridico(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendJuridico(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
