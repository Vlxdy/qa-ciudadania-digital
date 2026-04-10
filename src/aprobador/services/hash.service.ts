import crypto from "crypto";

export class HashService {
  static sha256(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  static sha256FromBase64String(base64: string): string {
    return crypto
      .createHash("sha256")
      .update(Buffer.from(base64, "utf-8"))
      .digest("hex");
  }
}
