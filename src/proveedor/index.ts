import dotenv from "dotenv";
import { runProveedorOAuth } from "./oauth-flow";
import { logger } from "../utils/logger.util";

dotenv.config();

async function main() {
  const shouldExchangeToken = !process.argv.includes("--no-token");
  const result = await runProveedorOAuth(shouldExchangeToken);

  if (!shouldExchangeToken) {
    logger.ok(
      "Callback capturado — intercambio de token omitido (--no-token)",
      1,
    );
    return;
  }

  logger.ok(
    "Token obtenido y guardado en output/proveedor/proveedor.token.json",
    1,
  );
  logger.debug("access_token", result.tokenResponse?.access_token, 1);
}

main().catch((error: any) => {
  logger.error(
    "Error en flujo proveedor",
    error.response?.data ?? error,
    0,
  );
  process.exit(1);
});
