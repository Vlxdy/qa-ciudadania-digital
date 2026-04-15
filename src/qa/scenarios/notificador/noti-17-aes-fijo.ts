/**
 * noti-17 — AES key fija (USE_FIXED_AES)
 * Modo reproducible para debug: misma llave y IV siempre produce el mismo ciphertext.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildValidBodyAsync, notificadorUrl, defaultToken } from './helpers';
import { qaEnv } from '../../config/qa-env';

const META = {
  id: 'noti-17',
  name: 'AES key/IV fijos — modo reproducible',
  module: 'notificador' as const,
  tags: ['positive', 'crypto', 'config'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
};

// Llave e IV fijos de ejemplo (64 y 32 hex chars respectivamente)
const FIXED_KEY = 'a'.repeat(64); // 32 bytes
const FIXED_IV  = 'b'.repeat(32); // 16 bytes

export const scenario: Scenario = {
  ...META,
  description: 'Notificación con AES key/IV fijos debe producir ciphertext reproducible y ser aceptada.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      // buildValidBodyAsync calcula hashes reales y usa el padding correcto del .env
      const body = await buildValidBodyAsync(qaEnv.RSA_PADDING, FIXED_KEY, FIXED_IV);
      const response = await qaPost(notificadorUrl(), body, {
        Authorization: `Bearer ${defaultToken()}`,
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
