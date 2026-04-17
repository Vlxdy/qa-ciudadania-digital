/**
 * gen-nonce-05 — Validación Zod: codigoDocumento con valor que no es UUID v4 → error local + 400
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputGeneradorNonce, tryBuildAndSendGeneradorNonce } from './helpers';

const META = {
  id: 'gen-nonce-05',
  name: 'codigoDocumento no es UUID — generación de nonce',
  module: 'documentos-digitales' as const,
  tags: ['negative', 'validation', 'local', 'documentos-digitales', 'generador-nonce'],
};

const EXPECTED = {
  success: false,
  validationFields: ['codigoDocumento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'codigoDocumento con valor no UUID (ej: "DOC-001") debe fallar la validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const input = { codigoDocumento: 'DOC-001-NO-UUID' };
    const validation = validateInputGeneradorNonce(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendGeneradorNonce(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
