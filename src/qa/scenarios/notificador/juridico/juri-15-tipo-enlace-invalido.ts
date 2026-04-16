/**
 * juri-15 — Validación Zod: tipo enlace fuera de FIRMA|APROBACION
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputJuridico, tryBuildAndSendJuridico, BASE_JURIDICO } from './helpers';

const META = {
  id: 'juri-15',
  name: 'tipo enlace fuera de FIRMA|APROBACION — jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'juridico'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.enlaces'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Tipo de enlace con valor no permitido debe fallar validación Zod en /juridico.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      notificacion: {
        ...BASE_JURIDICO.notificacion,
        enlaces: [{ ...BASE_JURIDICO.notificacion.enlaces[0], tipo: 'LECTURA' }],
      },
    };
    const validation = validateInputJuridico(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendJuridico(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
