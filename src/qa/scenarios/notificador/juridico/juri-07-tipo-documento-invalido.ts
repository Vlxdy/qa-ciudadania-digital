/**
 * juri-07 — Validación Zod: tipoDocumento del notificador fuera de enum CI|CIE
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputJuridico, tryBuildAndSendJuridico, BASE_JURIDICO } from './helpers';

const META = {
  id: 'juri-07',
  name: 'tipoDocumento notificador inválido — jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'juridico'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.notificador.tipoDocumento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'tipoDocumento del notificador con valor no permitido debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      notificacion: {
        ...BASE_JURIDICO.notificacion,
        notificador: { ...BASE_JURIDICO.notificacion.notificador, tipoDocumento: 'PASAPORTE' },
      },
    };
    const validation = validateInputJuridico(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendJuridico(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
