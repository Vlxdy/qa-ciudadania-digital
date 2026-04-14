import path from "path";
import fs from "fs";
import { BatchProcessor } from "./batch.processor";
import { AprobadorBuilder } from "./aprobador-builder";
import { AprobadorService } from "./aprobador.service";
import { CurlService } from "./services/curl.service";
import { PlaywrightApprovalService } from "./services/playwright-approval.service";
import dotenv from "dotenv";
import { logger } from "../utils/logger.util";

dotenv.config();

const args = process.argv.slice(2);
const input = args.find((arg) => !arg.startsWith("--"));
const modeArg = args.find((arg) => arg.startsWith("--mode="));
const mode = modeArg?.split("=")[1] as
  | "single"
  | "multiple"
  | "both"
  | undefined;

if (!input) {
  logger.error(
    "Debes pasar un archivo o directorio. Opcional: --mode=single|multiple|both",
    undefined,
    0,
  );
  process.exit(1);
}

const fullPath = path.resolve(input);
const baseOutputDir = process.env.OUTPUT_DIR!;
const singleDir = path.join(baseOutputDir, "aprobador", "single");
const multipleDir = path.join(baseOutputDir, "aprobador", "multiple");

if (!fs.existsSync(fullPath)) {
  logger.error("Ruta no existe: " + fullPath, undefined, 0);
  process.exit(1);
}

if (fs.statSync(fullPath).isDirectory()) {
  const batchMode = mode || "both";
  logger.section(`Modo directorio — ${batchMode.toUpperCase()}`);
  logger.info(`Input: ${fullPath}`, 2);

  const runner =
    batchMode === "single"
      ? () => BatchProcessor.processDirectorySingle(fullPath)
      : batchMode === "multiple"
        ? () => BatchProcessor.processDirectoryMultiples(fullPath)
        : () => BatchProcessor.processDirectory(fullPath);

  runner().catch((error: any) => {
    logger.error("Error en procesamiento batch", error.response?.data ?? error, 0);
    process.exit(1);
  });
} else {
  if (mode === "both" || !mode) {
    logger.section(`Archivo único — modo BOTH`);
    logger.info(`Input: ${fullPath}`, 2);

    const simpleBody = AprobadorBuilder.buildFromFile(
      fullPath,
      process.env.ACCESS_TOKEN_CIUDADANIA!,
    );
    const simpleBaseName = path.parse(fullPath).name;
    const { bodyPath: singleBodyPath, curlPath: singleCurlPath } = CurlService.save(
      singleDir,
      simpleBody,
      process.env.APROBADOR_URL!,
      process.env.TOKEN_CLIENTE!,
      simpleBaseName,
      "/api/solicitudes",
    );
    logger.ok(`Body SIMPLE guardado en: ${singleBodyPath}`);
    logger.ok(`Curl SIMPLE guardado en: ${singleCurlPath}`);

    AprobadorService.enviar(
      simpleBody,
      process.env.TOKEN_CLIENTE!,
      process.env.APROBADOR_URL!,
    )
      .then((res) => {
        logger.ok("Solicitud SIMPLE enviada correctamente");
        logger.debug("response", res);
        return PlaywrightApprovalService.process(
          res,
          process.env.ACCESS_TOKEN_CIUDADANIA!,
        ).then((approvalListener) => ({ res, approvalListener }));
      })
      .then(({ approvalListener }) => {
        if (approvalListener) {
          logger.debug("approvalListener", approvalListener);
        }
      })
      .catch((err) => {
        logger.error("Error enviando solicitud SIMPLE", err.response?.data ?? err);
      })
      .finally(() => {
        logger.section("Enviando solicitud MÚLTIPLE");

        const multipleBody = AprobadorBuilder.buildMultiplesFromFiles(
          [fullPath],
          process.env.ACCESS_TOKEN_CIUDADANIA!,
        );
        const multipleBaseName = path.parse(fullPath).name;
        const { bodyPath, curlPath } = CurlService.save(
          multipleDir,
          multipleBody,
          process.env.APROBADOR_URL!,
          process.env.TOKEN_CLIENTE!,
          multipleBaseName,
          "/api/solicitudes/multiples",
        );

        logger.ok(`Body MULTIPLE guardado en: ${bodyPath}`);
        logger.ok(`Curl MULTIPLE guardado en: ${curlPath}`);

        AprobadorService.enviarMultiples(
          multipleBody,
          process.env.TOKEN_CLIENTE!,
          process.env.APROBADOR_URL!,
        )
          .then((res) => {
            logger.ok("Solicitud MÚLTIPLE enviada correctamente");
            logger.debug("response", res);
            return PlaywrightApprovalService.process(
              res,
              process.env.ACCESS_TOKEN_CIUDADANIA!,
            ).then((approvalListener) => ({ res, approvalListener }));
          })
          .then(({ approvalListener }) => {
            if (approvalListener) {
              logger.debug("approvalListener", approvalListener);
            }
          })
          .catch((err) => {
            logger.error("Error enviando solicitud MÚLTIPLE", err.response?.data ?? err);
          });
      });
  } else if (mode === "multiple") {
    logger.section("Archivo único — modo MULTIPLE");
    logger.info(`Input: ${fullPath}`, 2);

    const body = AprobadorBuilder.buildMultiplesFromFiles(
      [fullPath],
      process.env.ACCESS_TOKEN_CIUDADANIA!,
    );

    const baseName = path.parse(fullPath).name;
    const { bodyPath, curlPath } = CurlService.save(
      multipleDir,
      body,
      process.env.APROBADOR_URL!,
      process.env.TOKEN_CLIENTE!,
      baseName,
      "/api/solicitudes/multiples",
    );

    logger.ok(`Body guardado en: ${bodyPath}`);
    logger.ok(`Curl guardado en: ${curlPath}`);

    AprobadorService.enviarMultiples(
      body,
      process.env.TOKEN_CLIENTE!,
      process.env.APROBADOR_URL!,
    )
      .then((res) => {
        logger.ok("Solicitud múltiple enviada correctamente");
        logger.debug("response", res);
        return PlaywrightApprovalService.process(
          res,
          process.env.ACCESS_TOKEN_CIUDADANIA!,
        ).then((approvalListener) => ({ res, approvalListener }));
      })
      .then(({ approvalListener }) => {
        if (approvalListener) {
          logger.debug("approvalListener", approvalListener);
        }
      })
      .catch((err) => {
        logger.error("Error enviando solicitud múltiple", err.response?.data ?? err);
      });
  } else {
    logger.section("Archivo único — modo SINGLE");
    logger.info(`Input: ${fullPath}`, 2);

    const body = AprobadorBuilder.buildFromFile(
      fullPath,
      process.env.ACCESS_TOKEN_CIUDADANIA!,
    );

    const baseName = path.parse(fullPath).name;

    const { bodyPath, curlPath } = CurlService.save(
      singleDir,
      body,
      process.env.APROBADOR_URL!,
      process.env.TOKEN_CLIENTE!,
      baseName,
    );
    logger.ok(`Body guardado en: ${bodyPath}`);
    logger.ok(`Curl guardado en: ${curlPath}`);

    AprobadorService.enviar(
      body,
      process.env.TOKEN_CLIENTE!,
      process.env.APROBADOR_URL!,
    )
      .then((res) => {
        logger.ok("Solicitud enviada correctamente");
        logger.debug("response", res);
        return PlaywrightApprovalService.process(
          res,
          process.env.ACCESS_TOKEN_CIUDADANIA!,
        ).then((approvalListener) => ({ res, approvalListener }));
      })
      .then(({ approvalListener }) => {
        if (approvalListener) {
          logger.debug("approvalListener", approvalListener);
        }
      })
      .catch((err) => {
        logger.error("Error enviando solicitud", err.response?.data ?? err);
      });
  }
}
