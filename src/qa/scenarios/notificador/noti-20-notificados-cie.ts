/**
 * noti-20 — Notificados con tipoDocumento CIE (Cédula de Identidad para Extranjeros)
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildBodyAsync, notificadorUrl, defaultToken, BASE_NOTIFICACION, callbackCount, captureNotiWebhook } from './helpers';
import { qaEnv } from '../../config/qa-env';
import type { NotificacionInput } from '../../../schemas/notification.schema';

const META = {
  id: 'noti-20',
  name: 'Notificados con tipoDocumento CIE',
  module: 'notificador' as const,
  tags: ['positive', 'structure'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
};

export const scenario: Scenario = {
  ...META,
  description: 'Notificado con CIE (extranjero) debe ser procesado igual que CI.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const webhookStartIndex = callbackCount();
      const input: NotificacionInput = {
        notificacion: {
          ...BASE_NOTIFICACION.notificacion,
          notificados: [
            {
              tipoDocumento: 'CIE',
              numeroDocumento: qaEnv.NOTI_NOTIFICADO_CIE_NUMERO_DOC,
              fechaNacimiento: qaEnv.NOTI_NOTIFICADO_CIE_FECHA_NAC,
            },
          ],
        },
      };

      const body = await buildBodyAsync(input);
      const response = await qaPost(notificadorUrl(), body, {
        Authorization: `Bearer ${defaultToken()}`,
        'Content-Type': 'application/json',
      });
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
