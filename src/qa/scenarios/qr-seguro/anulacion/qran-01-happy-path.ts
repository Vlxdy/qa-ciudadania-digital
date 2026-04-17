/**
 * qran-01 — Happy Path: generar QR y luego anularlo
 *
 * Fase 1: POST /api/qr/generar → debe retornar 201.
 * Fase 2: POST /api/qr/anulacion con el mismo codigoTransaccion → debe retornar 202.
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildQrSeguroBody, qrSeguroUrl, defaultToken as generacionToken } from '../helpers';
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
  description: 'Generar un QR (201) y anularlo con el mismo codigoTransaccion debe retornar 202 con finalizado:true.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      // Fase 1: generar QR para obtener un codigoTransaccion válido
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

      // Fase 2: anular con el mismo codigoTransaccion
      const response = await qaPost(
        anulacionUrl(),
        { codigoTransaccion: generacionBody.codigoTransaccion },
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
