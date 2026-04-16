/**
 * inde-07 — Validación Zod: numeroDocumento del representanteLegal vacío
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputInactivarDelegado, tryBuildAndSendInactivarDelegado, BASE_INACTIVAR_DELEGADO } from './helpers';

const META = {
  id: 'inde-07',
  name: 'numeroDocumento vacío — inactivar delegado',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'inactivar-delegado'],
};

const EXPECTED = {
  success: false,
  validationFields: ['representanteLegal.numeroDocumento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'numeroDocumento vacío en representanteLegal debe fallar Zod en inactivación de delegado.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      ...BASE_INACTIVAR_DELEGADO,
      representanteLegal: { ...BASE_INACTIVAR_DELEGADO.representanteLegal, numeroDocumento: '' },
    };
    const validation = validateInputInactivarDelegado(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendInactivarDelegado(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
