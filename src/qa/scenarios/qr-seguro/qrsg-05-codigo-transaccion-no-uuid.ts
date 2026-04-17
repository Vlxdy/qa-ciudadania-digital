/**
 * qrsg-05 — Validación Zod: codigoTransaccion con valor que no es UUID v4
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInputQrSeguro, tryBuildAndSendQrSeguro, buildQrSeguroBody } from './helpers';

const META = {
  id: 'qrsg-05',
  name: 'codigoTransaccion no es UUID — qr-seguro',
  module: 'qr-seguro' as const,
  tags: ['negative', 'validation', 'local', 'qr-seguro'],
};

const EXPECTED = {
  success: false,
  validationFields: ['codigoTransaccion'],
};

export const scenario: Scenario = {
  ...META,
  description: 'codigoTransaccion con valor no UUID (ej: "TRANSACCION-001") debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const input = { ...(await buildQrSeguroBody()), codigoTransaccion: 'TRANSACCION-001-NO-UUID' };
    const validation = validateInputQrSeguro(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendQrSeguro(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
