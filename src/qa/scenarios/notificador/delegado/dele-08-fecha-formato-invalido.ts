/**
 * dele-08 — Validación Zod: fechaNacimiento del representanteLegal con formato incorrecto
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputDelegado, tryBuildAndSendDelegado, BASE_DELEGADO } from './helpers';

const META = {
  id: 'dele-08',
  name: 'Fecha nacimiento representanteLegal — formato incorrecto delegado',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'delegado'],
};

const EXPECTED = {
  success: false,
  validationFields: ['registro.representanteLegal.fechaNacimiento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'fechaNacimiento en formato DD-MM-YYYY del representanteLegal debe fallar Zod. Solo acepta YYYY-MM-DD.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      registro: {
        ...BASE_DELEGADO.registro,
        representanteLegal: {
          ...BASE_DELEGADO.registro.representanteLegal,
          fechaNacimiento: '15-01-1990',
        },
      },
    };
    const validation = validateInputDelegado(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendDelegado(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
