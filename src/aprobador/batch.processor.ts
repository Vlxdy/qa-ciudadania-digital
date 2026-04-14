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
      logger.warn("No se encontraron archivos para procesar", 2);
      return;
    }

    logger.section(`Aprobación MÚLTIPLE — ${files.length} archivo(s)`);

    files.forEach((file, index) => {
      logger.info(`Archivo ${index + 1}: ${file}`, 2);
    });

    const filePaths = files.map((file) => path.join(dirPath, file));
    const body = AprobadorBuilder.buildMultiplesFromFiles(
      filePaths,
      process.env.ACCESS_TOKEN_CIUDADANIA!,
    );

    logger.ok("Body generado", 2);

    const multipleDir = path.join(process.env.OUTPUT_DIR!, "aprobador", "multiple");
    const filenameBase = `multiples-${Date.now()}`;

    const { bodyPath, curlPath } = CurlService.save(
      multipleDir,
      body,
      process.env.APROBADOR_URL!,
      process.env.TOKEN_CLIENTE!,
      filenameBase,
      "/api/solicitudes/multiples",
    );

    logger.ok(`Body guardado en ${bodyPath}`, 2);
    logger.ok(`Curl guardado en ${curlPath}`, 2);

    const result: Record<string, unknown> = {
      mode: "MULTIPLES",
      files,
      totalDocumentos: files.length,
      status: "OK",
    };

    try {
      logger.info("Enviando solicitud...", 2);
      const response = await AprobadorService.enviarMultiples(
        body,
        process.env.TOKEN_CLIENTE!,
        process.env.APROBADOR_URL!,
      );

      logger.ok("Solicitud enviada correctamente", 2);
      logger.debug("response", response, 2);

      result.response = response;
      result.approvalListener = await PlaywrightApprovalService.process(
        response,
        process.env.ACCESS_TOKEN_CIUDADANIA!,
      );

      logger.debug("approvalListener", result.approvalListener, 2);
    } catch (error: any) {
      result.status = "ERROR";
      result.error = error.response?.data || error.message;
      logger.error("Error enviando la solicitud", error.response?.data ?? error, 2);
    }

    const reportPath = path.join(
      multipleDir,
      `batch-result-multiples-${Date.now()}.json`,
    );

    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
    logger.info(`Reporte guardado en ${reportPath}`, 2);
  }

  static async processDirectorySingle(dirPath: string) {
    const files = BatchProcessor.getFiles(dirPath);

    if (files.length === 0) {
      logger.warn("No se encontraron archivos para procesar", 2);
      return;
    }

    logger.section(`Aprobación SIMPLE — ${files.length} archivo(s)`);

    const singleDir = path.join(process.env.OUTPUT_DIR!, "aprobador", "single");
    const results: Array<Record<string, unknown>> = [];

    for (const [index, file] of files.entries()) {
      const filePath = path.join(dirPath, file);

      logger.section(`Archivo ${index + 1}/${files.length}: ${file}`, 2);

      try {
        const body = AprobadorBuilder.buildFromFile(
          filePath,
          process.env.ACCESS_TOKEN_CIUDADANIA!,
        );

        const baseName = `${path.parse(file).name}-${Date.now()}`;
        const { bodyPath, curlPath } = CurlService.save(
          singleDir,
          body,
          process.env.APROBADOR_URL!,
          process.env.TOKEN_CLIENTE!,
          baseName,
          "/api/solicitudes",
        );

        logger.ok(`Body guardado en ${bodyPath}`, 3);
        logger.ok(`Curl guardado en ${curlPath}`, 3);

        logger.info("Enviando solicitud...", 3);
        const response = await AprobadorService.enviar(
          body,
          process.env.TOKEN_CLIENTE!,
          process.env.APROBADOR_URL!,
        );

        logger.ok("Solicitud enviada correctamente", 3);
        logger.debug("response", response, 3);

        const approvalListener = await PlaywrightApprovalService.process(
          response,
          process.env.ACCESS_TOKEN_CIUDADANIA!,
        );

        logger.debug("approvalListener", approvalListener, 3);

        results.push({ file, status: "OK", response, approvalListener });
        logger.ok(`${file} aprobado`, 3);
      } catch (error: any) {
        results.push({
          file,
          status: "ERROR",
          error: error.response?.data || error.message,
        });
        logger.error(`Error procesando ${file}`, error.response?.data ?? error, 3);
      }
    }

    const reportPath = path.join(
      singleDir,
      `batch-result-single-${Date.now()}.json`,
    );
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    logger.info(`Reporte guardado en ${reportPath}`, 2);
  }

  static async processDirectory(dirPath: string) {
    await BatchProcessor.processDirectorySingle(dirPath);
    await BatchProcessor.processDirectoryMultiples(dirPath);
  }
}
