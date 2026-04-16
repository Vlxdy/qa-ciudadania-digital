/**
 * comp-02 — Happy Path: comprobante de notificación a entidad pública
 *
 * El codigoSeguimiento lo aporta juri-01 automáticamente (store en memoria).
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaGet } from '../../../http/qa-http';
import { comprobanteUrl, defaultToken } from './helpers';
import { codigosStore } from '../codigos-store';

const META = {
  id: 'comp-02',
  name: 'Happy Path — comprobante de notificación jurídica',
  module: 'notificador' as const,
  tags: ['happy', 'comprobante', 'juridico'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ['notificados', 'codigoRegistro'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Consulta el comprobante de la notificación jurídica creada por juri-01. Retorna 201 con datos de registro y estado de lectura.',
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
      const response = await qaGet(comprobanteUrl(codigo), {
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
