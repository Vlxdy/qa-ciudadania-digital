/**
 * gen-nonce-04 — Validación Zod: codigoDocumento vacío → error local + 400
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputGeneradorNonce, tryBuildAndSendGeneradorNonce } from './helpers';

const META = {
  id: 'gen-nonce-04',
  name: 'codigoDocumento vacío — generación de nonce',
  module: 'documentos-digitales' as const,
  tags: ['negative', 'validation', 'local', 'documentos-digitales', 'generador-nonce'],
};

const EXPECTED = {
  success: false,
  validationFields: ['codigoDocumento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'codigoDocumento vacío debe fallar la validación Zod en la generación de nonce.',
  run: async (): Promise<ScenarioResult> => {
    const input = { codigoDocumento: '' };
    const validation = validateInputGeneradorNonce(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendGeneradorNonce(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
