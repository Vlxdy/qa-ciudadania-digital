/**
 * obl-req-00 — Aceptación: habilita la recepción de notificaciones obligatorio requerimiento
 * para el ciudadano notificado. Debe ejecutarse antes de obl-req-01.
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPatch } from '../../../http/qa-http';
import { qaEnv } from '../../../config/qa-env';
import { notificadorOblReqUrl, oblReqToken } from './helpers';

const META = {
  id: 'obl-req-00',
  name: 'Aceptación — obligatorio requerimiento',
  module: 'notificador' as const,
  tags: ['happy', 'obligatorio-requerimiento', 'aceptacion'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ['finalizado'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Habilita la recepción de notificaciones obligatorio requerimiento para el ciudadano notificado (precondición de obl-req-01).',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const issuer = qaEnv.ISSUER_NOTIFICADOR_OBL_REQ;
      const token = oblReqToken();

      if (!issuer || !token) {
        return makeResult(META, {
          localError: 'ISSUER_NOTIFICADOR_OBL_REQ o TOKEN_CONFIGURACION_OBL_REQ no configurados.',
          durationMs: Date.now() - start,
        }, EXPECTED);
      }

      const url = `${issuer}/api/notificacion/aceptacion`;
      const body = {
        tipoDocumento: qaEnv.NOTI_NOTIFICADO_TIPO_DOC,
        numeroDocumento: qaEnv.NOTI_NOTIFICADO_NUMERO_DOC,
        fechaNacimiento: qaEnv.NOTI_NOTIFICADO_FECHA_NAC,
        habilitado: true,
      };

      const response = await qaPatch(url, body, {
        Authorization: `Bearer ${token}`,
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
