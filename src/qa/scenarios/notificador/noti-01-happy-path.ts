/**
 * noti-01 — Happy Path: notificación válida completa
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildValidBodyAsync, notificadorUrl, defaultToken, callbackCount, captureNotiWebhook } from './helpers';
import { codigosStore } from './codigos-store';

const META = {
  id: 'noti-01',
  name: 'Happy Path — notificación válida',
  module: 'notificador' as const,
  tags: ['happy', 'auth'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['codigoSeguimiento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Notificación válida con token correcto debe retornar 200.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const webhookStartIndex = callbackCount();
      // buildValidBodyAsync descarga los PDFs de las URLs configuradas en NOTI_ENLACE_URL /
      // NOTI_FORMULARIO_URL y calcula sus hashes SHA-256 reales cuando NOTI_ENLACE_HASH /
      // NOTI_FORMULARIO_HASH están vacíos en el .env.
      const body = await buildValidBodyAsync();
      const response = await qaPost(notificadorUrl(), body, {
        Authorization: `Bearer ${defaultToken()}`,
        'Content-Type': 'application/json',
      });
      const codigo = (response.body as any)?.datos?.codigoSeguimiento;
      if (codigo) codigosStore.codigoSeguimientoNatural = codigo;
      const webhookResult = await captureNotiWebhook(webhookStartIndex);
      return makeResult(META, { ...response, durationMs: Date.now() - start, webhookResult }, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
