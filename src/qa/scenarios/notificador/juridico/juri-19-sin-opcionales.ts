/**
 * juri-19 — Sin campos opcionales: sin datosAdicionalesEntidad ni entidadNotificadora
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildBodyJuridicoAsync, notificadorJuridicoUrl, defaultJuridicoToken, BASE_JURIDICO } from './helpers';
import type { NotificacionJuridicoInput } from '../../../../schemas/notification-juridico.schema';

const META = {
  id: 'juri-19',
  name: 'Sin campos opcionales — jurídico',
  module: 'notificador' as const,
  tags: ['positive', 'structure', 'juridico'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
};

export const scenario: Scenario = {
  ...META,
  description: 'Notificación jurídica sin datosAdicionalesEntidad ni entidadNotificadora debe ser aceptada.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const { datosAdicionalesEntidad: _dae, entidadNotificadora: _ent, ...notificacionSinOpcionales } =
        BASE_JURIDICO.notificacion;
      const input: NotificacionJuridicoInput = { notificacion: notificacionSinOpcionales };

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
