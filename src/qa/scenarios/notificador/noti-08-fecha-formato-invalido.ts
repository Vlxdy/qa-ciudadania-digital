/**
 * noti-08 — Validación Zod: fechaNacimiento con formato incorrecto
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, BASE_NOTIFICACION } from './helpers';

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
  description:
    'fechaNacimiento en formato DD-MM-YYYY (incorrecto) debe fallar Zod. Solo acepta YYYY-MM-DD.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const input = {
      notificacion: {
        ...BASE_NOTIFICACION.notificacion,
        notificador: {
          ...BASE_NOTIFICACION.notificacion.notificador,
          fechaNacimiento: '26-05-1960', // DD-MM-YYYY — formato incorrecto
        },
      },
    };
    const validation = validateInput(input);
    if (!validation.valid) {
      return makeResult(META, { localError: validation.error, durationMs: Date.now() - start }, EXPECTED);
    }
    return makeResult(META, { durationMs: Date.now() - start }, EXPECTED);
  },
};
