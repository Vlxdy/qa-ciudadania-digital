/**
 * Servidor webhook QA.
 * Se levanta al inicio de `npm run qa` en el mismo puerto que WEBHOOK_PORT.
 *
 * Rutas:
 *  GET  /file[/:name]         — sirve archivos fixture (sin autenticación)
 *  GET  /documentos-digitales — verifica nonce y devuelve PDF (con JWT)
 *  POST /documentos-digitales — guarda en callback-store (con JWT)
 *  *    /*                    — guarda cualquier request en callback-store
 */
import http from 'http';
import fs from 'fs';
import nodePath from 'path';
import chalk from 'chalk';
import { pushCallback } from './callback-store';
import { logger } from '../../utils/logger.util';
import { JwtService } from '../../webhook/jwt.service';
import { verificarNonce } from '../../webhook/nonce.service';
import { fixturesPaths } from '../fixtures/paths';
import { qaEnv } from '../config/qa-env';

let server: http.Server | null = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function extractBearer(req: http.IncomingMessage): string | null {
  const auth = req.headers['authorization'] ?? '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

function sendFile(res: http.ServerResponse, filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  const ext = nodePath.extname(filePath).toLowerCase();
  const contentType =
    ext === '.pdf' ? 'application/pdf' :
    ext === '.json' ? 'application/json' :
    'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${nodePath.basename(filePath)}"`,
  });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function listFixtureFiles(baseUrl: string) {
  if (!fs.existsSync(fixturesPaths.dir)) return [];
  return fs.readdirSync(fixturesPaths.dir, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => {
      const full = nodePath.join(fixturesPaths.dir, e.name);
      return { name: e.name, size: fs.statSync(full).size, url: `${baseUrl}/${encodeURIComponent(e.name)}` };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function logRequest(method: string, path: string) {
  console.log(`  ${chalk.blue.bold('[QA Webhook]')} ${chalk.blue(method)} ${chalk.cyan(path)}`);
}

// ─── Server ───────────────────────────────────────────────────────────────────

export function startQaWebhookServer(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    server = http.createServer(async (req, res) => {
      const method = req.method ?? 'GET';
      const url = new URL(req.url ?? '/', `http://localhost`);
      const pathname = url.pathname;

      if (method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.writeHead(204);
        res.end();
        return;
      }

      logRequest(method, pathname);

      try {
        // ── Leer body y registrar TODOS los requests en el callback-store ────
        // Esto incluye GETs a /file, POSTs de callback, y documentos-digitales.
        // Así el artefacto response.json refleja toda la actividad webhook del escenario.
        const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
        const body = isWrite ? await readBody(req) : null;
        const receivedAt = new Date().toISOString();
        const headers = { ...req.headers } as Record<string, string | string[] | undefined>;

        pushCallback({ path: pathname, method, body, headers, receivedAt });

        // ── GET /file[/:name] ────────────────────────────────────────────────
        const fileMatch = /^\/file(?:\/([^/]+))?$/.exec(pathname);
        if (fileMatch && method === 'GET') {
          const fileName = fileMatch[1];
          if (!fileName) {
            const baseUrl = `http://localhost:${port}/file`;
            const files = listFixtureFiles(baseUrl);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ dir: fixturesPaths.dir, total: files.length, files }, null, 2));
            return;
          }

          if (fileName.includes('..') || fileName.includes('/')) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Nombre de archivo inválido' }));
            return;
          }
          const decoded = decodeURIComponent(fileName);
          if (decoded.includes('..') || decoded.includes('/')) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Nombre de archivo inválido' }));
            return;
          }
          const filePath = nodePath.join(fixturesPaths.dir, decoded);
          if (!sendFile(res, filePath)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Archivo no encontrado' }));
          }
          return;
        }

        // ── /documentos-digitales ────────────────────────────────────────────
        if (pathname === '/documentos-digitales') {
          const token = extractBearer(req);
          if (!token) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Bearer token requerido' }));
            return;
          }
          try {
            JwtService.verify(token);
          } catch {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'JWT inválido' }));
            return;
          }

          if (method === 'GET') {
            const nonce = url.searchParams.get('nonce');
            if (!nonce) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: "Query param 'nonce' requerido" }));
              return;
            }
            if (!qaEnv.DOC_DIGITAL_URL_BASE || !qaEnv.DOC_DIGITAL_TOKEN) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Servicio de verificación no configurado' }));
              return;
            }

            const nonceResult = await verificarNonce(qaEnv.DOC_DIGITAL_URL_BASE, qaEnv.DOC_DIGITAL_TOKEN, nonce);

            if (!nonceResult.ok) {
              res.writeHead(nonceResult.status, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(nonceResult.data));
              return;
            }

            if (!sendFile(res, fixturesPaths.validPdf)) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'PDF no encontrado. Ejecuta: npm run qa:fixtures' }));
            }
            return;
          }

          // POST/PUT/PATCH de documentos-digitales (body ya leído y guardado arriba)
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        // ── Callback genérico (body ya leído y guardado arriba) ───────────────
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));

      } catch (err) {
        logger.error('[QA Webhook] Error interno', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    });

    server.on('error', (err) => {
      server = null;
      reject(err);
    });

    server.listen(port, () => {
      logger.ok(`QA Webhook interno escuchando en :${port}`);
      logger.info(`  Files:               http://localhost:${port}/file/:name`);
      logger.info(`  Documentos digitales: http://localhost:${port}/documentos-digitales`);
      logger.info(`  Callbacks:           cualquier ruta → callback-store`);
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
