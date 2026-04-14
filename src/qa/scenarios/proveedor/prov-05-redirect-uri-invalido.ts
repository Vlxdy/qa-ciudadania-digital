/**
 * prov-05 — Redirect URI no registrado
 */
import type { Scenario, ScenarioResult } from "../../types/scenario.types";
import { makeResult } from "../../types/scenario.types";
import { qaPostForm } from "../../http/qa-http";
import { buildTokenPayload, tokenUrl } from "./helpers";

const META = {
  id: "prov-05",
  name: "Redirect URI no registrado",
  module: "proveedor" as const,
  tags: ["negative", "auth"],
};

const EXPECTED = {
  success: false,
  httpStatus: 400,
};

export const scenario: Scenario = {
  ...META,
  description:
    "Un redirect_uri no registrado en el IDP debe retornar 400 con error de redirect_uri.",
  run: async (): Promise<ScenarioResult> => {
    const { payload, headers } = buildTokenPayload({
      redirectUri: "https://malicioso.ejemplo.com/callback",
      code: undefined,
    });
    const response = await qaPostForm(tokenUrl(), payload, headers);
    return makeResult(META, response, EXPECTED);
  },
};
