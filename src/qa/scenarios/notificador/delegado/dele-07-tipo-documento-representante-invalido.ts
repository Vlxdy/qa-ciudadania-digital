/**
 * dele-07 — Validación Zod: tipoDocumento del representanteLegal fuera de CI|CIE
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputDelegado, tryBuildAndSendDelegado, BASE_DELEGADO } from './helpers';

const META = {
  id: 'dele-07',
  name: 'tipoDocumento representanteLegal inválido — delegado',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'delegado'],
};

const EXPECTED = {
  success: false,
  validationFields: ['registro.representanteLegal.tipoDocumento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'tipoDocumento con valor no permitido en representanteLegal debe fallar Zod en solicitud de delegado.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      registro: {
        ...BASE_DELEGADO.registro,
        representanteLegal: { ...BASE_DELEGADO.registro.representanteLegal, tipoDocumento: 'PASAPORTE' },
      },
    };
    const validation = validateInputDelegado(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendDelegado(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
