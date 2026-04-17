/**
 * nonce-06 — UUID válido pero nonce no generado por el sistema (expirado o inexistente) → 409
 *
 * Un UUID aleatorio nunca fue generado por Ciudadanía Digital, por lo que
 * el servidor responde 409 (el nonce expiró o ya fue utilizado).
 */
import { randomUUID } from 'crypto';
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { nonceUrl, defaultToken } from './helpers';

const META = {
  id: 'nonce-06',
  name: 'Nonce expirado o inexistente — verificación de nonce',
  module: 'documentos-digitales' as const,
  tags: ['negative', 'server', 'documentos-digitales', 'nonce'],
};

const EXPECTED = {
  success: false,
  httpStatus: 409,
};

export const scenario: Scenario = {
  ...META,
  description: 'Verificar un UUID válido que no fue generado por el sistema debe retornar 409.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(
        nonceUrl(),
        { nonce: randomUUID() },
        {
          Authorization: `Bearer ${defaultToken()}`,
          'Content-Type': 'application/json',
        },
      );
      return makeResult(META, { ...response, durationMs: Date.now() - start }, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
