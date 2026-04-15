/**
 * noti-20 — Notificados con tipoDocumento CIE (Cédula de Identidad para Extranjeros)
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildBody, notificadorUrl, defaultToken, BASE_NOTIFICACION } from './helpers';
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
  httpStatus: 200,
};

export const scenario: Scenario = {
  ...META,
  description: 'Notificado con CIE (extranjero) debe ser procesado igual que CI.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
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
