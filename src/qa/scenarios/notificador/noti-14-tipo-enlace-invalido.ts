/**
 * noti-14 — Validación Zod: tipo enlace fuera de FIRMA|APROBACION
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, BASE_NOTIFICACION } from './helpers';

const META = {
  id: 'noti-14',
  name: 'tipo enlace fuera de FIRMA|APROBACION',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.enlaces'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Tipo de enlace con valor no permitido debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const input = {
      notificacion: {
        ...BASE_NOTIFICACION.notificacion,
        enlaces: [
          {
            ...BASE_NOTIFICACION.notificacion.enlaces[0],
            tipo: 'LECTURA', // No está en el enum FIRMA | APROBACION
          },
        ],
      },
    };
    const validation = validateInput(input);
    if (!validation.valid) {
      return makeResult(META, { localError: validation.error, durationMs: Date.now() - start }, EXPECTED);
    }
    return makeResult(META, { durationMs: Date.now() - start }, EXPECTED);
  },
};
