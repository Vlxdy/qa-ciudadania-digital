import path from "path";
import fs from "fs";
import { BatchProcessor } from "./batch.processor";
import { AprobadorBuilder } from "./aprobador-builder";
import { AprobadorService } from "./aprobador.service";
import { CurlService } from "./services/curl.service";
import dotenv from "dotenv";

dotenv.config();

const input = process.argv[2];

if (!input) {
  console.error("❌ Debes pasar un archivo o directorio");
  process.exit(1);
}

const fullPath = path.resolve(input);

if (!fs.existsSync(fullPath)) {
  console.error("❌ Ruta no existe");
  process.exit(1);
}

if (fs.statSync(fullPath).isDirectory()) {
  console.log("📦 Modo batch activado");
  BatchProcessor.processDirectory(fullPath);
} else {
  console.log("📄 Modo archivo único");

  const body = AprobadorBuilder.buildFromFile(
    fullPath,
    process.env.ACCESS_TOKEN_CIUDADANIA!,
  );

  const baseName = path.parse(fullPath).name;
  const outputDir = process.env.OUTPUT_DIR!;

  CurlService.save(
    outputDir,
    body,
    process.env.APROBADOR_URL!,
    process.env.TOKEN_CLIENTE!,
    baseName,
  );

  AprobadorService.enviar(
    body,
    process.env.TOKEN_CLIENTE!,
    process.env.APROBADOR_URL!,
  )
    .then((res) => {
      console.log("✅ OK:", res);
    })
    .catch((err) => {
      console.log("❌ ERROR:", err.response?.data || err.message);
    });
}
