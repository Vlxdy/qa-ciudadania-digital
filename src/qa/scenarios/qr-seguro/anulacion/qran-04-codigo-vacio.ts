/**
 * qran-04 — Validación Zod: codigoTransaccion vacío
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputAnulacion, tryBuildAndSendAnulacion } from './helpers';

const META = {
  id: 'qran-04',
  name: 'codigoTransaccion vacío — anulación QR',
  module: 'qr-seguro' as const,
  tags: ['negative', 'validation', 'local', 'qr-seguro', 'anulacion'],
};

const EXPECTED = {
  success: false,
  validationFields: ['codigoTransaccion'],
};

export const scenario: Scenario = {
  ...META,
  description: 'codigoTransaccion vacío debe fallar validación Zod en la anulación de QR.',
  run: async (): Promise<ScenarioResult> => {
    const input = { codigoTransaccion: '' };
    const validation = validateInputAnulacion(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendAnulacion(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
