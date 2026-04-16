/**
 * inde-06 — Validación Zod: fechaNacimiento con formato incorrecto
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputInactivarDelegado, tryBuildAndSendInactivarDelegado, BASE_INACTIVAR_DELEGADO } from './helpers';

const META = {
  id: 'inde-06',
  name: 'fechaNacimiento formato inválido — inactivar delegado',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'inactivar-delegado'],
};

const EXPECTED = {
  success: false,
  validationFields: ['representanteLegal.fechaNacimiento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'fechaNacimiento con formato incorrecto (DD/MM/YYYY) debe fallar Zod en inactivación de delegado.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      ...BASE_INACTIVAR_DELEGADO,
      representanteLegal: { ...BASE_INACTIVAR_DELEGADO.representanteLegal, fechaNacimiento: '12/12/2000' },
    };
    const validation = validateInputInactivarDelegado(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendInactivarDelegado(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
