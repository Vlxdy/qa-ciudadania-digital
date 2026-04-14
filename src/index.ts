import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { logger } from "./utils/logger.util";

dotenv.config();

function runCommand(command: string, args: string[], env?: NodeJS.ProcessEnv) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: env ?? process.env,
      shell: false,
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Comando falló (${command} ${args.join(" ")}) con código ${code}`,
        ),
      );
    });
  });
}

async function main() {
  const input = process.argv[2];

  if (!input) {
    logger.error(
      "Debes pasar un archivo o directorio para el aprobador",
      undefined,
      0,
    );
    process.exit(1);
  }

  const fullPath = path.resolve(input);
  if (!fs.existsSync(fullPath)) {
    logger.error("Ruta no existe: " + fullPath, undefined, 0);
    process.exit(1);
  }

  logger.step(1, 2, "Proveedor — obteniendo access token");
  await runCommand("npm", ["run", "proveedor"]);

  const outputDir = process.env.OUTPUT_DIR ?? "./output";
  const tokenFilePath = path.join(
    outputDir,
    "proveedor",
    "proveedor.token.json",
  );

  if (!fs.existsSync(tokenFilePath)) {
    throw new Error(
      `No se encontró el token del proveedor en ${tokenFilePath}. Verifica el login OAuth.`,
    );
  }

  const tokenPayload = JSON.parse(fs.readFileSync(tokenFilePath, "utf-8"));
  const proveedorAccessToken = tokenPayload?.access_token;

  if (!proveedorAccessToken) {
    throw new Error("El archivo proveedor.token.json no contiene access_token");
  }

  logger.step(2, 2, "Aprobador — procesando archivos");

  const envForAprobador: NodeJS.ProcessEnv = {
    ...process.env,
    ACCESS_TOKEN_CIUDADANIA: proveedorAccessToken,
  };

  await runCommand(
    "npm",
    ["run", "aprobador", "--", fullPath],
    envForAprobador,
  );

  logger.done("Flujo principal completado — proveedor y aprobador ejecutados");
}

main().catch((error: any) => {
  logger.error("Error en flujo principal", error, 0);
  process.exit(1);
});
