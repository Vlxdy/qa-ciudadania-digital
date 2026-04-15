/**
 * noti-06 — Validación Zod: descripcion > 1200 chars
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, tryBuildAndSend, BASE_NOTIFICACION } from './helpers';

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
    const input = { notificacion: { ...BASE_NOTIFICACION.notificacion, descripcion: 'X'.repeat(1201) } };
    const validation = validateInput(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSend(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
