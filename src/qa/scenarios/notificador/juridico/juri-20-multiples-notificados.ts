/**
 * juri-20 — Múltiples entidades notificadas
 * Exclusivo del endpoint /juridico: envía notificación a 2 entidades simultáneamente.
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildBodyJuridicoAsync, notificadorJuridicoUrl, defaultJuridicoToken, BASE_JURIDICO } from './helpers';
import { qaEnv } from '../../../config/qa-env';
import type { NotificacionJuridicoInput } from '../../../../schemas/notification-juridico.schema';

const META = {
  id: 'juri-20',
  name: 'Múltiples entidades notificadas — jurídico',
  module: 'notificador' as const,
  tags: ['positive', 'structure', 'juridico'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['notificados'],
};

export const scenario: Scenario = {
  ...META,
  description: '2 entidades en notificados deben procesarse correctamente y aparecer en la respuesta.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const input: NotificacionJuridicoInput = {
        notificacion: {
          ...BASE_JURIDICO.notificacion,
          notificados: [
            { codigoEntidad: qaEnv.NOTI_JURIDICO_CODIGO_ENTIDAD },
            { codigoEntidad: qaEnv.NOTI_JURIDICO_CODIGO_ENTIDAD_2 },
          ],
        },
      };

      const body = await buildBodyJuridicoAsync(input);
      const response = await qaPost(notificadorJuridicoUrl(), body, {
        Authorization: `Bearer ${defaultJuridicoToken()}`,
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
