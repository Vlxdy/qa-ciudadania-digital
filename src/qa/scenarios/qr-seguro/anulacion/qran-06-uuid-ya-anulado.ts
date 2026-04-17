/**
 * qran-06 — Anular dos veces el mismo QR (409 en la segunda anulación)
 *
 * Fase 1: generar QR → 201
 * Fase 2: primera anulación → 202
 * Fase 3: segunda anulación con el mismo UUID → 409
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildQrSeguroBody, qrSeguroUrl, defaultToken as generacionToken } from '../helpers';
import { anulacionUrl, defaultToken } from './helpers';

const META = {
  id: 'qran-06',
  name: 'QR ya anulado — segunda anulación',
  module: 'qr-seguro' as const,
  tags: ['negative', 'server', 'qr-seguro', 'anulacion'],
};

const EXPECTED = {
  success: false,
  httpStatus: 409,
};

export const scenario: Scenario = {
  ...META,
  description: 'Anular un QR dos veces con el mismo codigoTransaccion debe retornar 409 en la segunda anulación.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const headers = {
        Authorization: `Bearer ${defaultToken()}`,
        'Content-Type': 'application/json',
      };

      // Fase 1: generar QR
      const generacionBody = buildQrSeguroBody();
      const generacionResponse = await qaPost(qrSeguroUrl(), generacionBody, {
        Authorization: `Bearer ${generacionToken()}`,
        'Content-Type': 'application/json',
      });

      if (generacionResponse.localError || (generacionResponse.httpStatus !== undefined && generacionResponse.httpStatus >= 400)) {
        return makeResult(META, {
          ...generacionResponse,
          localError: `Fase 1 (generación) falló con ${generacionResponse.httpStatus ?? 'error de red'}: ${generacionResponse.localError ?? ''}`.trim(),
        }, EXPECTED);
      }

      const body = { codigoTransaccion: generacionBody.codigoTransaccion };

      // Fase 2: primera anulación (debe ser 202)
      await qaPost(anulacionUrl(), body, headers);

      // Fase 3: segunda anulación — debe ser 409
      const response = await qaPost(anulacionUrl(), body, headers);

      return makeResult(META, { ...response, durationMs: Date.now() - start }, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
