/**
 * qrsg-02 — Sin token: omitir header Authorization
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildQrSeguroBody, qrSeguroUrl } from './helpers';

const META = {
  id: 'qrsg-02',
  name: 'Sin token — qr-seguro',
  module: 'qr-seguro' as const,
  tags: ['negative', 'auth', 'qr-seguro'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Omitir el header Authorization en la generación de QR debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(qrSeguroUrl(), await buildQrSeguroBody(), {
        'Content-Type': 'application/json',
        // Sin Authorization
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
