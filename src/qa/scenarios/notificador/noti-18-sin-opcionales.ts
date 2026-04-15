/**
 * noti-18 — Sin campos opcionales: sin datosAdicionalesEntidad ni entidadNotificadora
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildBody, notificadorUrl, defaultToken, BASE_NOTIFICACION } from './helpers';
import type { NotificacionInput } from '../../../schemas/notification.schema';

const META = {
  id: 'noti-18',
  name: 'Sin campos opcionales',
  module: 'notificador' as const,
  tags: ['positive', 'structure'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
};

export const scenario: Scenario = {
  ...META,
  description: 'Notificación sin campos opcionales (sin datosAdicionalesEntidad ni entidadNotificadora) debe ser aceptada.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const { datosAdicionalesEntidad: _dae, entidadNotificadora: _ent, ...notificacionSinOpcionales } =
        BASE_NOTIFICACION.notificacion;
      const input: NotificacionInput = { notificacion: notificacionSinOpcionales };

      const body = buildBody(input);
      const response = await qaPost(notificadorUrl(), body, {
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
