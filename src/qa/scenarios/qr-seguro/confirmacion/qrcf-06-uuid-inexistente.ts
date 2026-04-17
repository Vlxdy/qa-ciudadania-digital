/**
 * qrcf-06 — UUID válido pero sin QR generado previo (conflicto de transacción)
 */
import { randomUUID } from 'crypto';
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { confirmacionUrl, defaultToken } from './helpers';

const META = {
  id: 'qrcf-06',
  name: 'UUID sin QR generado — confirmación QR',
  module: 'qr-seguro' as const,
  tags: ['negative', 'server', 'qr-seguro', 'confirmacion'],
};

const EXPECTED = {
  success: false,
  httpStatus: 409,
};

export const scenario: Scenario = {
  ...META,
  description: 'Confirmar un codigoTransaccion UUID válido que no tiene QR generado previo debe retornar 409.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(
        confirmacionUrl(),
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
