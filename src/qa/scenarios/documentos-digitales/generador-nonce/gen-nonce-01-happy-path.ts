/**
 * gen-nonce-01 — Happy Path: generar nonce con codigoDocumento UUID válido
 *
 * Requiere DOC_DIGITAL_CODIGO_DOCUMENTO con el UUID del documento digital creado en Developer.
 * El access token del ciudadano se obtiene automáticamente del flujo OAuth si no está en el store.
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { generadorNonceUrl, buildGeneradorNonceBody } from './helpers';
import { ensureMobileAccessToken } from '../../proveedor/services/token-provider';

const META = {
  id: 'gen-nonce-01',
  name: 'Happy Path — generación de nonce',
  module: 'documentos-digitales' as const,
  tags: ['happy', 'documentos-digitales', 'generador-nonce'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['finalizado', 'nonce', 'nonceExpiracion', 'urlConsumo', 'tokenConsumo'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Generar nonce con codigoDocumento UUID válido debe retornar 201 con los datos del nonce.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const token = await ensureMobileAccessToken();
      const response = await qaPost(
        generadorNonceUrl(),
        buildGeneradorNonceBody(),
        {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      );
      return makeResult(META, { ...response, durationMs: Date.now() - start }, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
