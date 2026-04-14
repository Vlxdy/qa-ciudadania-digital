/**
 * prov-08 — Nonce mismatch (protección contra replay)
 *
 * Prueba la lógica LOCAL de validación de nonce de oauth-flow.ts.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateNonce } from './helpers';

const META = {
  id: 'prov-08',
  name: 'Nonce mismatch — protección replay',
  module: 'proveedor' as const,
  tags: ['negative', 'security', 'local'],
};

const EXPECTED = {
  success: false,
  errorMessage: 'Nonce inválido.',
};

export const scenario: Scenario = {
  ...META,
  description:
    'Si el nonce del callback no coincide con el enviado, debe lanzar error de replay.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const sentNonce = 'nonce_original_seguro';
    const receivedNonce = 'NONCE_DIFERENTE_REPLAY';

    const error = validateNonce(sentNonce, receivedNonce);
    if (error) {
      return makeResult(META, { localError: error, durationMs: Date.now() - start }, EXPECTED);
    }
    return makeResult(META, { durationMs: Date.now() - start }, EXPECTED);
  },
};
