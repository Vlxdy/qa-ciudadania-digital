/**
 * nonce-02 — Sin header Authorization → 401
 */
import { randomUUID } from 'crypto';
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { nonceUrl } from './helpers';

const META = {
  id: 'nonce-02',
  name: 'Sin token — verificación de nonce',
  module: 'documentos-digitales' as const,
  tags: ['negative', 'auth', 'documentos-digitales', 'nonce'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Verificar nonce sin header Authorization debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(
        nonceUrl(),
        { nonce: randomUUID() },
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
