/**
 * dele-06 — Validación Zod: tipoDocumento del notificador fuera de CI|CIE
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputDelegado, tryBuildAndSendDelegado, BASE_DELEGADO } from './helpers';

const META = {
  id: 'dele-06',
  name: 'tipoDocumento notificador inválido — delegado',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'delegado'],
};

const EXPECTED = {
  success: false,
  validationFields: ['registro.notificador.tipoDocumento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'tipoDocumento con valor no permitido en notificador debe fallar Zod en solicitud de delegado.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      registro: {
        ...BASE_DELEGADO.registro,
        notificador: { ...BASE_DELEGADO.registro.notificador, tipoDocumento: 'PASAPORTE' },
      },
    };
    const validation = validateInputDelegado(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendDelegado(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
