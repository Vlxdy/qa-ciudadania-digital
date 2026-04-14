import path from "path";
import { env } from "../config/env";
import {
  NotificacionInputSchema,
  NotificacionInput,
} from "../schemas/notification.schema";
import {
  readJsonFile,
  readTextFile,
  writeJsonFile,
  ensureDir,
} from "../utils/file.util";
import { logger } from "../utils/logger.util";
import { CryptoService } from "../services/crypto.service";
import { BodyBuilderService } from "../services/body-builder.service";
import { SenderService } from "../services/sender.service";
import { CurlService } from "../services/curl.service";
import { FileHashService } from "./file-hash.service";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    logger.error(
      "Uso: npm run dev -- ./casos/notificacion-01.json [--send]",
      undefined,
      0,
    );
    process.exit(1);
  }

  const inputPath = args.find((arg) => !arg.startsWith("--"));
  const shouldSend = args.includes("--send") || env.AUTO_SEND;

  if (!inputPath) {
    logger.error(
      "Debes indicar la ruta del archivo JSON de entrada",
      undefined,
      0,
    );
    process.exit(1);
  }

  logger.section("Preparando notificación");
  logger.info(`Caso: ${inputPath}`);

  const rawInput = readJsonFile<NotificacionInput>(inputPath);
  const parsed = NotificacionInputSchema.safeParse(rawInput);

  if (!parsed.success) {
    logger.error("El JSON de entrada no es válido", parsed.error.format());
    process.exit(1);
  }

  const input = parsed.data;
  const publicKeyPem = readTextFile(env.RSA_PUBLIC_KEY_PATH);
  const aes = CryptoService.generateAesMaterial();

  logger.section("Generando hash de archivos adjuntos");

  // Procesar enlaces
  if (input.notificacion.enlaces?.length) {
    for (const enlace of input.notificacion.enlaces) {
      if (enlace.url) {
        logger.info(`Descargando y generando hash: ${enlace.url}`);
        enlace.hash = await FileHashService.downloadAndHash(enlace.url);
      }
    }
  }

  // Procesar formularioNotificacion
  if (input.notificacion.formularioNotificacion?.url) {
    const url = input.notificacion.formularioNotificacion.url;

    logger.info(`Descargando y generando hash formulario: ${url}`);

    input.notificacion.formularioNotificacion.hash =
      await FileHashService.downloadAndHash(url);
  }

  logger.section("Generando body cifrado");
  const { body, debug } = BodyBuilderService.build(input, aes, publicKeyPem);

  ensureDir(env.OUTPUT_DIR);

  const baseName = path.basename(inputPath, path.extname(inputPath));
  const bodyPath = path.join(env.OUTPUT_DIR, `body-final.${baseName}.json`);
  const debugPath = path.join(env.OUTPUT_DIR, `debug.${baseName}.json`);
  const responsePath = path.join(env.OUTPUT_DIR, `response.${baseName}.json`);

  writeJsonFile(bodyPath, body);
  writeJsonFile(debugPath, debug);

  logger.ok(`Body generado: ${bodyPath}`);
  logger.ok(`Debug generado: ${debugPath}`);

  const fileName = "notificacion-01";
  const outputDir = process.env.OUTPUT_DIR!;
  const issuer = process.env.ISSUER_NOTIFICADOR!;
  const token = process.env.TOKEN_CONFIGURACION!;

  CurlService.generateNotificadorCurl(fileName, issuer, token, outputDir);

  if (shouldSend) {
    logger.section("Enviando notificación");
    logger.info(
      "POST → " + env.ISSUER_NOTIFICADOR + "/api/notificacion/natural",
    );
    try {
      const response = await SenderService.send(body);
      writeJsonFile(responsePath, response);
      logger.ok(`Respuesta guardada en: ${responsePath}`);
      logger.debug("Respuesta del servidor", response);
    } catch (error: any) {
      if (error.response) {
        logger.error("Error enviando la notificación", {
          status: error.response.status,
          data: error.response.data,
        });
        writeJsonFile(responsePath, {
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        logger.error("Error enviando la notificación", error);
      }
      process.exit(1);
    }
  } else {
    logger.warn("Modo solo generación — no se envió al endpoint");
  }
}

main().catch((error) => {
  logger.error("Error inesperado", error, 0);
  process.exit(1);
});
