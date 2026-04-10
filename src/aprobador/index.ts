import path from "path";
import dotenv from "dotenv";
import { AprobadorBuilder } from "./aprobador-builder";
import { AprobadorService } from "./aprobador.service";
import { CurlService } from "./services/curl.service";

dotenv.config();

const args = process.argv.slice(2);
const filePath = args[0];

if (!filePath) {
  throw new Error("Debes enviar un archivo (.pdf o .json)");
}

// argumento opcional
const descArg = args.find((a) => a.startsWith("--desc="));
const descripcion = descArg?.split("=")[1];

console.log("📄 Archivo recibido:", filePath);

const body = AprobadorBuilder.buildFromFile(
  filePath,
  process.env.ACCESS_TOKEN_CIUDADANIA!,
  descripcion,
);

console.log("🧾 Body generado:", JSON.stringify(body, null, 2));

const URL = process.env.APROBADOR_URL!;
const TOKEN = process.env.TOKEN_CLIENTE!;

const filenameBase = path.basename(filePath).replace(/\.(pdf|json)$/i, "");

const { bodyPath, curlPath } = CurlService.save(
  process.env.OUTPUT_DIR || "./output",
  body,
  URL,
  TOKEN,
  filenameBase,
);

console.log("📁 Body guardado en:", bodyPath);
console.log("📁 Curl guardado en:", curlPath);

(async () => {
  try {
    console.log("🚀 Enviando solicitud...");
    const resp = await AprobadorService.enviar(body, TOKEN, URL);
    console.log("✅ Respuesta:", resp);
  } catch (err: any) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
})();
