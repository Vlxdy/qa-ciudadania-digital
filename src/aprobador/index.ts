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
  );
  process.exit(1);
}

const fullPath = path.resolve(input);
const baseOutputDir = process.env.OUTPUT_DIR!;
const singleDir = path.join(baseOutputDir, "aprobador", "single");
const multipleDir = path.join(baseOutputDir, "aprobador", "multiple");

if (!fs.existsSync(fullPath)) {
  logger.error("Ruta no existe");
  process.exit(1);
}

if (fs.statSync(fullPath).isDirectory()) {
  const batchMode = mode || "both";
  logger.info(`Modo directorio activado -> ${batchMode.toUpperCase()}`);

  const runner =
    batchMode === "single"
      ? () => BatchProcessor.processDirectorySingle(fullPath)
      : batchMode === "multiple"
        ? () => BatchProcessor.processDirectoryMultiples(fullPath)
        : () => BatchProcessor.processDirectory(fullPath);

  runner().catch((error: any) => {
    logger.error(error.response?.data || error.message);
    process.exit(1);
  });
} else {
  if (mode === "both" || !mode) {
    logger.info(
      "Modo archivo + both: se enviará primero SIMPLE y luego MULTIPLE para el mismo archivo.",
    );

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
    logger.success(`Body SIMPLE guardado en: ${singleBodyPath}`);
    logger.success(`Curl SIMPLE guardado en: ${singleCurlPath}`);

    AprobadorService.enviar(
      simpleBody,
      process.env.TOKEN_CLIENTE!,
      process.env.APROBADOR_URL!,
    )
      .then((res) => {
        logger.success("Solicitud SIMPLE enviada correctamente");
        return PlaywrightApprovalService.process(
          res,
          process.env.ACCESS_TOKEN_CIUDADANIA!,
        ).then((approvalListener) => ({ res, approvalListener }));
      })
      .then(({ res, approvalListener }) => {
        console.log(res);
        if (approvalListener) {
          console.log("approvalListener", approvalListener);
        }
      })
      .catch((err) => {
        logger.error(err.response?.data || err.message);
      })
      .finally(() => {
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

        logger.success(`Body MULTIPLE guardado en: ${bodyPath}`);
        logger.success(`Curl MULTIPLE guardado en: ${curlPath}`);

        AprobadorService.enviarMultiples(
          multipleBody,
          process.env.TOKEN_CLIENTE!,
          process.env.APROBADOR_URL!,
        )
          .then((res) => {
            logger.success("Solicitud MÚLTIPLE enviada correctamente");
            return PlaywrightApprovalService.process(
              res,
              process.env.ACCESS_TOKEN_CIUDADANIA!,
            ).then((approvalListener) => ({ res, approvalListener }));
          })
          .then(({ res, approvalListener }) => {
            console.log(res);
            if (approvalListener) {
              console.log("approvalListener", approvalListener);
            }
          })
          .catch((err) => {
            logger.error(err.response?.data || err.message);
          });
      });
  } else if (mode === "multiple") {
    logger.info(
      "Modo archivo + multiple: se enviará al endpoint /api/solicitudes/multiples con 1 documento.",
    );

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

    logger.success(`Body guardado en: ${bodyPath}`);
    logger.success(`Curl guardado en: ${curlPath}`);

    AprobadorService.enviarMultiples(
      body,
      process.env.TOKEN_CLIENTE!,
      process.env.APROBADOR_URL!,
    )
      .then((res) => {
        logger.success("Solicitud múltiple enviada correctamente");
        return PlaywrightApprovalService.process(
          res,
          process.env.ACCESS_TOKEN_CIUDADANIA!,
        ).then((approvalListener) => ({ res, approvalListener }));
      })
      .then(({ res, approvalListener }) => {
        console.log(res);
        if (approvalListener) {
          console.log("approvalListener", approvalListener);
        }
      })
      .catch((err) => {
        logger.error(err.response?.data || err.message);
      });
  } else {
    logger.info("Modo archivo único");

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
    logger.success(`Body guardado en: ${bodyPath}`);
    logger.success(`Curl guardado en: ${curlPath}`);

    AprobadorService.enviar(
      body,
      process.env.TOKEN_CLIENTE!,
      process.env.APROBADOR_URL!,
    )
      .then((res) => {
        logger.success("Solicitud enviada correctamente");
        return PlaywrightApprovalService.process(
          res,
          process.env.ACCESS_TOKEN_CIUDADANIA!,
        ).then((approvalListener) => ({ res, approvalListener }));
      })
      .then(({ res, approvalListener }) => {
        console.log(res);
        if (approvalListener) {
          console.log("approvalListener", approvalListener);
        }
      })
      .catch((err) => {
        logger.error(err.response?.data || err.message);
      });
  }
}
