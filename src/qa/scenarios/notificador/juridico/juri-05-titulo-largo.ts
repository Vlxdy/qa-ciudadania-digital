/**
 * juri-05 — Validación Zod: titulo > 255 chars
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputJuridico, tryBuildAndSendJuridico, BASE_JURIDICO } from './helpers';

const META = {
  id: 'juri-05',
  name: 'Título > 255 caracteres — error Zod jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'juridico'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.titulo'],
};

export const scenario: Scenario = {
  ...META,
  description: 'titulo de 256+ caracteres en notificación jurídica debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const input = { notificacion: { ...BASE_JURIDICO.notificacion, titulo: 'A'.repeat(256) } };
    const validation = validateInputJuridico(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendJuridico(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
