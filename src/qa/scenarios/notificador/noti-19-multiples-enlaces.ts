/**
 * noti-19 — Múltiples enlaces con tipos FIRMA y APROBACION
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildBodyAsync, notificadorUrl, defaultToken, BASE_NOTIFICACION, callbackCount, captureNotiWebhook } from './helpers';
import type { NotificacionInput } from '../../../schemas/notification.schema';
import { qaEnv } from '../../config/qa-env';

const META = {
  id: 'noti-19',
  name: 'Múltiples enlaces — tipos mixtos',
  module: 'notificador' as const,
  tags: ['positive', 'structure'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
};

export const scenario: Scenario = {
  ...META,
  description: '3 enlaces con tipos FIRMA y APROBACION mezclados deben ser aceptados.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const webhookStartIndex = callbackCount();
      // FIRMA usa el PDF firmado digitalmente; APROBACION usa el enlace principal
      const enlaceAprobacion = BASE_NOTIFICACION.notificacion.enlaces[0];
      const enlaceFirma = {
        url: qaEnv.NOTI_ENLACE_FIRMA_URL,
        etiqueta: qaEnv.NOTI_ENLACE_FIRMA_ETIQUETA,
        tipo: 'FIRMA' as const,
        hash: qaEnv.NOTI_ENLACE_FIRMA_HASH || '',
      };
      const input: NotificacionInput = {
        notificacion: {
          ...BASE_NOTIFICACION.notificacion,
          enlaces: [
            { ...enlaceFirma, etiqueta: 'Enlace Firmado 1' },
            { ...enlaceAprobacion, etiqueta: 'Enlace Aprobacion', tipo: 'APROBACION' },
            { ...enlaceFirma, etiqueta: 'Enlace Firmado 2' },
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
