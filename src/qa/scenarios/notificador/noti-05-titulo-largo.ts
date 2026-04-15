/**
 * noti-05 — Validación Zod: titulo > 255 chars
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, tryBuildAndSend, BASE_NOTIFICACION } from './helpers';

const META = {
  id: 'noti-05',
  name: 'Título > 255 caracteres — error Zod',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.titulo'],
};

export const scenario: Scenario = {
  ...META,
  description: 'titulo de 256+ caracteres debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const input = { notificacion: { ...BASE_NOTIFICACION.notificacion, titulo: 'A'.repeat(256) } };
    const validation = validateInput(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSend(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
