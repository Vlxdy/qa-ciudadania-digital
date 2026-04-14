import dotenv from "dotenv";
import { JwtService } from "./jwt.service";

dotenv.config();

const args = process.argv.slice(2);
const expiryArg = args.find((a) => a.startsWith("--expiry="));
const expiry = expiryArg?.split("=")[1];

const port = process.env.WEBHOOK_PORT ?? "4000";
const mecanismos = ["aprobador", "notificador", "proveedor"];

let token: string;
try {
  token = JwtService.sign({ sub: "webhook" }, expiry);
} catch (err: any) {
  console.error(`\n❌ Error: ${err.message}\n`);
  process.exit(1);
}

const expiryLabel = expiry ? `Expira en: ${expiry}` : "Sin expiración (permanente)";

console.log("\n════════════════════════════════════════════");
console.log("  JWT generado para el Webhook");
console.log("════════════════════════════════════════════");
console.log(`\n  ${expiryLabel}\n`);
console.log("  Token:\n");
console.log(`  ${token}\n`);
console.log("  URLs disponibles:");
mecanismos.forEach((m) => {
  console.log(`    /webhook/${m.padEnd(12)} → http://localhost:${port}/webhook/${m}`);
});
console.log("\n  Uso en header:");
console.log(`    Authorization: Bearer <token>\n`);
console.log("════════════════════════════════════════════\n");
