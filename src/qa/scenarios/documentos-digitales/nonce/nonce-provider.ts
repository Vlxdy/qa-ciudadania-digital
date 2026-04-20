import { ensureMobileAccessToken } from '../../proveedor/services/token-provider';
import { qaPost } from '../../../http/qa-http';
import { generadorNonceUrl, buildGeneradorNonceBody } from '../generador-nonce/helpers';

export interface NonceResult {
  nonce: string;
  genNonceResponse: {
    httpStatus?: number;
    body?: unknown;
    localError?: string;
    durationMs: number;
  };
}

export async function ensureNonce(): Promise<NonceResult> {
  const token = await ensureMobileAccessToken();
  const response = await qaPost(
    generadorNonceUrl(),
    buildGeneradorNonceBody(),
    {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  );

  const genNonceResponse = {
    httpStatus: response.httpStatus,
    body: response.body,
    localError: response.localError,
    durationMs: response.durationMs,
  };

  if (response.localError) {
    throw Object.assign(
      new Error(`Error de red al generar nonce: ${response.localError}`),
      { genNonceResponse },
    );
  }
  if (response.httpStatus !== 201) {
    throw Object.assign(
      new Error(`Generador de nonce respondió ${response.httpStatus}: ${JSON.stringify(response.body)}`),
      { genNonceResponse },
    );
  }

  const datos = (response.body as Record<string, unknown>)?.datos as Record<string, unknown> | undefined;
  const nonce = datos?.nonce;
  if (typeof nonce !== 'string' || !nonce) {
    throw Object.assign(
      new Error(`Campo datos.nonce no encontrado en la respuesta: ${JSON.stringify(response.body)}`),
      { genNonceResponse },
    );
  }

  return { nonce, genNonceResponse };
}
