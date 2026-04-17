/**
 * qrsg-10 — Validación Zod: tipoDocumento del titular fuera de CI|CIE
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { validateInputQrSeguro, tryBuildAndSendQrSeguro, buildQrSeguroBody } from './helpers';

const META = {
  id: 'qrsg-10',
  name: 'tipoDocumento titular inválido — qr-seguro',
  module: 'qr-seguro' as const,
  tags: ['negative', 'validation', 'local', 'qr-seguro'],
};

const EXPECTED = {
  success: false,
  validationFields: ['documentoDigital.titulares.0.tipoDocumento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'tipoDocumento con valor no permitido (ej: PASAPORTE) en el primer titular debe fallar Zod.',
  run: async (): Promise<ScenarioResult> => {
    const base = await buildQrSeguroBody();
    const input = {
      ...base,
      documentoDigital: {
        ...base.documentoDigital,
        titulares: [{ ...base.documentoDigital.titulares[0], tipoDocumento: 'PASAPORTE' }],
      },
    };
    const validation = validateInputQrSeguro(input);
    const localError = validation.valid ? undefined : validation.error;
    const httpResult = await tryBuildAndSendQrSeguro(input);
    return makeResult(META, { ...httpResult, localError }, EXPECTED);
  },
};
