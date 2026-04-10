# 📄 Aprobador Creator (QA Tool)

Herramienta CLI en TypeScript para generar y enviar solicitudes al servicio de **Aprobación de Ciudadanía Digital**, a partir de archivos reales (`PDF` o `JSON`).

---

## 🚀 Objetivo

Simplificar el QA de integraciones:

- Genera automáticamente:
  - `hashDocumento` (SHA-256)
  - `documento` (Base64)
  - `idTramite` (UUID)
- Permite probar:
  - PDFs reales
  - JSON reales
- Genera:
  - `body.json`
  - `curl.sh` reproducible
- Permite detectar inconsistencias de hashing

---

## 📦 Requisitos

- Node.js >= 18
- npm
- Proyecto configurado con TypeScript

---

## ⚙️ Instalación

```bash
npm install
```

---

## 🔧 Configuración

Crear archivo `.env`:

```env
APROBADOR_URL=https://aprobador-cd3.dev.agetic.gob.bo
TOKEN_CLIENTE=xxxxx
ACCESS_TOKEN_CIUDADANIA=xxxxx

# 🔥 IMPORTANTE (modo hash)
HASH_MODE=BUFFER
# o
# HASH_MODE=BASE64

OUTPUT_DIR=./output
```

---

## ▶️ Uso

### 📄 Con PDF

```bash
npm run aprobador -- ./assets/documento.pdf
```

---

### 📄 Con JSON

```bash
npm run aprobador -- ./assets/documento.json
```

---

### ✏️ Con descripción personalizada

```bash
npm run aprobador -- ./assets/test.pdf --desc="Contrato firmado 2026"
```

---

## 📁 Salida generada

```bash
output/
  archivo.body.json   # request listo
  archivo.curl.sh     # curl reproducible
```

---

## 🧾 Ejemplo de curl generado

```bash
curl -X POST "https://aprobador.../api/solicitudes" \
  -H "Authorization: Bearer ..." \
  -H "Content-Type: application/json" \
  --data @archivo.body.json
```

---

## 🔍 Modo Debug

El sistema imprime:

```bash
DEBUG hash: ...
DEBUG tipo: PDF | JSON
```

---

## ⚠️ Problema común: hash incorrecto

Si recibes:

```json
"mensaje": "El hash generado no coincide con el de la solicitud"
```

### 🔥 Solución

Cambiar en `.env`:

```env
HASH_MODE=BASE64
```

o

```env
HASH_MODE=BUFFER
```

👉 Uno de los dos modos coincidirá con el backend.

---

## 🧠 Explicación técnica

### HASH_MODE=BUFFER

```text
SHA256(binario del archivo)
```

### HASH_MODE=BASE64

```text
SHA256(string base64 del archivo)
```

> ⚠️ Algunos backends implementan incorrectamente el hashing sobre el base64.

---

## 🧪 Validación manual

```bash
# decodificar base64
echo "<BASE64>" | base64 -d > out.pdf

# verificar hash
sha256sum out.pdf
```

---

## 📂 Tipos soportados

| Tipo | Soporte |
|------|--------|
| PDF  | ✅ |
| JSON | ✅ |

---

## 🚫 No soportado

- XML
- DOCX
- Otros formatos

---

## 🧪 Casos de prueba recomendados (QA)

- ✅ PDF válido
- ❌ PDF corrupto
- ✅ JSON válido
- ❌ JSON mal formado
- 🔁 Cambios de HASH_MODE para validar backend
