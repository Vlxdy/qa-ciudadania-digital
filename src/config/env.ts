import dotenv from "dotenv";
import { z } from "zod";
import { logger } from "../utils/logger.util";

dotenv.config();

const EnvSchema = z.object({
  ISSUER_NOTIFICADOR: z.string().url(),
  TOKEN_CONFIGURACION: z.string().min(1),
  RSA_PUBLIC_KEY_PATH: z.string().min(1),

  RSA_PADDING: z.enum(["PKCS1", "OAEP"]).default("PKCS1"),

  USE_FIXED_AES: z
    .string()
    .optional()
    .transform((v) => v === "true"),

  FIXED_AES_KEY_HEX: z.string().optional().default(""),
  FIXED_IV_HEX: z.string().optional().default(""),

  OUTPUT_DIR: z.string().default("./output"),
  AUTO_SEND: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error("Variables de entorno inválidas", parsed.error.format(), 0);
  process.exit(1);
}

export const env = parsed.data;
