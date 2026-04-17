/**
 * qrcf-05 — Validación Zod: codigoTransaccion con valor que no es UUID v4
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { validateInputConfirmacion, tryBuildAndSendConfirmacion } from './helpers';

const META = {
  id: 'qrcf-05',
  name: 'codigoTransaccion no es UUID — confirmación QR',
  module: 'qr-seguro' as const,
  tags: ['negative', 'validation', 'local', 'qr-seguro', 'confirmacion'],
};

const EXPECTED = {
  success: false,
  validationFields: ['codigoTransaccion'],
};

export const scenario: Scenario = {
  ...META,
  description: 'codigoTransaccion con valor no UUID (ej: "CONF-001") debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const input = { codigoTransaccion: 'CONF-001-NO-UUID' };
    const validation = validateInputConfirmacion(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendConfirmacion(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
