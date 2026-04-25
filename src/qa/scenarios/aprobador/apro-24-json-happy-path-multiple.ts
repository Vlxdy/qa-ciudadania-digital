/**
 * apro-24 — Happy Path Multiple: 2 JSONs válidos.
 * Flujo completo: POST /api/solicitudes/multiples → obtener link → aprobar vía Playwright.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildMultipleBody, multipleUrl, defaultToken, fixtures } from './helpers';
import { QaPlaywrightApprovalService } from '../../services/qa-playwright-approval.service';
import { ensureAccessToken } from '../proveedor/services/token-provider';

const META = {
  id: 'apro-24',
  name: 'Happy Path — Multiple JSONs',
  module: 'aprobador' as const,
  tags: ['happy', 'multiple', 'json', 'auth'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['link'],
};

export const scenario: Scenario = {
  ...META,
  description:
    '2 JSONs válidos en modo múltiple: envía solicitud, obtiene link y completa aprobación vía Playwright.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    let response: Awaited<ReturnType<typeof qaPost>> | undefined;
    try {
      const accessToken = await ensureAccessToken();

      const body = buildMultipleBody([fixtures.validJson, fixtures.validJson], { accessToken });
      response = await qaPost(multipleUrl(), body, {
        Authorization: `Bearer ${defaultToken()}`,
        'Content-Type': 'application/json',
      });

      if (response.localError || (response.httpStatus !== undefined && response.httpStatus >= 400)) {
        return makeResult(META, response, EXPECTED);
      }

      const approvalResult = await QaPlaywrightApprovalService.process(
        response.body,
        accessToken,
      );

      return makeResult(
        META,
        {
          httpStatus: response.httpStatus,
          request: response.request,
          durationMs: Date.now() - start,
          body: {
            solicitudResponse: response.body,
            aprobacion: approvalResult,
          },
        },
        EXPECTED,
      );
    } catch (err) {
      return makeResult(
        META,
        {
          localError: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - start,
          request: response?.request,
          ...(response !== undefined
            ? { httpStatus: response.httpStatus, body: { solicitudResponse: response.body } }
            : {}),
        },
        EXPECTED,
      );
    }
  },
};
