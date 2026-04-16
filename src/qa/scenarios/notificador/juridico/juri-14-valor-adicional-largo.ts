/**
 * juri-14 — Validación Zod: valor de datosAdicionalesEntidad > 100 chars
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputJuridico, tryBuildAndSendJuridico, BASE_JURIDICO } from './helpers';

const META = {
  id: 'juri-14',
  name: 'valor datosAdicionales > 100 chars — jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'juridico'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.datosAdicionalesEntidad'],
};

export const scenario: Scenario = {
  ...META,
  description: 'valor de datosAdicionalesEntidad con 101+ caracteres debe fallar Zod en /juridico.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      notificacion: {
        ...BASE_JURIDICO.notificacion,
        datosAdicionalesEntidad: [{ clave: 'clave-ok', valor: 'V'.repeat(101) }],
      },
    };
    const validation = validateInputJuridico(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendJuridico(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
