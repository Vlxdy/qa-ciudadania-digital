/**
 * qrcf-03 — Token erróneo en header Authorization
 */
import { randomUUID } from 'crypto';
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { confirmacionUrl } from './helpers';

const META = {
  id: 'qrcf-03',
  name: 'Token erróneo — confirmación QR',
  module: 'qr-seguro' as const,
  tags: ['negative', 'auth', 'qr-seguro', 'confirmacion'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Token Bearer incorrecto en la confirmación de QR debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(
        confirmacionUrl(),
        { codigoTransaccion: randomUUID() },
        {
          Authorization: 'Bearer TOKEN_INCORRECTO_QA_XYZ',
          'Content-Type': 'application/json',
        },
      );
      return makeResult(META, response, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
