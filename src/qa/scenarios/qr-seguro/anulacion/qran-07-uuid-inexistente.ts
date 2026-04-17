/**
 * qran-07 — UUID válido pero sin QR generado previo (conflicto de transacción)
 */
import { randomUUID } from 'crypto';
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { anulacionUrl, defaultToken } from './helpers';

const META = {
  id: 'qran-07',
  name: 'UUID sin QR generado — anulación QR',
  module: 'qr-seguro' as const,
  tags: ['negative', 'server', 'qr-seguro', 'anulacion'],
};

const EXPECTED = {
  success: false,
  httpStatus: 409,
};

export const scenario: Scenario = {
  ...META,
  description: 'Anular un codigoTransaccion UUID válido que no tiene QR generado previo debe retornar 409.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(
        anulacionUrl(),
        { codigoTransaccion: randomUUID() },
        {
          Authorization: `Bearer ${defaultToken()}`,
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
