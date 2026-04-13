import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

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

      reject(new Error(`Comando falló (${command} ${args.join(" ")}) con código ${code}`));
    });
  });
}

async function main() {
  const input = process.argv[2];

  if (!input) {
    console.error("❌ Debes pasar un archivo o directorio para el aprobador");
    process.exit(1);
  }

  const fullPath = path.resolve(input);
  if (!fs.existsSync(fullPath)) {
    console.error("❌ Ruta no existe:", fullPath);
    process.exit(1);
  }

  console.log("\n🚀 Paso 1/2: ejecutando mecanismo de proveedor...\n");
  await runCommand("npm", ["run", "proveedor"]);

  const outputDir = process.env.OUTPUT_DIR ?? "./output";
  const tokenFilePath = path.join(outputDir, "proveedor.token.json");

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

  console.log("\n🚀 Paso 2/2: ejecutando mecanismo de aprobador...\n");

  const envForAprobador: NodeJS.ProcessEnv = {
    ...process.env,
    ACCESS_TOKEN_CIUDADANIA: proveedorAccessToken,
  };

  await runCommand(
    "npm",
    ["run", "aprobador", "--", fullPath],
    envForAprobador,
  );

  console.log("\n✅ Flujo principal completado: proveedor y aprobador ejecutados.");
}

main().catch((error: any) => {
  console.error("❌ Error en flujo principal:");
  console.error(error.message || error);
  process.exit(1);
});
