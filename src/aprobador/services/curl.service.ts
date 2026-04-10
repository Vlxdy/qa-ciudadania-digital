import fs from 'fs';
import path from 'path';

export class CurlService {
  static save(
    outputDir: string,
    body: any,
    url: string,
    token: string,
    filenameBase: string,
  ) {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const bodyPath = path.join(outputDir, `${filenameBase}.body.json`);
    const curlPath = path.join(outputDir, `${filenameBase}.curl.sh`);

    fs.writeFileSync(bodyPath, JSON.stringify(body, null, 2));

    const curl = `curl -X POST "${url}/api/solicitudes" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  --data @${path.basename(bodyPath)}
`;

    fs.writeFileSync(curlPath, curl);
    fs.chmodSync(curlPath, '755');

    return { bodyPath, curlPath };
  }
}