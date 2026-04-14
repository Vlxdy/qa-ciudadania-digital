/**
 * noti-11 — Validación Zod: URL con http:// en lugar de https://
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInput, BASE_NOTIFICACION } from './helpers';

const META = {
  id: 'noti-11',
  name: 'URL HTTP (no HTTPS) — error Zod',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.enlaces'],
};

export const scenario: Scenario = {
  ...META,
  description: 'URL con http:// en enlaces debe fallar Zod (solo HTTPS permitido).',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const input = {
      notificacion: {
        ...BASE_NOTIFICACION.notificacion,
        enlaces: [
          {
            ...BASE_NOTIFICACION.notificacion.enlaces[0],
            url: 'http://inseguro.ejemplo.com/doc.pdf', // HTTP — debe fallar
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
