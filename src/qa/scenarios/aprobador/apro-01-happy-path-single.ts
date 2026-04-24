/**
 * apro-01 — Happy Path Single: PDF válido, tokens correctos.
 * Flujo completo:
 *   1. POST /api/solicitudes → obtener link
 *   2. Playwright navega al link y completa la aprobación
 *   3. (Opcional) Espera el callback webhook que el servidor envía tras procesar
 *
 * El paso 3 requiere que el QA Webhook interno esté habilitado (QA_WEBHOOK_ENABLED=true)
 * y que APRO_CALLBACK_PATH apunte a la ruta real del entorno.
 */
import type { Scenario, ScenarioResult } from '../../types/scenario.types';
import { makeResult } from '../../types/scenario.types';
import { qaPost } from '../../http/qa-http';
import { buildSingleBody, singleUrl, defaultToken, fixtures } from './helpers';
import { QaPlaywrightApprovalService } from '../../services/qa-playwright-approval.service';
import { ensureAccessToken } from '../proveedor/services/token-provider';
import { qaEnv } from '../../config/qa-env';
import { waitForCallback, isQaWebhookRunning, callbackCount, snapshotCallbacks } from '../../webhook';

const META = {
  id: 'apro-01',
  name: 'Happy Path — Single PDF',
  module: 'aprobador' as const,
  tags: ['happy', 'single', 'auth'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['link'],
};

export const scenario: Scenario = {
  ...META,
  description:
    'PDF válido: envía solicitud, aprueba vía Playwright y valida el callback webhook de confirmación.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const accessToken = await ensureAccessToken();
      const webhookStartIndex = callbackCount();

      const body = buildSingleBody(fixtures.validPdf, { accessToken });
      const response = await qaPost(singleUrl(), body, {
        Authorization: `Bearer ${defaultToken()}`,
        'Content-Type': 'application/json',
      });

      // Si la solicitud falló (4xx/5xx o error de red), retornar sin continuar
      if (response.localError || (response.httpStatus !== undefined && response.httpStatus >= 400)) {
        return makeResult(META, response, EXPECTED);
      }

      // Paso 2: Playwright navega al link y completa la aprobación
      const approvalResult = await QaPlaywrightApprovalService.process(
        response.body,
        accessToken,
      );

      // Paso 3: Esperar el callback webhook que el servidor envía tras procesar
      let webhookResult: import('../../types/scenario.types').WebhookCallbackResult | undefined;

      if (isQaWebhookRunning()) {
        const entry = await waitForCallback({
          path: qaEnv.APRO_CALLBACK_PATH,
          method: 'POST',
          afterIndex: webhookStartIndex,
          bodyExpect: { aceptado: true },
          timeoutMs: qaEnv.APRO_CALLBACK_TIMEOUT_MS,
        });

        webhookResult = {
          received: !!entry,
          path: qaEnv.APRO_CALLBACK_PATH,
          method: 'POST',
          timeoutMs: qaEnv.APRO_CALLBACK_TIMEOUT_MS,
          body: entry?.body,
          receivedAt: entry?.receivedAt,
          all: snapshotCallbacks().slice(webhookStartIndex).map((e) => ({
            path: e.path, method: e.method, body: e.body, receivedAt: e.receivedAt,
          })),
        };
      }

      return makeResult(
        META,
        {
          httpStatus: response.httpStatus,
          request: response.request,
          durationMs: Date.now() - start,
          body: { solicitudResponse: response.body, aprobacion: approvalResult },
          webhookResult,
          ...(webhookResult && !webhookResult.received
            ? { localError: `No llegó callback en ${qaEnv.APRO_CALLBACK_PATH} dentro de ${qaEnv.APRO_CALLBACK_TIMEOUT_MS}ms` }
            : {}),
        },
        EXPECTED,
      );
    } catch (err) {
      return makeResult(
        META,
        {
          localError: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - start,
        },
        EXPECTED,
      );
    }
  },
};
