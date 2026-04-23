/**
 * Servidor webhook mínimo para el runner QA.
 * Se levanta al inicio de `npm run qa` y se cierra al terminar.
 * Acepta cualquier request, lo guarda en el callback-store en memoria
 * y responde 200 — sin JWT ni lógica de negocio.
 */
import http from 'http';
import chalk from 'chalk';
import { pushCallback } from './callback-store';
import { logger } from '../../utils/logger.util';

let server: http.Server | null = null;

function readBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: Buffer) => { raw += chunk.toString(); });
    req.on('end', () => {
      if (!raw) return resolve(null);
      try { resolve(JSON.parse(raw)); }
      catch { resolve(raw); }
    });
  });
}

export function startQaWebhookServer(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    server = http.createServer(async (req, res) => {
      const method = req.method ?? 'GET';
      const path = req.url ?? '/';

      if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const body = await readBody(req);

      pushCallback({
        path,
        method,
        body,
        headers: { ...req.headers } as Record<string, string | string[] | undefined>,
        receivedAt: new Date().toISOString(),
      });

      console.log(
        `  ${chalk.blue.bold('[QA Webhook]')} ${chalk.blue(method)} ${chalk.cyan(path)}`,
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });

    server.on('error', (err) => {
      server = null;
      reject(err);
    });

    server.listen(port, () => {
      logger.ok(`QA Webhook interno escuchando en :${port}`);
      resolve();
    });
  });
}

export function stopQaWebhookServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!server) return resolve();
    server.close(() => resolve());
    server = null;
  });
}

export function isQaWebhookRunning(): boolean {
  return server !== null && server.listening;
}
