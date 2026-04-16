/**
 * inde-04 — Validación Zod: codigoEntidad vacío
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputInactivarDelegado, tryBuildAndSendInactivarDelegado, BASE_INACTIVAR_DELEGADO } from './helpers';

const META = {
  id: 'inde-04',
  name: 'codigoEntidad vacío — inactivar delegado',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'inactivar-delegado'],
};

const EXPECTED = {
  success: false,
  validationFields: ['codigoEntidad'],
};

export const scenario: Scenario = {
  ...META,
  description: 'codigoEntidad vacío debe fallar validación Zod en la inactivación de delegado.',
  run: async (): Promise<ScenarioResult> => {
    const input = { ...BASE_INACTIVAR_DELEGADO, codigoEntidad: '' };
    const validation = validateInputInactivarDelegado(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendInactivarDelegado(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
