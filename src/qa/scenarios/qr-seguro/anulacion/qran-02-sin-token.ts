/**
 * qran-02 — Sin token: omitir header Authorization
 */
import { randomUUID } from 'crypto';
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { anulacionUrl } from './helpers';

const META = {
  id: 'qran-02',
  name: 'Sin token — anulación QR',
  module: 'qr-seguro' as const,
  tags: ['negative', 'auth', 'qr-seguro', 'anulacion'],
};

const EXPECTED = {
  success: false,
  httpStatus: 401,
};

export const scenario: Scenario = {
  ...META,
  description: 'Omitir el header Authorization en la anulación de QR debe retornar 401.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(
        anulacionUrl(),
        { codigoTransaccion: randomUUID() },
        { 'Content-Type': 'application/json' }, // Sin Authorization
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
