/**
 * noti-10 — Validación Zod: notificados > 10 (máximo 10)
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, BASE_NOTIFICACION } from './helpers';

const META = {
  id: 'noti-10',
  name: 'Notificados > 10 — máximo excedido',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.notificados'],
};

const persona = {
  tipoDocumento: 'CI' as const,
  numeroDocumento: '5585535',
  fechaNacimiento: '1974-01-31',
};

export const scenario: Scenario = {
  ...META,
  description: '11 notificados (> máximo 10) debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const input = {
      notificacion: {
        ...BASE_NOTIFICACION.notificacion,
        notificados: Array(11).fill(persona), // 11 > máximo 10
      },
    };
    const validation = validateInput(input);
    if (!validation.valid) {
      return makeResult(META, { localError: validation.error, durationMs: Date.now() - start }, EXPECTED);
    }
    return makeResult(META, { durationMs: Date.now() - start }, EXPECTED);
  },
};
