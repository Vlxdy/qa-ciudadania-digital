/**
 * esta-02 — Happy Path: consulta de estado de notificación a entidad pública
 *
 * El codigoSeguimiento lo aporta juri-01 automáticamente (store en memoria).
 * El runner ejecuta los escenarios en orden, por lo que juri-01 siempre corre antes.
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaGet } from '../../../http/qa-http';
import { estadoUrl, defaultToken } from './helpers';
import { codigosStore } from '../codigos-store';

const META = {
  id: 'esta-02',
  name: 'Happy Path — estado de notificación jurídica',
  module: 'notificador' as const,
  tags: ['happy', 'estado', 'juridico'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ['codigoSeguimiento', 'estado', 'notificados'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Consulta el estado de la notificación jurídica creada por juri-01. La respuesta debe incluir codigoEntidadNotificada en notificados.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const codigo = codigosStore.codigoSeguimientoJuridico;
    if (!codigo) {
      return makeResult(META, {
        localError: 'codigoSeguimiento jurídico no disponible — ejecuta juri-01 antes o corre todos los escenarios sin filtro',
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
    try {
      const response = await qaGet(estadoUrl(codigo), {
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
