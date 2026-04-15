/**
 * noti-19 — Múltiples enlaces con tipos FIRMA y APROBACION
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildBody, notificadorUrl, defaultToken, BASE_NOTIFICACION } from './helpers';
import type { NotificacionInput } from '../../../schemas/notification.schema';

const META = {
  id: 'noti-19',
  name: 'Múltiples enlaces — tipos mixtos',
  module: 'notificador' as const,
  tags: ['positive', 'structure'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
};

export const scenario: Scenario = {
  ...META,
  description: '3 enlaces con tipos FIRMA y APROBACION mezclados deben ser aceptados.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const enlaceBase = BASE_NOTIFICACION.notificacion.enlaces[0];
      const input: NotificacionInput = {
        notificacion: {
          ...BASE_NOTIFICACION.notificacion,
          enlaces: [
            { ...enlaceBase, etiqueta: 'Enlace 1', tipo: 'FIRMA' },
            { ...enlaceBase, etiqueta: 'Enlace 2', tipo: 'APROBACION' },
            { ...enlaceBase, etiqueta: 'Enlace 3', tipo: 'FIRMA' },
          ],
        },
      };

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
