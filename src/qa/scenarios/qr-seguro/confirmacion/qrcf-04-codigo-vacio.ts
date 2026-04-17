/**
 * qrcf-04 — Validación Zod: codigoTransaccion vacío (no es UUID)
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputConfirmacion, tryBuildAndSendConfirmacion } from './helpers';

const META = {
  id: 'qrcf-04',
  name: 'codigoTransaccion vacío — confirmación QR',
  module: 'qr-seguro' as const,
  tags: ['negative', 'validation', 'local', 'qr-seguro', 'confirmacion'],
};

const EXPECTED = {
  success: false,
  validationFields: ['codigoTransaccion'],
};

export const scenario: Scenario = {
  ...META,
  description: 'codigoTransaccion vacío debe fallar validación Zod en la confirmación de QR.',
  run: async (): Promise<ScenarioResult> => {
    const input = { codigoTransaccion: '' };
    const validation = validateInputConfirmacion(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendConfirmacion(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
