import dotenv from "dotenv";
import { runProveedorOAuth } from "./oauth-flow";

dotenv.config();

async function main() {
  const shouldExchangeToken = !process.argv.includes("--no-token");
  const result = await runProveedorOAuth(shouldExchangeToken);

  if (!shouldExchangeToken) {
    console.log(
      "✅ Callback capturado (sin intercambio de token por --no-token).",
    );
    return;
  }

  console.log("✅ Token obtenido y guardado en output/proveedor.token.json");
  console.log("access_token:", result.tokenResponse?.access_token);
}

main().catch((error: any) => {
  console.error("❌ Error en flujo proveedor:");
  console.error(error.response?.data || error.message);
  process.exit(1);
});
