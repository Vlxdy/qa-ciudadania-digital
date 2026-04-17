/**
 * nonce-01 — Happy Path: verificar un nonce válido y no utilizado
 *
 * Requiere DOC_DIGITAL_NONCE con un UUID fresco (uso único — regenerar antes de cada run).
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { nonceUrl, defaultToken, buildNonceBody } from './helpers';

const META = {
  id: 'nonce-01',
  name: 'Happy Path — verificación de nonce',
  module: 'documentos-digitales' as const,
  tags: ['happy', 'documentos-digitales', 'nonce'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['finalizado', 'tipoDocumento', 'numeroDocumento', 'fechaNacimiento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Verificar un nonce UUID válido y no utilizado debe retornar 201 con los datos del ciudadano.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const response = await qaPost(
        nonceUrl(),
        buildNonceBody(),
        {
          Authorization: `Bearer ${defaultToken()}`,
          'Content-Type': 'application/json',
        },
      );
      return makeResult(META, { ...response, durationMs: Date.now() - start }, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
