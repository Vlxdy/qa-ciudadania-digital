/**
 * qrcf-01 — Happy Path: generar QR y luego confirmarlo
 *
 * Fase 1: POST /api/qr/generar → debe retornar 201.
 * Fase 2: POST /api/qr/confirmacion con el mismo codigoTransaccion → debe retornar 200.
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildQrSeguroBody, qrSeguroUrl, defaultToken as generacionToken } from '../helpers';
import { confirmacionUrl, defaultToken } from './helpers';

const META = {
  id: 'qrcf-01',
  name: 'Happy Path — confirmación de QR',
  module: 'qr-seguro' as const,
  tags: ['happy', 'qr-seguro', 'confirmacion'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ['finalizado', 'codigoTransaccion'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Generar un QR (201) y confirmar el mismo codigoTransaccion debe retornar 200 con finalizado:true.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const headers = {
        Authorization: `Bearer ${defaultToken()}`,
        'Content-Type': 'application/json',
      };

      // Fase 1: generar QR para obtener un codigoTransaccion válido
      const generacionBody = await buildQrSeguroBody();
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

      // Fase 2: confirmar con el mismo codigoTransaccion
      const confirmBody = { codigoTransaccion: generacionBody.codigoTransaccion };
      const response = await qaPost(confirmacionUrl(), confirmBody, headers);

      return makeResult(META, {
        ...response,
        durationMs: Date.now() - start,
        body: {
          generacion: generacionResponse.body,
          confirmacion: response.body,
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
