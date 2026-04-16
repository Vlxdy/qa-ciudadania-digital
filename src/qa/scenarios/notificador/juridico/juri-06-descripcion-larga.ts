/**
 * juri-06 — Validación Zod: descripcion > 1000 chars
 * El endpoint /juridico limita el texto original a 1000 caracteres.
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputJuridico, tryBuildAndSendJuridico, BASE_JURIDICO } from './helpers';

const META = {
  id: 'juri-06',
  name: 'Descripción > 1000 caracteres — error Zod jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'juridico'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.descripcion'],
};

export const scenario: Scenario = {
  ...META,
  description: 'descripcion de 1001+ caracteres en notificación jurídica debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const input = { notificacion: { ...BASE_JURIDICO.notificacion, descripcion: 'X'.repeat(1001) } };
    const validation = validateInputJuridico(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendJuridico(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
