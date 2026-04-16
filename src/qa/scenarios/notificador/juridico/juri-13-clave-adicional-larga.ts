/**
 * juri-13 — Validación Zod: clave de datosAdicionalesEntidad > 30 chars
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputJuridico, tryBuildAndSendJuridico, BASE_JURIDICO } from './helpers';

const META = {
  id: 'juri-13',
  name: 'clave datosAdicionales > 30 chars — jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'juridico'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.datosAdicionalesEntidad'],
};

export const scenario: Scenario = {
  ...META,
  description: 'clave de datosAdicionalesEntidad con 31+ caracteres debe fallar Zod en /juridico.',
  run: async (): Promise<ScenarioResult> => {
    const input = {
      notificacion: {
        ...BASE_JURIDICO.notificacion,
        datosAdicionalesEntidad: [{ clave: 'C'.repeat(31), valor: 'valor válido' }],
      },
    };
    const validation = validateInputJuridico(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendJuridico(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
