/**
 * noti-07 — Validación Zod: tipoDocumento fuera de enum CI|CIE
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, BASE_NOTIFICACION } from './helpers';

const META = {
  id: 'noti-07',
  name: 'tipoDocumento inválido — fuera de CI|CIE',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.notificador.tipoDocumento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'tipoDocumento con valor no permitido debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const input = {
      notificacion: {
        ...BASE_NOTIFICACION.notificacion,
        notificador: {
          ...BASE_NOTIFICACION.notificacion.notificador,
          tipoDocumento: 'PASAPORTE', // No está en el enum CI | CIE
        },
      },
    };
    const validation = validateInput(input);
    if (!validation.valid) {
      return makeResult(META, { localError: validation.error, durationMs: Date.now() - start }, EXPECTED);
    }
    return makeResult(META, { durationMs: Date.now() - start }, EXPECTED);
  },
};
