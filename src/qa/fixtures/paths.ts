import path from 'path';

const DIR = path.resolve('./output/qa/fixtures');

export const fixturesPaths = {
  dir: DIR,
  // PDFs
  validPdf:    path.join(DIR, 'valid.pdf'),
  signedPdf:   path.join(DIR, 'signed.pdf'),
  validPdf1mb: path.join(DIR, 'valid-1mb.pdf'),
  validPdf20mb: path.join(DIR, 'valid-20mb.pdf'),
  emptyPdf:    path.join(DIR, 'empty.pdf'),
  corruptedPdf: path.join(DIR, 'corrupted.pdf'),
  // Tipos no soportados
  txtFile:     path.join(DIR, 'document.txt'),
  docxFile:    path.join(DIR, 'document.docx'),
  pngFile:     path.join(DIR, 'image.png'),
  // JSON
  validJson:   path.join(DIR, 'valid.json'),
  // Criptografía
  invalidPem:  path.join(DIR, 'invalid-key.pem'),
} as const;
