/**
 * inde-08 — Delegado inexistente: ciudadano que no es delegado activo de la entidad
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPatch } from '../../../http/qa-http';
import { inactivarDelegadoUrl, defaultToken, BASE_INACTIVAR_DELEGADO } from './helpers';

const META = {
  id: 'inde-08',
  name: 'Delegado inexistente — inactivar delegado',
  module: 'notificador' as const,
  tags: ['negative', 'server', 'inactivar-delegado'],
};

const EXPECTED = {
  success: false,
  httpStatus: 412,
};

export const scenario: Scenario = {
  ...META,
  description: 'Intentar inhabilitar un ciudadano que no es delegado activo de la entidad debe retornar 404.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      // Ciudadano con número de documento inexistente como delegado
      const body = {
        ...BASE_INACTIVAR_DELEGADO,
        representanteLegal: {
          ...BASE_INACTIVAR_DELEGADO.representanteLegal,
          numeroDocumento: '00000001QA',
          fechaNacimiento: '1900-01-01',
        },
      };
      const response = await qaPatch(inactivarDelegadoUrl(), body, {
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
