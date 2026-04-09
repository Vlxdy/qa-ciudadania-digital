import path from "path";
import { env } from "./config/env";
import {
  NotificacionInputSchema,
  NotificacionInput,
} from "./schemas/notification.schema";
import {
  readJsonFile,
  readTextFile,
  writeJsonFile,
  ensureDir,
} from "./utils/file.util";
import { logger } from "./utils/logger.util";
import { CryptoService } from "./services/crypto.service";
import { BodyBuilderService } from "./services/body-builder.service";
import { SenderService } from "./services/sender.service";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    logger.error("Uso: npm run dev -- ./casos/notificacion-01.json [--send]");
    process.exit(1);
  }

  const inputPath = args.find((arg) => !arg.startsWith("--"));
  const shouldSend = args.includes("--send") || env.AUTO_SEND;

  if (!inputPath) {
    logger.error("Debes indicar la ruta del archivo JSON de entrada.");
    process.exit(1);
  }

  logger.info(`Leyendo caso: ${inputPath}`);

  const rawInput = readJsonFile<NotificacionInput>(inputPath);

  const parsed = NotificacionInputSchema.safeParse(rawInput);

  if (!parsed.success) {
    logger.error("El JSON de entrada no es válido:");
    console.dir(parsed.error.format(), { depth: null });
    process.exit(1);
  }

  const input = parsed.data;

  const publicKeyPem = readTextFile(env.RSA_PUBLIC_KEY_PATH);
  const aes = CryptoService.generateAesMaterial();

  logger.info("Generando body cifrado...");

  const { body, debug } = BodyBuilderService.build(input, aes, publicKeyPem);

  ensureDir(env.OUTPUT_DIR);

  const baseName = path.basename(inputPath, path.extname(inputPath));

  const bodyPath = path.join(env.OUTPUT_DIR, `body-final.${baseName}.json`);
  const debugPath = path.join(env.OUTPUT_DIR, `debug.${baseName}.json`);
  const responsePath = path.join(env.OUTPUT_DIR, `response.${baseName}.json`);

  writeJsonFile(bodyPath, body);
  writeJsonFile(debugPath, debug);

  logger.success(`Body generado: ${bodyPath}`);
  logger.success(`Debug generado: ${debugPath}`);

  if (shouldSend) {
    logger.info("Enviando notificación al endpoint...");
    try {
      const response = await SenderService.send(body);
      writeJsonFile(responsePath, response);
      logger.success(`Respuesta guardada en: ${responsePath}`);
      console.log("\n📨 Respuesta del servidor:\n");
      console.dir(response, { depth: null });
    } catch (error: any) {
      logger.error("Error enviando la notificación");

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        writeJsonFile(responsePath, {
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        console.error(error.message);
      }

      process.exit(1);
    }
  } else {
    logger.warn("Modo solo generación (no se envió al endpoint).");
  }
}

main().catch((error) => {
  logger.error(error.message);
  process.exit(1);
});
