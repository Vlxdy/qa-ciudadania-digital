import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

type JwtPayload = Record<string, unknown> & {
  iat?: number;
  exp?: number;
};

function getSecret(): string {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("WEBHOOK_SECRET no está configurado en el .env");
  }
  return secret;
}

function parseExpiry(now: number, expiry: string): number {
  const match = expiry.match(/^(\d+)(s|m|h|d)$/);
  if (!match) {
    throw new Error(
      `Formato de expiración inválido: "${expiry}". Usa: 30s, 5m, 2h, 7d`,
    );
  }
  const value = parseInt(match[1], 10);
  const unit = match[2] as "s" | "m" | "h" | "d";
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return now + value * multipliers[unit];
}

export class JwtService {
  static sign(payload: Record<string, unknown>, expiry?: string): string {
    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" }),
    ).toString("base64url");

    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JwtPayload = {
      ...payload,
      iat: now,
      ...(expiry ? { exp: parseExpiry(now, expiry) } : {}),
    };

    const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString(
      "base64url",
    );
    const signingInput = `${header}.${payloadB64}`;

    const signature = crypto
      .createHmac("sha256", getSecret())
      .update(signingInput)
      .digest("base64url");

    return `${signingInput}.${signature}`;
  }

  static verify(token: string): JwtPayload {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Token con formato inválido");
    }

    const [header, payloadB64, signature] = parts;
    const signingInput = `${header}.${payloadB64}`;

    const expectedSig = crypto
      .createHmac("sha256", getSecret())
      .update(signingInput)
      .digest("base64url");

    const sigBuf = Buffer.from(signature, "base64url");
    const expBuf = Buffer.from(expectedSig, "base64url");

    if (
      sigBuf.length !== expBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expBuf)
    ) {
      throw new Error("Firma inválida");
    }

    const payload: JwtPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    );

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp !== undefined && payload.exp < now) {
      throw new Error("Token expirado");
    }

    return payload;
  }
}
