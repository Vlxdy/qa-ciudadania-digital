/**
 * obl-req-01 — Happy Path: notificación válida de carácter obligatorio requerimiento
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildValidBodyAsync, notificadorOblReqUrl, oblReqToken } from './helpers';
import { codigosStore } from '../codigos-store';

const META = {
  id: 'obl-req-01',
  name: 'Happy Path — obligatorio requerimiento',
  module: 'notificador' as const,
  tags: ['happy', 'obligatorio-requerimiento'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['codigoSeguimiento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Notificación de carácter obligatorio requerimiento con token correcto debe retornar 201.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const url = notificadorOblReqUrl();
      const token = oblReqToken();

      if (!url.startsWith('https') || !token) {
        return makeResult(META, {
          localError: 'ISSUER_NOTIFICADOR_OBL_REQ o TOKEN_CONFIGURACION_OBL_REQ no configurados.',
          durationMs: Date.now() - start,
        }, EXPECTED);
      }

      const body = await buildValidBodyAsync();
      const response = await qaPost(url, body, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
      const codigo = (response.body as any)?.datos?.codigoSeguimiento;
      if (codigo) codigosStore.codigoSeguimientoNatural = codigo;
      return makeResult(META, response, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
