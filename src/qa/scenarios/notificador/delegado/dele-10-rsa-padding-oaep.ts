/**
 * dele-10 — RSA padding OAEP en endpoint /delegado/representante_legal
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildValidBodyDelegado, delegadoUrl, defaultToken } from './helpers';

const META = {
  id: 'dele-10',
  name: 'RSA padding OAEP — delegado',
  module: 'notificador' as const,
  tags: ['config', 'crypto', 'delegado'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
};

export const scenario: Scenario = {
  ...META,
  description: 'Body de delegado cifrado con RSA-OAEP. Ajustar expected.success según soporte del servidor.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const body = buildValidBodyDelegado('OAEP');
      const response = await qaPost(delegadoUrl(), body, {
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
