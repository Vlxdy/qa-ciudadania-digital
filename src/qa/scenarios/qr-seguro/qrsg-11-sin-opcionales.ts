/**
 * qrsg-11 — Sin campos opcionales: sin descripcion, fechaExpiracion ni metadatos
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildQrSeguroBody, qrSeguroUrl, defaultToken } from './helpers';

const META = {
  id: 'qrsg-11',
  name: 'Sin campos opcionales — qr-seguro',
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
  description: 'Generación de QR sin descripcionDocumento, fechaExpiracion ni metadatos debe retornar 201.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const base = await buildQrSeguroBody();
      const body = {
        accessToken: base.accessToken,
        mostrarEnlace: base.mostrarEnlace,
        codigoTransaccion: base.codigoTransaccion,
        documentoDigital: {
          codigoDocumento: base.documentoDigital.codigoDocumento,
          nombreDocumento: base.documentoDigital.nombreDocumento,
          // Sin descripcionDocumento (opcional)
          validez: {
            fechaEmision: base.documentoDigital.validez.fechaEmision,
            // Sin fechaExpiracion (opcional)
          },
          titulares: base.documentoDigital.titulares,
          // Sin metadatos (opcional)
        },
      };
      const response = await qaPost(qrSeguroUrl(), body, {
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
