/**
 * juri-18 — AES key fija en /juridico
 * Modo reproducible para debug: misma llave y IV siempre produce el mismo ciphertext.
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildValidBodyJuridicoAsync, notificadorJuridicoUrl, defaultJuridicoToken } from './helpers';
import { qaEnv } from '../../../config/qa-env';

const META = {
  id: 'juri-18',
  name: 'AES key/IV fijos — modo reproducible jurídico',
  module: 'notificador' as const,
  tags: ['positive', 'crypto', 'config', 'juridico'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
};

const FIXED_KEY = 'a'.repeat(64); // 32 bytes
const FIXED_IV  = 'b'.repeat(32); // 16 bytes

export const scenario: Scenario = {
  ...META,
  description: 'Notificación jurídica con AES key/IV fijos debe producir ciphertext reproducible y ser aceptada.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = await buildValidBodyJuridicoAsync(qaEnv.RSA_PADDING, FIXED_KEY, FIXED_IV);
      const response = await qaPost(notificadorJuridicoUrl(), body, {
        Authorization: `Bearer ${defaultJuridicoToken()}`,
        'Content-Type': 'application/json',
      });
      return makeResult(META, response, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
