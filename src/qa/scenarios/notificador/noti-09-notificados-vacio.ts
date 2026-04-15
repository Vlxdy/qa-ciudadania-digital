/**
 * noti-09 — Validación Zod: notificados vacío (mínimo 1)
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, tryBuildAndSend, BASE_NOTIFICACION } from './helpers';

const META = {
  id: 'noti-09',
  name: 'Notificados vacío — mínimo 1 requerido',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.notificados'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Array notificados vacío debe fallar Zod (mínimo 1).',
  run: async (): Promise<ScenarioResult> => {
    const input = { notificacion: { ...BASE_NOTIFICACION.notificacion, notificados: [] } };
    const validation = validateInput(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSend(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
