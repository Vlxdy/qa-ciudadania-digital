/**
 * noti-04 — Validación Zod: titulo vacío (min 1 char)
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, tryBuildAndSend, BASE_NOTIFICACION } from './helpers';

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
    const input = { notificacion: { ...BASE_NOTIFICACION.notificacion, titulo: '' } };
    const validation = validateInput(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSend(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
