/**
 * juri-08 — Validación Zod: fechaNacimiento del notificador con formato incorrecto
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputJuridico, tryBuildAndSendJuridico, BASE_JURIDICO } from './helpers';

const META = {
  id: 'juri-08',
  name: 'Fecha de nacimiento notificador — formato incorrecto jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'juridico'],
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
        ...BASE_JURIDICO.notificacion,
        notificador: { ...BASE_JURIDICO.notificacion.notificador, fechaNacimiento: '26-05-1960' },
      },
    };
    const validation = validateInputJuridico(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendJuridico(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
