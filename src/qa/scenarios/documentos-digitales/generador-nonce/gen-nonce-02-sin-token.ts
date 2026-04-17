/**
 * gen-nonce-02 — Sin header Authorization → 401
 */
import { randomUUID } from 'crypto';
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { generadorNonceUrl } from './helpers';

const META = {
  id: 'gen-nonce-02',
  name: 'Sin token — generación de nonce',
  module: 'documentos-digitales' as const,
  tags: ['negative', 'auth', 'documentos-digitales', 'generador-nonce'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Generar nonce sin header Authorization debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(
        generadorNonceUrl(),
        { codigoDocumento: randomUUID() },
        { 'Content-Type': 'application/json' },
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
