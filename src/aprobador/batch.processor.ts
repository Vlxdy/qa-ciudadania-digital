import fs from "fs";
import path from "path";
import pLimit from "p-limit";
import { AprobadorBuilder } from "./aprobador-builder";
import { AprobadorService } from "./aprobador.service";
import { CurlService } from "./services/curl.service";

const CONCURRENCY = Number(process.env.CONCURRENCY || 3);

export class BatchProcessor {
  static async processDirectory(dirPath: string) {
    const files = fs.readdirSync(dirPath);

    const limit = pLimit(CONCURRENCY);
    const results: any[] = [];

    const tasks = files.map((file) =>
      limit(async () => {
        const filePath = path.join(dirPath, file);

        try {
          console.log(`📄 Procesando: ${file}`);

          const body = AprobadorBuilder.buildFromFile(
            filePath,
            process.env.ACCESS_TOKEN_CIUDADANIA!,
          );

          const baseName = path.parse(file).name;
          const outputDir = process.env.OUTPUT_DIR!;

          // guardar body + curl
          CurlService.save(
            outputDir,
            body,
            process.env.APROBADOR_URL!,
            process.env.TOKEN_CLIENTE!,
            baseName,
          );

          // enviar
          const response = await AprobadorService.enviar(
            body,
            process.env.TOKEN_CLIENTE!,
            process.env.APROBADOR_URL!,
          );

          console.log(`✅ OK: ${file}`);

          results.push({
            file,
            status: "OK",
            response,
          });
        } catch (error: any) {
          console.log(`❌ ERROR: ${file}`);

          results.push({
            file,
            status: "ERROR",
            error: error.response?.data || error.message,
          });
        }
      }),
    );

    await Promise.all(tasks);

    const reportPath = path.join(
      process.env.OUTPUT_DIR!,
      `batch-result-${Date.now()}.json`,
    );

    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    console.log(`📊 Reporte guardado en: ${reportPath}`);
  }
}
