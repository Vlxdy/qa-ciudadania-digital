/**
 * dele-04 — Validación Zod: codigoEntidad vacío
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputDelegado, tryBuildAndSendDelegado, BASE_DELEGADO } from './helpers';

const META = {
  id: 'dele-04',
  name: 'codigoEntidad vacío — error Zod delegado',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'delegado'],
};

const EXPECTED = {
  success: false,
  validationFields: ['registro.codigoEntidad'],
};

export const scenario: Scenario = {
  ...META,
  description: 'codigoEntidad vacío debe fallar validación Zod en la solicitud de delegado.',
  run: async (): Promise<ScenarioResult> => {
    const input = { registro: { ...BASE_DELEGADO.registro, codigoEntidad: '' } };
    const validation = validateInputDelegado(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendDelegado(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
