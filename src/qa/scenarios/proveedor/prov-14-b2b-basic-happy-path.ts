/**
 * prov-14 — B2B Happy Path (segunda forma): Authorization: Basic header.
 * grant_type=client_credentials, credenciales en cabecera Base64(client_id:client_secret).
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPostForm } from '../../http/qa-http';
import { buildB2bPayload, tokenUrl } from './helpers';

const META = {
  id: 'prov-14',
  name: 'B2B Client Credentials — Basic (header)',
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
    'Client Credentials (segunda forma): Authorization Basic con Base64(client_id:client_secret). Debe retornar 200 con access_token.',
  run: async (): Promise<ScenarioResult> => {
    const { payload, headers } = buildB2bPayload({ authMethod: 'basic' });
    const response = await qaPostForm(tokenUrl(), payload, headers);
    return makeResult(META, response, EXPECTED);
  },
};
