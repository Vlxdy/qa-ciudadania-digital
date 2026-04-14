import http from "http";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { JwtService } from "./jwt.service";
import { logger } from "../utils/logger.util";

dotenv.config();

const PORT = Number(process.env.WEBHOOK_PORT ?? 4000);
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "./output";
const PATH_PREFIX = (process.env.WEBHOOK_PATH_PREFIX ?? "").replace(/\/+$/, "");
const JWT_ENABLED = process.env.WEBHOOK_JWT_ENABLED !== "false";

const MECANISMO_PATTERN = new RegExp(
  `^${PATH_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/webhook/([a-zA-Z0-9_-]+)$`,
);
const WRITE_METHODS = ["POST", "PUT", "PATCH"];

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

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${timestamp}-${mecanismo}.json`;
  const filePath = path.join(dir, filename);

  fs.writeFileSync(
    filePath,
    JSON.stringify(
      {
        mecanismo,
        receivedAt: new Date().toISOString(),
        method,
        body,
      },
      null,
      2,
    ),
  );

  return filePath;
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

const server = http.createServer(async (req, res) => {
  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", `http://localhost`);
  const match = MECANISMO_PATTERN.exec(url.pathname);

  if (!match) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Ruta no encontrada" }));
    return;
  }

  const mecanismo = match[1];

  // ── GET: respuesta visual ───────────────────────────────────────────────────
  if (method === "GET") {
    logger.info(`[Webhook][${mecanismo}] GET recibido`);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(htmlVisitado(mecanismo));
    return;
  }

  // ── POST / PUT / PATCH: validar JWT y persistir ────────────────────────────
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

  // ── Método no permitido ─────────────────────────────────────────────────────
  res.writeHead(405, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: `Método ${method} no permitido` }));
});

server.listen(PORT, () => {
  const base = `http://localhost:${PORT}${PATH_PREFIX}/webhook`;
  logger.info(`[Webhook] Servidor escuchando en http://localhost:${PORT}`);
  logger.info(`[Webhook] Ruta base: ${base}/:mecanismo`);
  logger.info(`[Webhook] JWT: ${JWT_ENABLED ? "habilitado" : "deshabilitado"}`);
  logger.info("[Webhook] Métodos:");
  logger.info(`  GET              ${base}/:mecanismo  → verificar estado`);
  logger.info(`  POST / PUT / PATCH ${base}/:mecanismo  → recibir callback`);
});
