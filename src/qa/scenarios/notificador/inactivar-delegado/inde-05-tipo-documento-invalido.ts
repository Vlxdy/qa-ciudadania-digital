/**
 * inde-05 — Validación Zod: tipoDocumento del representanteLegal fuera de CI|CIE
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputInactivarDelegado, tryBuildAndSendInactivarDelegado, BASE_INACTIVAR_DELEGADO } from './helpers';

const META = {
  id: 'inde-05',
  name: 'tipoDocumento representanteLegal inválido — inactivar delegado',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'inactivar-delegado'],
};

const EXPECTED = {
  success: false,
  validationFields: ['representanteLegal.tipoDocumento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'tipoDocumento con valor no permitido (ej: PASAPORTE) en representanteLegal debe fallar Zod en inactivación de delegado.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      ...BASE_INACTIVAR_DELEGADO,
      representanteLegal: { ...BASE_INACTIVAR_DELEGADO.representanteLegal, tipoDocumento: 'PASAPORTE' },
    };
    const validation = validateInputInactivarDelegado(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendInactivarDelegado(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
