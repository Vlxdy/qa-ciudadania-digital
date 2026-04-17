/**
 * qran-01 — Happy Path: generar QR, confirmarlo y luego anularlo
 *
 * Fase 1: POST /api/qr/generar → debe retornar 201.
 * Fase 2: POST /api/qr/confirmacion con el mismo codigoTransaccion → debe retornar 200.
 * Fase 3: POST /api/qr/anulacion con el mismo codigoTransaccion → debe retornar 202.
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildQrSeguroBody, qrSeguroUrl, defaultToken as generacionToken } from '../helpers';
import { confirmacionUrl, defaultToken as confirmacionToken } from '../confirmacion/helpers';
import { anulacionUrl, defaultToken } from './helpers';

const META = {
  id: 'qran-01',
  name: 'Happy Path — anulación de QR',
  module: 'qr-seguro' as const,
  tags: ['happy', 'qr-seguro', 'anulacion'],
};

const EXPECTED = {
  success: true,
  httpStatus: 202,
  bodyContains: ['finalizado'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Generar un QR (201), confirmarlo (200) y anularlo con el mismo codigoTransaccion debe retornar 202.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const transaccionBody = { codigoTransaccion: '' };

      // Fase 1: generar QR
      const generacionBody = buildQrSeguroBody();
      transaccionBody.codigoTransaccion = generacionBody.codigoTransaccion;
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

      // Fase 2: confirmar el QR generado
      const confirmacionResponse = await qaPost(
        confirmacionUrl(),
        transaccionBody,
        {
          Authorization: `Bearer ${confirmacionToken()}`,
          'Content-Type': 'application/json',
        },
      );

      if (confirmacionResponse.localError || (confirmacionResponse.httpStatus !== undefined && confirmacionResponse.httpStatus >= 400)) {
        return makeResult(META, {
          ...confirmacionResponse,
          localError: `Fase 2 (confirmación) falló con ${confirmacionResponse.httpStatus ?? 'error de red'}: ${confirmacionResponse.localError ?? ''}`.trim(),
        }, EXPECTED);
      }

      // Fase 3: anular el QR confirmado
      const response = await qaPost(
        anulacionUrl(),
        transaccionBody,
        {
          Authorization: `Bearer ${defaultToken()}`,
          'Content-Type': 'application/json',
        },
      );

      return makeResult(META, {
        ...response,
        durationMs: Date.now() - start,
        body: {
          generacion: generacionResponse.body,
          confirmacion: confirmacionResponse.body,
          anulacion: response.body,
        },
      }, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
