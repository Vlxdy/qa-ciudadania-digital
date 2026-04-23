/**
 * avis-08 — Validación Zod: array envios con más de 100 elementos
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInputAvisos, tryBuildAndSendAvisos, buildAvisosBody } from './helpers';
import { qaEnv } from '../../config/qa-env';

const META = {
  id: 'avis-08',
  name: 'envios excesivos (>100) — avisos',
  module: 'avisos' as const,
  tags: ['negative', 'validation', 'local', 'avisos'],
};

const EXPECTED = {
  success: false,
  validationFields: ['envios'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Array envios con 101 elementos debe fallar validación Zod: máximo 100 elementos.',
  run: async (): Promise<ScenarioResult> => {
    const enviosExcesivos = Array.from({ length: 101 }, (_, i) => ({
      uuidCiudadano: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
      parametros: [qaEnv.AVISOS_PARAMETRO_1],
    }));
    const input = { ...(await buildAvisosBody()), envios: enviosExcesivos };
    const validation = validateInputAvisos(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendAvisos(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
  skip: true
};
