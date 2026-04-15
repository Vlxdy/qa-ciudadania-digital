/**
 * noti-13 — Validación Zod: valor de datosAdicionalesEntidad > 100 chars
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, tryBuildAndSend, BASE_NOTIFICACION } from './helpers';

const META = {
  id: 'noti-13',
  name: 'valor datosAdicionales > 100 chars',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.datosAdicionalesEntidad'],
};

export const scenario: Scenario = {
  ...META,
  description: 'valor de datosAdicionalesEntidad con 101+ caracteres debe fallar Zod.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      notificacion: {
        ...BASE_NOTIFICACION.notificacion,
        datosAdicionalesEntidad: [{ clave: 'clave', valor: 'V'.repeat(101) }],
      },
    };
    const validation = validateInput(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSend(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
