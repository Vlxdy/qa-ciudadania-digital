import fs from "fs";
import path from "path";
import { logger } from "../utils/logger.util";

export class CurlService {
  static generateNotificadorCurl(
    fileName: string,
    issuer: string,
    token: string,
    outputDir: string,
  ) {
    const bodyFileName = `body-final.${fileName}.json`;
    const curlFileName = `${fileName}.curl.sh`;

    const curl = `curl -X POST "${issuer}/api/notificacion/natural" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  --data @${bodyFileName}
`;

    const filePath = path.join(outputDir, curlFileName);

    fs.writeFileSync(filePath, curl);

    logger.ok(`Curl guardado en: ${filePath}`);
  }
}
