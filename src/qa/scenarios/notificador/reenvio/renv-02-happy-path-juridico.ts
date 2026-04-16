/**
 * renv-02 — Happy Path: reenvío webhook de notificación a entidad pública
 *
 * El codigoSeguimiento lo aporta juri-01 automáticamente (store en memoria).
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { reenvioUrl, defaultToken } from './helpers';
import { codigosStore } from '../codigos-store';

const META = {
  id: 'renv-02',
  name: 'Happy Path — reenvío webhook notificación jurídica',
  module: 'notificador' as const,
  tags: ['happy', 'reenvio', 'juridico'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['codigoSeguimiento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Reenvío del evento webhook de la notificación jurídica creada por juri-01. Retorna 201 con codigoSeguimiento y entregas.',
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
      const response = await qaPost(
        reenvioUrl(),
        { codigoSeguimiento: codigo },
        {
          Authorization: `Bearer ${defaultToken()}`,
          'Content-Type': 'application/json',
        },
      );
      return makeResult(META, response, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
