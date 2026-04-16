/**
 * dele-05 — Validación Zod: descripcion > 600 chars
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputDelegado, tryBuildAndSendDelegado, BASE_DELEGADO } from './helpers';

const META = {
  id: 'dele-05',
  name: 'Descripción > 600 caracteres — error Zod delegado',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'delegado'],
};

const EXPECTED = {
  success: false,
  validationFields: ['registro.descripcion'],
};

export const scenario: Scenario = {
  ...META,
  description: 'descripcion de 601+ caracteres debe fallar validación Zod en la solicitud de delegado.',
  run: async (): Promise<ScenarioResult> => {
    const input = { registro: { ...BASE_DELEGADO.registro, descripcion: 'D'.repeat(601) } };
    const validation = validateInputDelegado(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendDelegado(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
