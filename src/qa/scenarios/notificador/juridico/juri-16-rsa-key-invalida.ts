/**
 * juri-16 — Clave RSA inválida: PEM con contenido incorrecto
 * Error local durante el cifrado (antes del HTTP).
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { buildBodyJuridicoWithPem, readInvalidPem } from './helpers';

const META = {
  id: 'juri-16',
  name: 'Clave RSA inválida — error en cifrado jurídico',
  module: 'notificador' as const,
  tags: ['negative', 'crypto', 'local', 'juridico'],
};

const EXPECTED = {
  success: false,
  errorMessage: /key|PEM|invalid/i,
};

export const scenario: Scenario = {
  ...META,
  description: 'PEM inválido en la clave pública RSA debe lanzar error local de cifrado en /juridico.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const invalidPem = readInvalidPem();
      buildBodyJuridicoWithPem(invalidPem); // Debe lanzar error de Node crypto
      return makeResult(META, { durationMs: Date.now() - start }, EXPECTED);
    } catch (err) {
      return makeResult(
        META,
        {
          localError: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - start,
        },
        EXPECTED,
      );
    }
  },
  skip: true,
};
