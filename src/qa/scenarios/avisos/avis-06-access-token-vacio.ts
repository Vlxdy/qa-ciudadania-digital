/**
 * avis-06 — Validación Zod: accessToken vacío
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInputAvisos, tryBuildAndSendAvisos, buildAvisosBody } from './helpers';

const META = {
  id: 'avis-06',
  name: 'accessToken vacío — avisos',
  module: 'avisos' as const,
  tags: ['negative', 'validation', 'local', 'avisos'],
};

const EXPECTED = {
  success: false,
  validationFields: ['accessToken'],
};

export const scenario: Scenario = {
  ...META,
  description: 'accessToken vacío (no pasa validación Zod min:1) en el envío de avisos.',
  run: async (): Promise<ScenarioResult> => {
    const input = { ...buildAvisosBody(), accessToken: '' };
    const validation = validateInputAvisos(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendAvisos(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
