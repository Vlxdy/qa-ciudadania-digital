/**
 * avis-09 — Validación Zod: uuidCiudadano vacío (no es UUID válido)
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInputAvisos, tryBuildAndSendAvisos, buildAvisosBody } from './helpers';

const META = {
  id: 'avis-09',
  name: 'uuidCiudadano vacío — avisos',
  module: 'avisos' as const,
  tags: ['negative', 'validation', 'local', 'avisos'],
};

const EXPECTED = {
  success: false,
  validationFields: ['envios.0.uuidCiudadano'],
};

export const scenario: Scenario = {
  ...META,
  description: 'uuidCiudadano vacío o inválido en el primer elemento de envios debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const base = buildAvisosBody();
    const input = {
      ...base,
      envios: [{ ...base.envios[0], uuidCiudadano: '' }],
    };
    const validation = validateInputAvisos(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendAvisos(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
