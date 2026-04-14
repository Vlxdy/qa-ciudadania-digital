/**
 * noti-04 — Validación Zod: titulo vacío (min 1 char)
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, BASE_NOTIFICACION } from './helpers';

const META = {
  id: 'noti-04',
  name: 'Título vacío — error Zod',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.titulo'],
};

export const scenario: Scenario = {
  ...META,
  description: 'titulo vacío debe fallar validación Zod con error en notificacion.titulo.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const input = {
      notificacion: { ...BASE_NOTIFICACION.notificacion, titulo: '' },
    };
    const validation = validateInput(input);
    if (!validation.valid) {
      return makeResult(META, { localError: validation.error, durationMs: Date.now() - start }, EXPECTED);
    }
    return makeResult(META, { durationMs: Date.now() - start }, EXPECTED);
  },
};
