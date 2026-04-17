/**
 * qrsg-13 — Conflicto: reutilizar el mismo codigoTransaccion en dos solicitudes
 *
 * La primera solicitud debe retornar 201. La segunda con el mismo UUID debe retornar 409.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildQrSeguroBody, qrSeguroUrl, defaultToken } from './helpers';
import { randomUUID } from 'crypto';

const META = {
  id: 'qrsg-13',
  name: 'UUID de transacción repetido — qr-seguro',
  module: 'qr-seguro' as const,
  tags: ['negative', 'server', 'qr-seguro'],
};

const EXPECTED = {
  success: false,
  httpStatus: 409,
};

export const scenario: Scenario = {
  ...META,
  description: 'Enviar dos solicitudes con el mismo codigoTransaccion UUID debe retornar 409 en la segunda.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const codigoTransaccion = randomUUID();
      const headers = {
        Authorization: `Bearer ${defaultToken()}`,
        'Content-Type': 'application/json',
      };

      // Primera solicitud — debe ser 201
      const bodyFirst = { ...buildQrSeguroBody(), codigoTransaccion };
      await qaPost(qrSeguroUrl(), bodyFirst, headers);

      // Segunda solicitud con el mismo UUID — debe ser 409
      const bodySecond = { ...buildQrSeguroBody(), codigoTransaccion };
      const response = await qaPost(qrSeguroUrl(), bodySecond, headers);

      return makeResult(META, response, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
