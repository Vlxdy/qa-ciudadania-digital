/**
 * Servicio para descargar archivos y calcular su hash SHA-256.
 * Copia independiente de src/notificador/file-hash.service.ts para uso en escenarios QA,
 * sin depender del módulo de producción.
 *
 * Mejoras respecto al original:
 * - Nombre de archivo temporal único con bytes aleatorios (evita colisiones en Promise.all).
 * - Caché por URL: si la misma URL se solicita varias veces en la misma ejecución
 *   (p.ej. noti-19 con 3 enlaces a la misma URL), el archivo se descarga solo una vez.
 */
import { createHash, randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';
import http from 'http';

export class QaFileHashService {
  /** Caché en memoria: URL → hash SHA-256. Se limpia entre ejecuciones del proceso. */
  private static readonly cache = new Map<string, string>();

  static async downloadAndHash(url: string): Promise<string> {
    const cached = QaFileHashService.cache.get(url);
    if (cached) return cached;

    const hash = await QaFileHashService._download(url);
    QaFileHashService.cache.set(url, hash);
    return hash;
  }

  private static _download(url: string): Promise<string> {
    // Nombre único: timestamp + 4 bytes aleatorios → sin colisiones aunque Promise.all
    // lance varias descargas simultáneas de URLs diferentes.
    const uid = `${Date.now()}-${randomBytes(4).toString('hex')}`;
    const tempFilePath = path.join(os.tmpdir(), `qa-hash-${uid}.tmp`);
    const protocol = url.startsWith('https') ? https : http;

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(tempFilePath);

      protocol
        .get(url, (response) => {
          if (response.statusCode !== 200) {
            file.close();
            fs.unlink(tempFilePath, () => {});
            return reject(new Error(`Error al descargar archivo (${response.statusCode}): ${url}`));
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
          file.close();
          fs.unlink(tempFilePath, () => {});
          reject(err);
        });
    });
  }
}
