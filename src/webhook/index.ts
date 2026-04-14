import http from "http";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { JwtService } from "./jwt.service";
import { logger } from "../utils/logger.util";
import dayjs from "dayjs";

dotenv.config();

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
      if (!raw) {
        resolve(null);
        return;
      }
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

  // 🔥 mejor formato para archivos
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

function sendFile(res: http.ServerResponse, filePath: string) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Archivo no encontrado" }));
    return;
  }

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
  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", `http://localhost`);

  // ── FILE DOWNLOAD: /file/:name ────────────────────────────────
  const fileMatch = FILE_ROUTE_PATTERN.exec(url.pathname);

  if (fileMatch && method === "GET") {
    const fileName = fileMatch[1];

    // 🔐 protección básica
    if (fileName.includes("..") || fileName.includes("/")) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Nombre de archivo inválido" }));
      return;
    }

    const filePath = path.join(FILE_DIR, fileName);

    logger.info(`[File] Descargando → ${filePath}`);

    sendFile(res, filePath);
    return;
  }

  // ── WEBHOOK ───────────────────────────────────────────────────
  const match = MECANISMO_PATTERN.exec(url.pathname);

  if (!match) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Ruta no encontrada" }));
    return;
  }

  const mecanismo = match[1];

  // ── GET: respuesta visual ─────────────────────────────────────
  if (method === "GET") {
    logger.info(`[Webhook][${mecanismo}] GET recibido`);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(htmlVisitado(mecanismo));
    return;
  }

  // ── POST / PUT / PATCH ────────────────────────────────────────
  if (WRITE_METHODS.includes(method)) {
    if (JWT_ENABLED) {
      const token = extractBearer(req);

      if (!token) {
        logger.warn(`[Webhook][${mecanismo}] ${method} sin token`);
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: "Authorization: Bearer <jwt> requerido" }),
        );
        return;
      }

      try {
        JwtService.verify(token);
      } catch (err: any) {
        logger.warn(`[Webhook][${mecanismo}] JWT inválido — ${err.message}`);
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    const body = await readBody(req);
    const filePath = savePayload(mecanismo, method, body);

    logger.ok(`[Webhook][${mecanismo}] ${method} guardado → ${filePath}`);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, mecanismo, savedAt: filePath }));
    return;
  }

  // ── Método no permitido ───────────────────────────────────────
  res.writeHead(405, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: `Método ${method} no permitido` }));
});

// ── START ───────────────────────────────────────────────────────
server.listen(PORT, () => {
  const webhookBase = `http://localhost:${PORT}${PATH_PREFIX}/webhook`;
  const fileBase = `http://localhost:${PORT}${PATH_PREFIX}/file`;

  logger.info(`[Server] Escuchando en http://localhost:${PORT}`);
  logger.info(`[Webhook] Base: ${webhookBase}/:mecanismo`);
  logger.info(`[Files]   Base: ${fileBase}/:name`);
  logger.info(`[Webhook] JWT: ${JWT_ENABLED ? "habilitado" : "deshabilitado"}`);
});
