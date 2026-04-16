/**
 * renv-01 — Happy Path: reenvío webhook de notificación a persona natural
 *
 * El codigoSeguimiento lo aporta noti-01 automáticamente (store en memoria).
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { reenvioUrl, defaultToken } from './helpers';
import { codigosStore } from '../codigos-store';

const META = {
  id: 'renv-01',
  name: 'Happy Path — reenvío webhook notificación natural',
  module: 'notificador' as const,
  tags: ['happy', 'reenvio'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['codigoSeguimiento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Reenvío del evento webhook de la notificación creada por noti-01. Retorna 201 con codigoSeguimiento y entregas.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const codigo = codigosStore.codigoSeguimientoNatural;
    if (!codigo) {
      return makeResult(META, {
        localError: 'codigoSeguimiento no disponible — ejecuta noti-01 antes o corre todos los escenarios sin filtro',
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
