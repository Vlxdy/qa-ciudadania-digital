/**
 * avis-05 — Validación Zod: codigoPlantilla vacío
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInputAvisos, tryBuildAndSendAvisos, buildAvisosBody } from './helpers';

const META = {
  id: 'avis-05',
  name: 'codigoPlantilla vacío — avisos',
  module: 'avisos' as const,
  tags: ['negative', 'validation', 'local', 'avisos'],
};

const EXPECTED = {
  success: false,
  validationFields: ['codigoPlantilla'],
};

export const scenario: Scenario = {
  ...META,
  description: 'codigoPlantilla vacío debe fallar validación Zod en el envío de avisos.',
  run: async (): Promise<ScenarioResult> => {
    const input = { ...buildAvisosBody(), codigoPlantilla: '' };
    const validation = validateInputAvisos(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendAvisos(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
