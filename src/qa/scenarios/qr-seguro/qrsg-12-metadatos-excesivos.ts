/**
 * qrsg-12 — Validación Zod: metadatos con más de 20 ítems
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInputQrSeguro, tryBuildAndSendQrSeguro, buildQrSeguroBody } from './helpers';

const META = {
  id: 'qrsg-12',
  name: 'metadatos excesivos (>20) — qr-seguro',
  module: 'qr-seguro' as const,
  tags: ['negative', 'validation', 'local', 'qr-seguro'],
};

const EXPECTED = {
  success: false,
  validationFields: ['documentoDigital.metadatos'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Array metadatos con 21 ítems debe fallar validación Zod: máximo 20 ítems.',
  run: async (): Promise<ScenarioResult> => {
    const base = await buildQrSeguroBody();
    const metadatosExcesivos = Array.from({ length: 21 }, (_, i) => ({
      clave: `clave${i + 1}`,
      valor: `valor${i + 1}`,
    }));
    const input = {
      ...base,
      documentoDigital: { ...base.documentoDigital, metadatos: metadatosExcesivos },
    };
    const validation = validateInputQrSeguro(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendQrSeguro(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
