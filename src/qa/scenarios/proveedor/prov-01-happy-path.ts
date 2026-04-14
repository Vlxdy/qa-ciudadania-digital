/**
 * prov-01 — Happy Path: intercambio de código por token
 *
 * Requiere QA_OAUTH_CODE en el entorno (obtenido ejecutando npm run proveedor primero).
 * Si no está configurado, el escenario se marca como skip automáticamente.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPostForm } from '../../http/qa-http';
import { buildTokenPayload, tokenUrl } from './helpers';

const META = {
  id: 'prov-01',
  name: 'Happy Path — intercambio de código',
  module: 'proveedor' as const,
  tags: ['happy', 'auth', 'token'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ['access_token'],
};

export const scenario: Scenario = {
  ...META,
  description:
    'Código OAuth válido + credenciales correctas deben retornar 200 con access_token. ' +
    'Requiere QA_OAUTH_CODE=<code> en el entorno.',
  // Se activa solo si QA_OAUTH_CODE está disponible
  skip: !process.env.QA_OAUTH_CODE,
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const code = process.env.QA_OAUTH_CODE;
    if (!code) {
      return makeResult(META, {
        localError: 'QA_OAUTH_CODE no configurado — ejecutar npm run proveedor primero',
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
    const { payload, headers } = buildTokenPayload({ code });
    const response = await qaPostForm(tokenUrl(), payload, headers);
    return makeResult(META, response, EXPECTED);
  },
};
