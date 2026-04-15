import http from "http";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { JwtService } from "./jwt.service";
import { logger } from "../utils/logger.util";
import dayjs from "dayjs";

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
const FILE_DIR = "./casos";

const PATH_PREFIX = (process.env.WEBHOOK_PATH_PREFIX ?? "").replace(/\/+$/, "");
const JWT_ENABLED = process.env.WEBHOOK_JWT_ENABLED !== "false";

// ── PATTERNS ─────────────────────────────────────────────────────
const MECANISMO_PATTERN = new RegExp(
  `^${PATH_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/webhook/([a-zA-Z0-9_-]+)$`,
);

const FILE_ROUTE_PATTERN = new RegExp(
  `^${PATH_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/file/([^/]+)$`,
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

      logger.info("Descarga de archivo");

      if (fileName.includes("..") || fileName.includes("/")) {
        logger.warn("Nombre de archivo inválido");

        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Nombre de archivo inválido" }));
        return;
      }

      const filePath = path.join(FILE_DIR, fileName);

      logger.info(`Archivo: ${fileName}`);
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
  logger.info(`JWT: ${JWT_ENABLED ? "habilitado" : "deshabilitado"}`);
});
