/**
 * nonce-05 — Validación Zod: nonce con valor que no es UUID v4 → error local + 400
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputNonce, tryBuildAndSendNonce } from './helpers';

const META = {
  id: 'nonce-05',
  name: 'nonce no es UUID — verificación de nonce',
  module: 'documentos-digitales' as const,
  tags: ['negative', 'validation', 'local', 'documentos-digitales', 'nonce'],
};

const EXPECTED = {
  success: false,
  validationFields: ['nonce'],
};

export const scenario: Scenario = {
  ...META,
  description: 'nonce con valor no UUID (ej: "NONCE-001") debe fallar la validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const input = { nonce: 'NONCE-001-NO-UUID' };
    const validation = validateInputNonce(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendNonce(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
