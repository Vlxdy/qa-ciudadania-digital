/**
 * avis-07 — Validación Zod: array envios vacío
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInputAvisos, tryBuildAndSendAvisos, buildAvisosBody } from './helpers';

const META = {
  id: 'avis-07',
  name: 'envios array vacío — avisos',
  module: 'avisos' as const,
  tags: ['negative', 'validation', 'local', 'avisos'],
};

const EXPECTED = {
  success: false,
  validationFields: ['envios'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Array envios vacío debe fallar validación Zod: se requiere al menos 1 elemento.',
  run: async (): Promise<ScenarioResult> => {
    const input = { ...(await buildAvisosBody()), envios: [] };
    const validation = validateInputAvisos(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendAvisos(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  }, skip: true
};
