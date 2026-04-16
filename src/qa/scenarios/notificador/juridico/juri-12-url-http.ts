/**
 * juri-12 — Validación Zod: URL con http:// en lugar de https://
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputJuridico, tryBuildAndSendJuridico, BASE_JURIDICO } from './helpers';

const META = {
  id: 'juri-12',
  name: 'URL HTTP (no HTTPS) — error Zod jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'juridico'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.enlaces'],
};

export const scenario: Scenario = {
  ...META,
  description: 'URL con http:// en enlaces de /juridico debe fallar Zod (solo HTTPS permitido).',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      notificacion: {
        ...BASE_JURIDICO.notificacion,
        enlaces: [
          { ...BASE_JURIDICO.notificacion.enlaces[0], url: 'http://inseguro.ejemplo.com/doc.pdf' },
        ],
      },
    };
    const validation = validateInputJuridico(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendJuridico(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
