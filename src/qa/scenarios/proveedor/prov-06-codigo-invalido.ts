/**
 * prov-06 — Código de autorización inválido/expirado
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPostForm } from '../../http/qa-http';
import { buildTokenPayload, tokenUrl } from './helpers';

const META = {
  id: 'prov-06',
  name: 'Código de autorización inválido',
  module: 'proveedor' as const,
  tags: ['negative', 'auth', 'token'],
};

const EXPECTED = {
  success: false,
  httpStatus: 400,
  bodyContains: ['invalid_grant'],
};

export const scenario: Scenario = {
  ...META,
  description:
    'Un código de autorización falso o expirado debe retornar 400 con invalid_grant.',
  run: async (): Promise<ScenarioResult> => {
    const { payload, headers } = buildTokenPayload({
      code: 'CODIGO_FALSO_QA_NO_EXISTE_' + Date.now(),
    });
    const response = await qaPostForm(tokenUrl(), payload, headers);
    return makeResult(META, response, EXPECTED);
  },
};
