/**
 * qrsg-09 — Validación Zod: array titulares vacío
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInputQrSeguro, tryBuildAndSendQrSeguro, buildQrSeguroBody } from './helpers';

const META = {
  id: 'qrsg-09',
  name: 'titulares vacío — qr-seguro',
  module: 'qr-seguro' as const,
  tags: ['negative', 'validation', 'local', 'qr-seguro'],
};

const EXPECTED = {
  success: false,
  validationFields: ['documentoDigital.titulares'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Array titulares vacío debe fallar validación Zod: se requiere al menos 1 titular.',
  run: async (): Promise<ScenarioResult> => {
    const base = buildQrSeguroBody();
    const input = {
      ...base,
      documentoDigital: { ...base.documentoDigital, titulares: [] },
    };
    const validation = validateInputQrSeguro(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendQrSeguro(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
