/**
 * Servicio para descargar archivos y calcular su hash SHA-256.
 * Copia independiente de src/notificador/file-hash.service.ts para uso en escenarios QA,
 * sin depender del módulo de producción.
 */
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';
import http from 'http';

export class QaFileHashService {
  static async downloadAndHash(url: string): Promise<string> {
    const tempFilePath = path.join(os.tmpdir(), `qa-hash-${Date.now()}.tmp`);
    const protocol = url.startsWith('https') ? https : http;

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(tempFilePath);

      protocol
        .get(url, (response) => {
          if (response.statusCode !== 200) {
            return reject(new Error(`Error al descargar archivo: ${response.statusCode}`));
          }

          response.pipe(file);

          file.on('finish', () => {
            file.close(() => {
              try {
                const data = fs.readFileSync(tempFilePath);
                const hash = createHash('sha256').update(data).digest('hex');
                fs.unlinkSync(tempFilePath);
                resolve(hash);
              } catch (err) {
                reject(err);
              }
            });
          });
        })
        .on('error', (err) => {
          fs.unlink(tempFilePath, () => {});
          reject(err);
        });
    });
  }
}
