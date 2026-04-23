/**
 * prov-13 — B2B Happy Path (primera forma): client_id + client_secret en el body.
 * grant_type=client_credentials, credenciales en el body form-urlencoded.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPostForm } from '../../http/qa-http';
import { buildB2bPayload, tokenUrl } from './helpers';

const META = {
  id: 'prov-13',
  name: 'B2B Client Credentials — POST (body)',
  module: 'proveedor' as const,
  tags: ['happy', 'b2b', 'auth', 'token'],
};

const EXPECTED = {
  success: true,
  httpStatus: 200,
  bodyContains: ['access_token', 'expires_in', 'token_type'],
};

export const scenario: Scenario = {
  ...META,
  description:
    'Client Credentials (primera forma): client_id y client_secret en el body. Debe retornar 200 con access_token.',
  run: async (): Promise<ScenarioResult> => {
    const { payload, headers } = buildB2bPayload({ authMethod: 'post' });
    const response = await qaPostForm(tokenUrl(), payload, headers);
    return makeResult(META, response, EXPECTED);
  },
};
