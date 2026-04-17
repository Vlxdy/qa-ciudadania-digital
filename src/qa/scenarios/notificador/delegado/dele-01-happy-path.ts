/**
 * dele-01 — Happy Path: solicitud de delegado válida + aprobación vía Playwright
 *
 * Fase 1: POST /api/delegado/representante_legal → debe retornar 201 con codigoSeguimiento.
 * Fase 2: Playwright navega al portal de aprobación y ejecuta el flujo de aprobación.
 *         Requiere DELEGADO_APPROVAL_URL_BASE configurado en el entorno.
 *         Si no está configurado, la fase 2 se omite y solo se valida la fase 1.
 */
import type { Scenario, ScenarioResult } from '../../../types/scenario.types';
import { makeResult } from '../../../types/scenario.types';
import { qaPost } from '../../../http/qa-http';
import { buildValidBodyDelegado, delegadoUrl, defaultToken } from './helpers';
import { QaPlaywrightDelegadoApprovalService } from '../../../services/qa-playwright-delegado-approval.service';
import { getProveedorSessionStore } from '../../proveedor/services/session.store';
import { qaEnv } from '../../../config/qa-env';

const META = {
  id: 'dele-01',
  name: 'Happy Path — solicitud de delegado + aprobación Playwright',
  module: 'notificador' as const,
  tags: ['happy', 'delegado', 'playwright'],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ['codigoSeguimiento', 'numeroDocumento'],
};

export const scenario: Scenario = {
  ...META,
  description: 'Solicitud válida de delegado debe retornar 201 con codigoSeguimiento y, si DELEGADO_APPROVAL_URL_BASE está configurado, completar la aprobación vía Playwright.',
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      // ── Fase 1: solicitud de delegado ──────────────────────────────────────
      const body = buildValidBodyDelegado();
      const response = await qaPost(delegadoUrl(), body, {
        Authorization: `Bearer ${defaultToken()}`,
        'Content-Type': 'application/json',
      });

      // Si la solicitud falló (4xx/5xx o error de red), retornar sin intentar aprobación
      if (response.localError || (response.httpStatus !== undefined && response.httpStatus >= 400)) {
        return makeResult(META, response, EXPECTED);
      }

      // ── Fase 2: aprobación vía Playwright ──────────────────────────────────
      const accessToken =
        getProveedorSessionStore().runtime.accessToken ?? qaEnv.ACCESS_TOKEN_CIUDADANIA;

      const approvalResult = await QaPlaywrightDelegadoApprovalService.process(
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
      return makeResult(META, {
        localError: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }, EXPECTED);
    }
  },
};
