/**
 * juri-11 — Validación Zod: codigoEntidad vacío en notificados
 * Exclusivo del endpoint /juridico — no existe en el flujo de persona natural.
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputJuridico, tryBuildAndSendJuridico, BASE_JURIDICO } from './helpers';

const META = {
  id: 'juri-11',
  name: 'codigoEntidad vacío en notificados — jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'juridico'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.notificados'],
};

export const scenario: Scenario = {
  ...META,
  description: 'codigoEntidad vacío en el array notificados debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      notificacion: {
        ...BASE_JURIDICO.notificacion,
        notificados: [{ codigoEntidad: '' }],
      },
    };
    const validation = validateInputJuridico(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendJuridico(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
