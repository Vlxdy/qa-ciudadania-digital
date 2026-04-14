/**
 * noti-16 — RSA padding OAEP
 * Verifica si el servidor acepta bodies cifrados con OAEP en lugar de PKCS1.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildValidBody, notificadorUrl, defaultToken } from './helpers';

const META = {
  id: 'noti-16',
  name: 'RSA padding OAEP',
  module: 'notificador' as const,
  tags: ['config', 'crypto'],
};

// Ajustar según si el servidor soporta OAEP
const EXPECTED = {
  success: true,
  httpStatus: 200,
};

export const scenario: Scenario = {
  ...META,
  description:
    'Body cifrado con RSA-OAEP. Ajustar expected.success según soporte del servidor.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildValidBody('OAEP');
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
