/**
 * noti-15 — Clave RSA inválida: PEM con contenido incorrecto
 * Error local durante el cifrado (antes del HTTP).
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { buildBodyWithPem, readInvalidPem } from './helpers';

const META = {
  id: 'noti-15',
  name: 'Clave RSA inválida — error en cifrado',
  module: 'notificador' as const,
  tags: ['negative', 'crypto', 'local'],
};

const EXPECTED = {
  success: false,
  errorMessage: /key|PEM|invalid/i,
};

export const scenario: Scenario = {
  ...META,
  description:
    'PEM inválido en la clave pública RSA debe lanzar error local de cifrado.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const invalidPem = readInvalidPem();
      buildBodyWithPem(invalidPem); // Debe lanzar error de Node crypto
      // Si llega aquí, el cifrado aceptó la clave inválida
      return makeResult(META, { durationMs: Date.now() - start }, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
