import chalk from "chalk";

function isDebug(): boolean {
  return process.env.DEBUG === "true";
}

function indent(depth: number): string {
  return "  ".repeat(depth);
}

function stepBox(label: string): string {
  const content = `  ${label}  `;
  const bar = "═".repeat(content.length);
  return [
    chalk.cyan.bold(`╔${bar}╗`),
    chalk.cyan.bold("║") + chalk.cyan.bold(content) + chalk.cyan.bold("║"),
    chalk.cyan.bold(`╚${bar}╝`),
  ].join("\n");
}

export const logger = {
  /**
   * Paso principal del flujo — dibuja una caja destacada.
   * depth: siempre al tope (sin indentación).
   *
   * logger.step(1, 2, "Proveedor — obteniendo access token")
   */
  step(current: number, total: number, msg: string): void {
    const label = `🚀  [${current}/${total}] ${msg}`;
    console.log("\n" + stepBox(label));
  },

  /**
   * Subsección dentro de un paso.
   * depth default: 1 (2 espacios).
   *
   * logger.section("Iniciando OAuth PKCE")
   * logger.section("Detalle interno", 2)
   */
  section(msg: string, depth = 1): void {
    console.log(
      `\n${indent(depth)}${chalk.magenta.bold("▸")} ${chalk.white.bold(msg)}`,
    );
  },

  /**
   * Acción en curso — mensaje informativo neutro.
   * depth default: 2 (4 espacios).
   *
   * logger.info("Codificando a Base64")
   */
  info(msg: string, depth = 2): void {
    console.log(`${indent(depth)}${chalk.gray("·")} ${chalk.white(msg)}`);
  },

  /**
   * Resultado exitoso de una acción.
   * depth default: 2 (4 espacios).
   *
   * logger.ok("Token guardado correctamente")
   */
  ok(msg: string, depth = 2): void {
    console.log(
      `${indent(depth)}${chalk.green.bold("✔")} ${chalk.green(msg)}`,
    );
  },

  /**
   * Advertencia no fatal.
   * depth default: 2 (4 espacios).
   *
   * logger.warn("CEDULA_IDENTIDAD no configurada")
   */
  warn(msg: string, depth = 2): void {
    console.warn(
      `${indent(depth)}${chalk.yellow.bold("⚠")} ${chalk.yellow(msg)}`,
    );
  },

  /**
   * Error — detiene o degrada el flujo.
   * Muestra err.message siempre; stack solo con DEBUG=true.
   * depth default: 2 (4 espacios).
   *
   * logger.error("Error en flujo proveedor", err)
   * logger.error("Ruta no existe", undefined, 0)
   */
  error(msg: string, err?: unknown, depth = 2): void {
    console.error(
      `${indent(depth)}${chalk.red.bold("✖")} ${chalk.red.bold(msg)}`,
    );
    if (err !== undefined) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object"
            ? JSON.stringify(err, null, 2)
            : String(err);
      console.error(`${indent(depth + 1)}${chalk.red(message)}`);
      if (isDebug() && err instanceof Error && err.stack) {
        console.error(chalk.gray(err.stack));
      }
    }
  },

  /**
   * Dato interno (objeto, token, payload) — solo visible con DEBUG=true.
   * depth default: 2 (4 espacios).
   *
   * logger.debug("access_token", token)
   * logger.debug("response", res, 3)
   */
  debug(label: string, data: unknown, depth = 2): void {
    if (!isDebug()) return;
    const raw =
      typeof data === "string" ? data : JSON.stringify(data, null, 2);
    const lines = raw.split("\n");
    const visible =
      lines.length > 20 ? [...lines.slice(0, 20), "  ..."] : lines;
    const joined = visible.join(`\n${indent(depth + 1)}`);
    console.log(
      `${indent(depth)}${chalk.gray("⬡")} ${chalk.gray(`${label}:`)} ${chalk.gray(joined)}`,
    );
  },

  /**
   * Mensaje final de éxito — siempre al tope (sin indentación).
   *
   * logger.done("Flujo completo — proveedor y aprobador ejecutados")
   */
  done(msg: string): void {
    console.log(`\n${chalk.green.bold("✔")}  ${chalk.green.bold(msg)}\n`);
  },
};
