/**
 * qrsg-08 — Validación Zod: fechaEmision con formato incorrecto (YYYY-MM-DD en vez de DD/MM/YYYY)
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInputQrSeguro, tryBuildAndSendQrSeguro, buildQrSeguroBody } from './helpers';

const META = {
  id: 'qrsg-08',
  name: 'fechaEmision formato inválido — qr-seguro',
  module: 'qr-seguro' as const,
  tags: ['negative', 'validation', 'local', 'qr-seguro'],
};

const EXPECTED = {
  success: false,
  validationFields: ['documentoDigital.validez.fechaEmision'],
};

export const scenario: Scenario = {
  ...META,
  description: 'fechaEmision con formato YYYY-MM-DD (en lugar de DD/MM/YYYY) debe fallar validación Zod.',
  run: async (): Promise<ScenarioResult> => {
    const base = await buildQrSeguroBody();
    const input = {
      ...base,
      documentoDigital: {
        ...base.documentoDigital,
        validez: { ...base.documentoDigital.validez, fechaEmision: '2025-01-01' },
      },
    };
    const validation = validateInputQrSeguro(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendQrSeguro(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
