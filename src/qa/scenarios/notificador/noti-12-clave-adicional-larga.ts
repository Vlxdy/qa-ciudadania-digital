/**
 * noti-12 — Validación Zod: clave de datosAdicionalesEntidad > 30 chars
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, tryBuildAndSend, BASE_NOTIFICACION } from './helpers';

const META = {
  id: 'noti-12',
  name: 'clave datosAdicionales > 30 chars',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.datosAdicionalesEntidad'],
};

export const scenario: Scenario = {
  ...META,
  description: 'clave de datosAdicionalesEntidad con 31+ caracteres debe fallar Zod.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      notificacion: {
        ...BASE_NOTIFICACION.notificacion,
        datosAdicionalesEntidad: [{ clave: 'C'.repeat(31), valor: 'valor válido' }],
      },
    };
    const validation = validateInput(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSend(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
