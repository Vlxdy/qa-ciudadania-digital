import fs from "fs";
import path from "path";
import { AprobadorBuilder } from "./aprobador-builder";
import { AprobadorService } from "./aprobador.service";
import { CurlService } from "./services/curl.service";
import { PlaywrightApprovalService } from "./services/playwright-approval.service";
import { logger } from "../utils/logger.util";

export class BatchProcessor {
  private static getFiles(dirPath: string): string[] {
    return fs
      .readdirSync(dirPath)
      .filter((file) => fs.statSync(path.join(dirPath, file)).isFile());
  }

  static async processDirectoryMultiples(dirPath: string) {
    const files = BatchProcessor.getFiles(dirPath);

    if (files.length === 0) {
      logger.warn("No se encontraron archivos para procesar.");
      return;
    }

    logger.info(
      `[MULTIPLES] Preparando aprobación múltiple para ${files.length} archivo(s)...`,
    );

    const filePaths = files.map((file) => path.join(dirPath, file));

    files.forEach((file, index) => {
      logger.info(`[MULTIPLES] Paso 1.${index + 1}: archivo detectado -> ${file}`);
    });

    const body = AprobadorBuilder.buildMultiplesFromFiles(
      filePaths,
      process.env.ACCESS_TOKEN_CIUDADANIA!,
    );

    logger.success("[MULTIPLES] Paso 2: body generado.");

    const outputDir = process.env.OUTPUT_DIR!;
    const filenameBase = `multiples-${Date.now()}`;

    const { bodyPath, curlPath } = CurlService.save(
      outputDir,
      body,
      process.env.APROBADOR_URL!,
      process.env.TOKEN_CLIENTE!,
      filenameBase,
      "/api/solicitudes/multiples",
    );

    logger.success(`[MULTIPLES] Paso 3: body guardado en ${bodyPath}`);
    logger.success(`[MULTIPLES] Paso 4: curl guardado en ${curlPath}`);

    const result: Record<string, unknown> = {
      mode: "MULTIPLES",
      files,
      totalDocumentos: files.length,
      status: "OK",
    };

    try {
      logger.info("[MULTIPLES] Paso 5: enviando solicitud...");
      const response = await AprobadorService.enviarMultiples(
        body,
        process.env.TOKEN_CLIENTE!,
        process.env.APROBADOR_URL!,
      );

      result.response = response;
      result.approvalListener = await PlaywrightApprovalService.process(
        response,
        process.env.ACCESS_TOKEN_CIUDADANIA!,
      );
      logger.success("[MULTIPLES] Paso 6: solicitud enviada correctamente.");
    } catch (error: any) {
      result.status = "ERROR";
      result.error = error.response?.data || error.message;
      logger.error("[MULTIPLES] Paso 6: error enviando la solicitud.");
    }

    const reportPath = path.join(
      process.env.OUTPUT_DIR!,
      `batch-result-multiples-${Date.now()}.json`,
    );

    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));

    logger.info(`[MULTIPLES] Paso 7: reporte guardado en ${reportPath}`);
  }

  static async processDirectorySingle(dirPath: string) {
    const files = BatchProcessor.getFiles(dirPath);

    if (files.length === 0) {
      logger.warn("No se encontraron archivos para procesar.");
      return;
    }

    logger.info(
      `[SIMPLE] Preparando aprobación simple para ${files.length} archivo(s)...`,
    );

    const outputDir = process.env.OUTPUT_DIR!;
    const results: Array<Record<string, unknown>> = [];

    for (const [index, file] of files.entries()) {
      const filePath = path.join(dirPath, file);
      logger.info(`[SIMPLE] Paso 1.${index + 1}: procesando ${file}`);

      try {
        const body = AprobadorBuilder.buildFromFile(
          filePath,
          process.env.ACCESS_TOKEN_CIUDADANIA!,
        );

        const baseName = `${path.parse(file).name}-${Date.now()}`;
        const { bodyPath, curlPath } = CurlService.save(
          outputDir,
          body,
          process.env.APROBADOR_URL!,
          process.env.TOKEN_CLIENTE!,
          baseName,
          "/api/solicitudes",
        );

        logger.success(`[SIMPLE] Body guardado en ${bodyPath}`);
        logger.success(`[SIMPLE] Curl guardado en ${curlPath}`);

        const response = await AprobadorService.enviar(
          body,
          process.env.TOKEN_CLIENTE!,
          process.env.APROBADOR_URL!,
        );

        const approvalListener = await PlaywrightApprovalService.process(
          response,
          process.env.ACCESS_TOKEN_CIUDADANIA!,
        );

        results.push({ file, status: "OK", response, approvalListener });
        logger.success(`[SIMPLE] Archivo ${file} aprobado.`);
      } catch (error: any) {
        results.push({
          file,
          status: "ERROR",
          error: error.response?.data || error.message,
        });
        logger.error(`[SIMPLE] Error en archivo ${file}.`);
      }
    }

    const reportPath = path.join(
      process.env.OUTPUT_DIR!,
      `batch-result-single-${Date.now()}.json`,
    );
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    logger.info(`[SIMPLE] Reporte guardado en ${reportPath}`);
  }

  static async processDirectory(dirPath: string) {
    await BatchProcessor.processDirectorySingle(dirPath);
    await BatchProcessor.processDirectoryMultiples(dirPath);
  }
}
