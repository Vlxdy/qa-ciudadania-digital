/**
 * juri-17 — RSA padding OAEP en endpoint /juridico
 * Verifica si el servidor acepta bodies cifrados con OAEP en lugar de PKCS1.
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildValidBodyJuridicoAsync, notificadorJuridicoUrl, defaultJuridicoToken } from './helpers';

const META = {
  id: 'juri-17',
  name: 'RSA padding OAEP — jurídico',
  module: 'notificador' as const,
  tags: ['config', 'crypto', 'juridico'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
};

export const scenario: Scenario = {
  ...META,
  description: 'Body jurídico cifrado con RSA-OAEP y hashes reales. Ajustar expected.success según soporte del servidor.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = await buildValidBodyJuridicoAsync('OAEP');
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
