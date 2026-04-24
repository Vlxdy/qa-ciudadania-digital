/**
 * obl-legal-01 — Happy Path: notificación válida de carácter obligatorio legal
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildValidBodyAsync, notificadorOblLegalUrl, oblLegalToken } from './helpers';
import { codigosStore } from '../codigos-store';
import { callbackCount, captureOblLegalWebhook } from '../helpers';

const META = {
  id: 'obl-legal-01',
  name: 'Happy Path — obligatorio legal',
  module: 'notificador' as const,
  tags: ['happy', 'obligatorio-legal'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['codigoSeguimiento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Notificación de carácter obligatorio legal con token correcto debe retornar 201.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const url = notificadorOblLegalUrl();
      const token = oblLegalToken();

      if (!url.startsWith('https') || !token) {
        return makeResult(META, {
          localError: 'ISSUER_NOTIFICADOR_OBL_LEGAL o TOKEN_CONFIGURACION_OBL_LEGAL no configurados.',
          durationMs: Date.now() - start,
        }, EXPECTED);
      }

      const webhookStartIndex = callbackCount();
      const body = await buildValidBodyAsync();
      const response = await qaPost(url, body, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
      const codigo = (response.body as any)?.datos?.codigoSeguimiento;
      if (codigo) codigosStore.codigoSeguimientoNatural = codigo;
      const webhookResult = await captureOblLegalWebhook(webhookStartIndex);
      return makeResult(META, { ...response, durationMs: Date.now() - start, webhookResult }, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
