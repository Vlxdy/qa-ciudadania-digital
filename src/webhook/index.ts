import http from "http";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { JwtService } from "./jwt.service";
import { verificarNonce } from "./nonce.service";
import { logger } from "../utils/logger.util";
import dayjs from "dayjs";
import { fixturesPaths } from "../qa/fixtures/paths";

dotenv.config();

function setCors(res: http.ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

const PORT = Number(process.env.WEBHOOK_PORT ?? 4000);
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "./output";
const FILE_DIR = fixturesPaths.dir;

const PATH_PREFIX = (process.env.WEBHOOK_PATH_PREFIX ?? "").replace(/\/+$/, "");
const JWT_ENABLED = process.env.WEBHOOK_JWT_ENABLED !== "false";
const DOC_DIGITAL_URL_BASE = process.env.DOC_DIGITAL_URL_BASE ?? "";
const DOC_DIGITAL_TOKEN = process.env.DOC_DIGITAL_TOKEN ?? "";

// ── PATTERNS ─────────────────────────────────────────────────────
const MECANISMO_PATTERN = new RegExp(
  `^${PATH_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/webhook/([a-zA-Z0-9_-]+)$`,
);

const FILE_ROUTE_PATTERN = new RegExp(
  `^${PATH_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/file(?:/([^/]+))?$`,
);

const DOCUMENTOS_DIGITALES_PATTERN = new RegExp(
  `^${PATH_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/documentos-digitales$`,
);

const WRITE_METHODS = ["POST", "PUT", "PATCH"];

// ── HELPERS ──────────────────────────────────────────────────────
function extractBearer(req: http.IncomingMessage): string | null {
  const auth = req.headers["authorization"] ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

function readBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk: Buffer) => {
      raw += chunk.toString();
    });
    req.on("end", () => {
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(raw);
      }
    });
  });
}

function savePayload(mecanismo: string, method: string, body: unknown): string {
  const dir = path.join(OUTPUT_DIR, "webhooks", mecanismo);
  fs.mkdirSync(dir, { recursive: true });

  const timestamp = dayjs().format("YYYY-MM-DD_HH-mm-ss");

  const filename = `${timestamp}-${mecanismo}.json`;
  const filePath = path.join(dir, filename);

  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        mecanismo,
        receivedAt: timestamp,
        method,
        body,
      },
      null,
      2,
    ),
  );

  return filePath;
}

function sendFile(res: http.ServerResponse, filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;

  const ext = path.extname(filePath).toLowerCase();

  const contentType =
    ext === ".pdf"
      ? "application/pdf"
      : ext === ".json"
        ? "application/json"
        : "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${path.basename(filePath)}"`,
  });

  fs.createReadStream(filePath).pipe(res);
  return true;
}

function listFixtureFiles(baseUrl: string) {
  if (!fs.existsSync(FILE_DIR)) return [];

  return fs
    .readdirSync(FILE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const fullPath = path.join(FILE_DIR, entry.name);
      return {
        name: entry.name,
        size: fs.statSync(fullPath).size,
        url: `${baseUrl}/${encodeURIComponent(entry.name)}`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function htmlVisitado(mecanismo: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Webhook · ${mecanismo}</title>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center;
           justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: white; border-radius: 8px; padding: 2rem 3rem;
            box-shadow: 0 2px 8px rgba(0,0,0,.1); text-align: center; }
    h1 { margin: 0 0 .5rem; color: #333; }
    p  { margin: 0; color: #666; }
    code { background: #eee; padding: .1rem .4rem; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Webhook visitado</h1>
    <p>Mecanismo: <code>${mecanismo}</code></p>
    <p>El servidor está activo y escuchando.</p>
  </div>
</body>
</html>`;
}

interface NonceVerificacion {
  curl: string;
  status: number;
  response: unknown;
}

function saveDocumentosDigitales(
  method: string,
  headers: Record<string, string | string[] | undefined>,
  query: Record<string, string>,
  body: unknown,
  nonceVerificacion?: NonceVerificacion,
): string {
  const dir = path.join(OUTPUT_DIR, "documentos-digitales");
  fs.mkdirSync(dir, { recursive: true });

  const timestamp = dayjs().format("YYYY-MM-DD_HH-mm-ss");
  const filename = `${timestamp}-documentos-digitales.json`;
  const filePath = path.join(dir, filename);

  fs.writeFileSync(
    filePath,
    JSON.stringify(
      { receivedAt: timestamp, method, headers, query, body, nonceVerificacion },
      null,
      2,
    ),
  );

  return filePath;
}

// ── SERVER ───────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  const start = Date.now();

  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", `http://localhost`);

  logger.section(`${method} ${url.pathname}`, 0);

  try {
    // ── FILE DOWNLOAD ────────────────────────────────────────────
    const fileMatch = FILE_ROUTE_PATTERN.exec(url.pathname);

    if (fileMatch && method === "GET") {
      const fileName = fileMatch[1];
      const fileBase = `http://localhost:${PORT}${PATH_PREFIX}/file`;

      if (!fileName) {
        logger.info("Listado de archivos fixture");
        const files = listFixtureFiles(fileBase);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify(
            {
              dir: FILE_DIR,
              total: files.length,
              files,
            },
            null,
            2,
          ),
        );
        return;
      }

      logger.info("Descarga de archivo");

      if (fileName.includes("..") || fileName.includes("/")) {
        logger.warn("Nombre de archivo inválido");

        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Nombre de archivo inválido" }));
        return;
      }

      const decodedName = decodeURIComponent(fileName);
      if (decodedName.includes("..") || decodedName.includes("/")) {
        logger.warn("Nombre de archivo inválido");

        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Nombre de archivo inválido" }));
        return;
      }
      const filePath = path.join(FILE_DIR, decodedName);

      logger.info(`Archivo: ${decodedName}`);
      logger.debug("Ruta completa", filePath);

      const ok = sendFile(res, filePath);

      if (!ok) {
        logger.warn("Archivo no encontrado");

        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Archivo no encontrado" }));
        return;
      }

      logger.ok("Archivo enviado");
      return;
    }

    // ── DOCUMENTOS DIGITALES ────────────────────────────────────
    if (DOCUMENTOS_DIGITALES_PATTERN.test(url.pathname)) {
      logger.info("Validando JWT (documentos-digitales)");

      const token = extractBearer(req);
      if (!token) {
        logger.warn("Token no proporcionado");
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Bearer token requerido" }));
        return;
      }

      try {
        JwtService.verify(token);
        logger.ok("JWT válido");
      } catch (err) {
        logger.error("JWT inválido", err);
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "JWT inválido" }));
        return;
      }

      const query: Record<string, string> = {};
      url.searchParams.forEach((value, key) => { query[key] = value; });

      const headers: Record<string, string | string[] | undefined> = { ...req.headers };
      const body = method === "GET" ? null : await readBody(req);

      logger.info("Recibiendo datos en documentos-digitales");
      logger.debug("Query", query);
      logger.debug("Body", body);

      if (method === "GET") {
        const nonce = query["nonce"];

        if (!nonce) {
          logger.warn("Nonce no proporcionado");
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Query param 'nonce' requerido" }));
          return;
        }

        if (!DOC_DIGITAL_URL_BASE || !DOC_DIGITAL_TOKEN) {
          logger.warn("DOC_DIGITAL_URL_BASE o DOC_DIGITAL_TOKEN no configurados");
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Servicio de verificación no configurado" }));
          return;
        }

        logger.info(`Verificando nonce: ${nonce}`);
        const result = await verificarNonce(DOC_DIGITAL_URL_BASE, DOC_DIGITAL_TOKEN, nonce);

        let responseJson: unknown;
        try { responseJson = JSON.parse(result.rawResponse); } catch { responseJson = result.rawResponse; }

        const filePath = saveDocumentosDigitales(method, headers, query, body, {
          curl: result.curl,
          status: result.status,
          response: responseJson,
        });

        logger.ok("Datos guardados");
        logger.info(`Archivo: ${filePath}`);
        logger.debug("curl", result.curl);
        logger.info(`Respuesta HTTP verificación: ${result.status}`);
        logger.debug("response", result.rawResponse);

        if (!result.ok) {
          logger.warn(`Nonce inválido (${result.status}): ${result.data.mensaje}`);
          res.writeHead(result.status, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result.data));
          return;
        }

        logger.ok("Nonce verificado correctamente");

        const ok = sendFile(res, fixturesPaths.validPdf);
        if (!ok) {
          logger.warn("PDF no encontrado — ejecuta npm run qa:fixtures");
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "PDF no encontrado. Ejecuta: npm run qa:fixtures" }));
        } else {
          logger.ok("PDF enviado");
        }
        return;
      }

      const filePath = saveDocumentosDigitales(method, headers, query, body);

      logger.ok("Datos guardados");
      logger.info(`Archivo: ${filePath}`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, savedAt: filePath }));
      return;
    }

    // ── WEBHOOK ─────────────────────────────────────────────────
    const match = MECANISMO_PATTERN.exec(url.pathname);

    if (!match) {
      logger.warn("Ruta no encontrada");

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Ruta no encontrada" }));
      return;
    }

    const mecanismo = match[1];

    // ── GET ─────────────────────────────────────────────────────
    if (method === "GET") {
      logger.info(`Webhook consultado: ${mecanismo}`);

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(htmlVisitado(mecanismo));

      logger.ok("Respuesta enviada");
      return;
    }

    // ── WRITE METHODS ───────────────────────────────────────────
    if (WRITE_METHODS.includes(method)) {
      if (JWT_ENABLED) {
        logger.info("Validando JWT");

        const token = extractBearer(req);

        if (!token) {
          logger.warn("Token no proporcionado");

          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Bearer token requerido" }));
          return;
        }

        try {
          JwtService.verify(token);
          logger.ok("JWT válido");
        } catch (err) {
          logger.error("JWT inválido", err);

          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "JWT inválido" }));
          return;
        }
      }

      const body = await readBody(req);

      logger.info(`Procesando webhook: ${mecanismo}`);
      logger.debug("Payload", body);

      const filePath = savePayload(mecanismo, method, body);

      logger.ok("Payload guardado");
      logger.info(`Archivo: ${filePath}`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, mecanismo, savedAt: filePath }));

      return;
    }

    // ── METHOD NOT ALLOWED ──────────────────────────────────────
    logger.warn(`Método no permitido: ${method}`);

    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `Método ${method} no permitido` }));
  } catch (err) {
    logger.error("Error interno", err);

    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  } finally {
    logger.info(`Duración: ${Date.now() - start}ms`);
  }
});

// ── START ───────────────────────────────────────────────────────
server.listen(PORT, () => {
  const webhookBase = `http://localhost:${PORT}${PATH_PREFIX}/webhook`;
  const fileBase = `http://localhost:${PORT}${PATH_PREFIX}/file`;

  logger.section("Servidor iniciado", 0);

  logger.info(`Puerto: ${PORT}`);
  logger.info(`Webhook: ${webhookBase}/:mecanismo`);
  logger.info(`Files: ${fileBase}/:name`);
  logger.info(`Documentos Digitales: http://localhost:${PORT}${PATH_PREFIX}/documentos-digitales`);
  logger.info(`JWT: ${JWT_ENABLED ? "habilitado" : "deshabilitado"}`);
});
