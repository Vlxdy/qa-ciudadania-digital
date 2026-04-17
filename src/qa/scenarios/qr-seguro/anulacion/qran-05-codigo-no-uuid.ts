/**
 * qran-05 — Validación Zod: codigoTransaccion con valor que no es UUID v4
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputAnulacion, tryBuildAndSendAnulacion } from './helpers';

const META = {
  id: 'qran-05',
  name: 'codigoTransaccion no es UUID — anulación QR',
  module: 'qr-seguro' as const,
  tags: ['negative', 'validation', 'local', 'qr-seguro', 'anulacion'],
};

const EXPECTED = {
  success: false,
  validationFields: ['codigoTransaccion'],
};

export const scenario: Scenario = {
  ...META,
  description: 'codigoTransaccion con valor no UUID (ej: "ANUL-001") debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const input = { codigoTransaccion: 'ANUL-001-NO-UUID' };
    const validation = validateInputAnulacion(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendAnulacion(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
