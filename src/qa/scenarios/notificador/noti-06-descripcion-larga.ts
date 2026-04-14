/**
 * noti-06 — Validación Zod: descripcion > 1200 chars
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, BASE_NOTIFICACION } from './helpers';

const META = {
  id: 'noti-06',
  name: 'Descripción > 1200 caracteres — error Zod',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.descripcion'],
};

export const scenario: Scenario = {
  ...META,
  description: 'descripcion de 1201+ caracteres debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const input = {
      notificacion: {
        ...BASE_NOTIFICACION.notificacion,
        descripcion: 'X'.repeat(1201), // 1201 > 1200 máximo
      },
    };
    const validation = validateInput(input);
    if (!validation.valid) {
      return makeResult(META, { localError: validation.error, durationMs: Date.now() - start }, EXPECTED);
    }
    return makeResult(META, { durationMs: Date.now() - start }, EXPECTED);
  },
};
