/**
 * apro-02 — Happy Path Multiple: 2 PDFs válidos.
 * Flujo completo: POST /api/solicitudes/multiples → obtener link → aprobar vía Playwright.
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { qaPost } from "../../http/qa-http";
import {
  buildMultipleBody,
  multipleUrl,
  defaultToken,
  fixtures,
} from "./helpers";
import { QaPlaywrightApprovalService } from "../../services/qa-playwright-approval.service";
import { ensureAccessToken } from "../proveedor/services/token-provider";

const META = {
  id: "apro-02",
  name: "Happy Path — Multiple PDFs",
  module: "aprobador" as const,
  tags: ["happy", "multiple", "auth"],
};

const EXPECTED = {
  success: true,
  httpStatus: 201,
  bodyContains: ["link"],
};

export const scenario: Scenario = {
  ...META,
  description:
    "2 PDFs válidos en modo múltiple: envía solicitud, obtiene link y completa aprobación vía Playwright.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    try {
      const accessToken = await ensureAccessToken();

      const body = buildMultipleBody([fixtures.validPdf, fixtures.validPdf], {
        accessToken,
      });
      const response = await qaPost(multipleUrl(), body, {
        Authorization: `Bearer ${defaultToken()}`,
        "Content-Type": "application/json",
      });

      // Si la solicitud falló (4xx/5xx o error de red), retornar sin intentar aprobación
      if (
        response.localError ||
        (response.httpStatus !== undefined && response.httpStatus >= 400)
      ) {
        return makeResult(META, response, EXPECTED);
      }

      // Flujo completo: Playwright navega al link y completa la aprobación
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
        },
        EXPECTED,
      );
    }
  },
};
