/**
 * juri-22 — Con campo opcional entidadNotificadora
 * Verifica que la notificación puede salir con el nombre de otra entidad configurada.
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildBodyJuridicoAsync, notificadorJuridicoUrl, defaultJuridicoToken, BASE_JURIDICO } from './helpers';
import type { NotificacionJuridicoInput } from '../../../../schemas/notification-juridico.schema';
import { qaEnv } from '../../../config/qa-env';

const META = {
  id: 'juri-22',
  name: 'Con entidadNotificadora opcional — jurídico',
  module: 'notificador' as const,
  tags: ['positive', 'structure', 'juridico'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
};

export const scenario: Scenario = {
  ...META,
  description: 'Notificación jurídica con entidadNotificadora configurada debe ser aceptada y notificar con el nombre de la entidad indicada.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      // Usa la entidadNotificadora del .env si está disponible; si no, usa el código de la entidad principal
      const entidadNotificadora =
        qaEnv.NOTI_ENTIDAD_NOTIFICADORA || qaEnv.NOTI_JURIDICO_CODIGO_ENTIDAD;

      const input: NotificacionJuridicoInput = {
        notificacion: {
          ...BASE_JURIDICO.notificacion,
          entidadNotificadora,
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
