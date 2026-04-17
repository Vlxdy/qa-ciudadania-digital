/**
 * qrsg-01 — Happy Path: generación de QR válida completa
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildQrSeguroBody, qrSeguroUrl, defaultToken } from './helpers';

const META = {
  id: 'qrsg-01',
  name: 'Happy Path — generación de QR válida',
  module: 'qr-seguro' as const,
  tags: ['happy', 'qr-seguro'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['finalizado', 'qrImagen'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Solicitud POST válida para generación de QR debe retornar 201 con datos.qrImagen en base64.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(qrSeguroUrl(), await buildQrSeguroBody(), {
        Authorization: `Bearer ${defaultToken()}`,
        'Content-Type': 'application/json',
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
