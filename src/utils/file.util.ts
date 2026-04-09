import fs from 'fs';
import path from 'path';

export function readJsonFile<T>(filePath: string): T {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`No existe el archivo: ${absolutePath}`);
  }

  const raw = fs.readFileSync(absolutePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function readTextFile(filePath: string): string {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`No existe el archivo: ${absolutePath}`);
  }

  return fs.readFileSync(absolutePath, 'utf-8');
}

export function ensureDir(dirPath: string): void {
  const absolutePath = path.resolve(dirPath);

  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
}

export function writeJsonFile(filePath: string, data: unknown): void {
  const absolutePath = path.resolve(filePath);
  const dir = path.dirname(absolutePath);

  ensureDir(dir);

  fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2), 'utf-8');
}