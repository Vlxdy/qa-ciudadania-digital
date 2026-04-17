/**
 * qrsg-04 — Validación Zod: accessToken vacío en el body
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInputQrSeguro, tryBuildAndSendQrSeguro, buildQrSeguroBody } from './helpers';

const META = {
  id: 'qrsg-04',
  name: 'accessToken vacío — qr-seguro',
  module: 'qr-seguro' as const,
  tags: ['negative', 'validation', 'local', 'qr-seguro'],
};

const EXPECTED = {
  success: false,
  validationFields: ['accessToken'],
};

export const scenario: Scenario = {
  ...META,
  description: 'accessToken vacío en el body debe fallar validación Zod en la generación de QR.',
  run: async (): Promise<ScenarioResult> => {
    const input = { ...buildQrSeguroBody(), accessToken: '' };
    const validation = validateInputQrSeguro(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendQrSeguro(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
