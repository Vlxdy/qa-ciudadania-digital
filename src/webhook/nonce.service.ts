import https from "https";
import http from "http";

export interface NonceDatos {
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
}

export interface NonceVerificadoOk {
  finalizado: true;
  timestamp: number;
  mensaje: string;
  datos: NonceDatos;
}

export interface NonceVerificadoError {
  finalizado: false;
  codigo: number;
  timestamp: number;
  mensaje: string;
}

export type NonceVerificadoResult =
  | { status: number; ok: true; data: NonceVerificadoOk; curl: string; rawResponse: string }
  | { status: number; ok: false; data: NonceVerificadoError; curl: string; rawResponse: string };

function buildCurl(urlStr: string, token: string, body: string): string {
  return [
    `curl -s -X POST '${urlStr}'`,
    `  -H 'Content-Type: application/json'`,
    `  -H 'Authorization: Bearer ${token}'`,
    `  -d '${body}'`,
  ].join(" \\\n");
}

export async function verificarNonce(
  urlBase: string,
  token: string,
  nonce: string,
): Promise<NonceVerificadoResult> {
  const url = new URL("api/nonce/verificar", urlBase.replace(/\/?$/, "/"));
  const body = JSON.stringify({ nonce });
  const curl = buildCurl(url.toString(), token, body);

  const lib = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          Authorization: `Bearer ${token}`,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk: Buffer) => { raw += chunk.toString(); });
        res.on("end", () => {
          const status = res.statusCode ?? 0;
          let data: unknown;
          try {
            data = JSON.parse(raw);
          } catch {
            data = { finalizado: false, codigo: status, mensaje: `Respuesta no JSON: ${raw}` };
          }
          if (status === 201) {
            resolve({ status, ok: true, data: data as NonceVerificadoOk, curl, rawResponse: raw });
          } else {
            resolve({ status, ok: false, data: data as NonceVerificadoError, curl, rawResponse: raw });
          }
        });
      },
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
