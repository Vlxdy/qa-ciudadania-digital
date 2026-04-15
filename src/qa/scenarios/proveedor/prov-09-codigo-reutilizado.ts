/**
 * prov-09 — Código de autorización de un solo uso
 *
 * La documentación indica que el authorization code "es un código intermedio,
 * opaco y que puede ser usado solo una vez". Este escenario reutiliza el mismo
 * código ya canjeado por prov-01 y espera un rechazo del IDP.
 *
 * Requiere que prov-00 y prov-01 se hayan ejecutado antes en el mismo run.
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { qaPostForm } from "../../http/qa-http";
import { buildTokenPayload, tokenUrl } from "./helpers";
import { getProveedorSessionStore } from "./services/session.store";

const META = {
  id: "prov-09",
  name: "Código de autorización de un solo uso",
  module: "proveedor" as const,
  tags: ["negative", "security", "auth"],
};

const EXPECTED = {
  success: false,
  httpStatus: 400,
};

export const scenario: Scenario = {
  ...META,
  description:
    "Reutilizar el mismo authorization code (ya canjeado en prov-01) debe retornar 400 del IDP.",
  run: async (): Promise<ScenarioResult> => {
    const start = Date.now();
    const code = getProveedorSessionStore().runtime.lastAuthorizationCode;

    if (!code) {
      return makeResult(
        META,
        {
          localError:
            "No hay authorization code en el store. Ejecutar prov-00 y prov-01 primero.",
          durationMs: Date.now() - start,
        },
        EXPECTED,
      );
    }

    // El código fue consumido por prov-01. Intentar canjearlo de nuevo debe fallar.
    const { payload, headers } = buildTokenPayload({ code });
    const response = await qaPostForm(tokenUrl(), payload, headers);

    return makeResult(META, response, EXPECTED);
  },
  skip: true,
};
