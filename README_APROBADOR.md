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

# Listener de aprobación automática con Playwright
APROBACION_RESULT_ENDPOINT=/api/solicitudes
APROBACION_SUCCESS_PATTERN="\"aprobado\":true"
APROBACION_WAIT_TIMEOUT_MS=120000
BROWSER_HEADLESS=true
# [opcional, legado]
# APROBACION_HEADLESS=true
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

---

## 🔗 Flujo unificado (sin mezclar mecanismos)

Se agregó `src/index.ts` como orquestador principal para ejecutar ambos mecanismos **por separado**:

1. Ejecuta `proveedor` para login OAuth y genera `output/proveedor.token.json`.
2. Lee `access_token` desde ese archivo.
3. Ejecuta `aprobador` como proceso independiente, inyectando ese token en:
   - `TOKEN_CLIENTE`
   - `ACCESS_TOKEN_CIUDADANIA`

Comando:

```bash
npm run flujo -- ./assets/documento.pdf
```

Así `proveedor` y `aprobador` mantienen su código separado, pero se ejecutan en una sola corrida.

## ✅ Navegación automática al `response.datos.link` y escucha de endpoint

Cuando una solicitud de aprobación responde con:

```json
{
  "response": {
    "datos": {
      "link": "https://.../solicitudes/<uuid>"
    }
  }
}
```

el mecanismo de `aprobador` ahora:

1. Extrae automáticamente el `link`.
2. Abre el navegador con Playwright.
3. Navega a esa URL enviando `Authorization: Bearer <ACCESS_TOKEN_CIUDADANIA>`.
4. Espera una respuesta de red cuyo endpoint contenga `APROBACION_RESULT_ENDPOINT`.
5. Marca el resultado como aprobado cuando detecta `aprobado=true`, `finalizado=true` o un estado equivalente.

Este comportamiento se aplica tanto en aprobaciones **individuales** como **múltiples**.

## 🔐 Proveedor (inicio del flujo OAuth con Playwright)

Nuevo comando:

```bash
npm run proveedor
```

Variables principales (formato solicitado):

- `OIDC_ISSUER`
- `OIDC_CLIENT_ID`
- `OIDC_CLIENT_SECRET`
- `OIDC_SCOPE`
- `OIDC_REDIRECT_URI`
- `OIDC_POST_LOGOUT_REDIRECT_URI`

La URL de autorización se arma con estos parámetros obligatorios y adicionales:

- `client_id`, `scope`, `response_type=code`, `redirect_uri`, `state`, `nonce`
- `session=true`, `property=user`, `defaultStrategy=oidc`

Si `OIDC_REDIRECT_URI` es externo (no `localhost/127.0.0.1`), el script **no intenta abrir un server local**; captura el callback leyendo la URL final del navegador para evitar errores `EADDRNOTAVAIL`.

Opciones:

```bash
npm run proveedor -- --pkce
npm run proveedor -- --no-token
```

Archivos generados:

- `output/proveedor.callback.json`
- `output/proveedor.token.json`

### 🤖 Autollenado de credenciales (ejemplo)

Puedes activar autollenado en `.env` para que Playwright escriba usuario/clave automáticamente.

```env
OIDC_AUTO_LOGIN=true
OIDC_LOGIN_USER_SELECTOR=input[name="username"]
OIDC_LOGIN_PASSWORD_SELECTOR=input[name="password"]
OIDC_LOGIN_SUBMIT_SELECTOR=button[type="submit"]
OIDC_LOGIN_USERNAME=mi_usuario
OIDC_LOGIN_PASSWORD=mi_password
```

Si hay OTP/MFA:

```env
OIDC_LOGIN_OTP_SELECTOR=input[name="otp"]
OIDC_LOGIN_OTP_VALUE=123456
OIDC_LOGIN_OTP_SUBMIT_SELECTOR=button[type="submit"]
```

> El lugar donde van las “instrucciones de Playwright” es en estos selectores (`OIDC_LOGIN_*_SELECTOR`).
> Ajusta esos selectores inspeccionando tu HTML real del proveedor.
