/**
 * apro-05 — ACCESS_TOKEN ciudadanía expirado
 * El TOKEN_CLIENTE es correcto, pero el accessToken en el body está expirado.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildSingleBody, singleUrl, defaultToken, fixtures } from './helpers';

const META = {
  id: 'apro-05',
  name: 'ACCESS_TOKEN ciudadanía expirado',
  module: 'aprobador' as const,
  tags: ['negative', 'auth', 'token'],
};

// El servidor podría retornar 401 o 422 — ajustar según comportamiento real
const EXPECTED = {
  success: false,
};

export const scenario: Scenario = {
  ...META,
  description:
    'TOKEN_CLIENTE correcto pero accessToken expirado en el body debe ser rechazado.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      // JWT expirado simulado (payload con exp en el pasado)
      const expiredJwt =
        'eyJhbGciOiJSUzI1NiJ9.' +
        Buffer.from(JSON.stringify({ sub: 'qa', exp: 1 })).toString('base64') +
        '.FIRMA_INVALIDA';

      const body = buildSingleBody(fixtures.validPdf, { accessToken: expiredJwt });
      const response = await qaPost(singleUrl(), body, {
        Authorization: `Bearer ${defaultToken()}`,
        'Content-Type': 'application/json',
      });
      return makeResult(META, response, EXPECTED);
    } catch (err) {
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
