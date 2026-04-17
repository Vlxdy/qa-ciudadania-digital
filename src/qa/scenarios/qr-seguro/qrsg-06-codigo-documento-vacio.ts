/**
 * qrsg-06 — Validación Zod: codigoDocumento vacío
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInputQrSeguro, tryBuildAndSendQrSeguro, buildQrSeguroBody } from './helpers';

const META = {
  id: 'qrsg-06',
  name: 'codigoDocumento vacío — qr-seguro',
  module: 'qr-seguro' as const,
  tags: ['negative', 'validation', 'local', 'qr-seguro'],
};

const EXPECTED = {
  success: false,
  validationFields: ['documentoDigital.codigoDocumento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'codigoDocumento vacío en documentoDigital debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const base = await buildQrSeguroBody();
    const input = {
      ...base,
      documentoDigital: { ...base.documentoDigital, codigoDocumento: '' },
    };
    const validation = validateInputQrSeguro(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendQrSeguro(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
