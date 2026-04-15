/**
 * noti-08 — Validación Zod: fechaNacimiento con formato incorrecto
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, tryBuildAndSend, BASE_NOTIFICACION } from './helpers';

const META = {
  id: 'noti-08',
  name: 'Fecha de nacimiento — formato incorrecto',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.notificador.fechaNacimiento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'fechaNacimiento en formato DD-MM-YYYY debe fallar Zod. Solo acepta YYYY-MM-DD.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      notificacion: {
        ...BASE_NOTIFICACION.notificacion,
        notificador: { ...BASE_NOTIFICACION.notificacion.notificador, fechaNacimiento: '26-05-1960' },
      },
    };
    const validation = validateInput(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSend(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
