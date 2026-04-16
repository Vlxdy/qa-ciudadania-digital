/**
 * juri-09 — Validación Zod: notificados vacío (mínimo 1 entidad requerida)
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputJuridico, tryBuildAndSendJuridico, BASE_JURIDICO } from './helpers';

const META = {
  id: 'juri-09',
  name: 'Notificados vacío — mínimo 1 entidad jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'validation', 'local', 'juridico'],
};

const EXPECTED = {
  success: false,
  validationFields: ['notificacion.notificados'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Array notificados vacío en /juridico debe fallar Zod (mínimo 1 entidad).',
  run: async (): Promise<ScenarioResult> => {
    const input = { notificacion: { ...BASE_JURIDICO.notificacion, notificados: [] } };
    const validation = validateInputJuridico(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendJuridico(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
