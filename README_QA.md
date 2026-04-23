# QA Runner — Ciudadanía Digital

Runner de pruebas de integración HTTP para los servicios de Ciudadanía Digital. Ejecuta escenarios contra APIs reales, genera artefactos `curl` reproducibles y reporta resultados en consola, JSON y JUnit XML.

---

## Tabla de contenidos

1. [Requisitos previos](#1-requisitos-previos)
2. [Instalación](#2-instalación)
3. [Configuración del entorno](#3-configuración-del-entorno)
   - 3.1 [Variables globales / operador QA](#31-variables-globales--operador-qa)
   - 3.2 [Módulo Notificador](#32-módulo-notificador)
   - 3.3 [Módulo Notificador — Jurídico](#33-módulo-notificador--jurídico)
   - 3.4 [Módulo Notificador — Delegado](#34-módulo-notificador--delegado)
   - 3.5 [Módulo Notificador — Obligatorio Legal y Requerimiento](#35-módulo-notificador--obligatorio-legal-y-requerimiento)
   - 3.6 [Módulo Aprobador](#36-módulo-aprobador)
   - 3.7 [Módulo Proveedor OIDC](#37-módulo-proveedor-oidc)
   - 3.8 [Módulo Avisos](#38-módulo-avisos)
   - 3.9 [Módulo QR Seguro](#39-módulo-qr-seguro)
   - 3.10 [Módulo Documentos Digitales](#310-módulo-documentos-digitales)
   - 3.11 [Fixtures personalizados](#311-fixtures-personalizados)
4. [Ejecución](#4-ejecución)
   - 4.1 [Comandos disponibles](#41-comandos-disponibles)
   - 4.2 [Todos los flags](#42-todos-los-flags)
   - 4.3 [Filtros combinables](#43-filtros-combinables)
5. [Módulos y escenarios](#5-módulos-y-escenarios)
   - 5.1 [Notificador](#51-notificador-81-escenarios)
   - 5.2 [Aprobador](#52-aprobador-34-escenarios)
   - 5.3 [QR Seguro](#53-qr-seguro-26-escenarios)
   - 5.4 [Proveedor](#54-proveedor-13-escenarios)
   - 5.5 [Avisos](#55-avisos-12-escenarios)
   - 5.6 [Documentos Digitales](#56-documentos-digitales-11-escenarios)
6. [Fixtures de prueba](#6-fixtures-de-prueba)
7. [Artefactos de salida](#7-artefactos-de-salida)
8. [Comparación con run anterior](#8-comparación-con-run-anterior)
9. [Múltiples ambientes](#9-múltiples-ambientes)
10. [Integración CI/CD](#10-integración-cicd)
11. [Estructura del proyecto](#11-estructura-del-proyecto)

---

## 1. Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 20 |
| npm | 10 |
| Playwright (Chromium) | instalado vía `npx playwright install` |

Los escenarios del módulo **Proveedor** y algunos de **Aprobador/Delegado** usan Playwright para completar flujos de autenticación en el navegador. El resto son llamadas HTTP puras.

---

## 2. Instalación

```bash
npm install
npx playwright install chromium
```

---

## 3. Configuración del entorno

Copia el `.env` de ejemplo y ajusta las variables marcadas como **REQUERIDA**:

```bash
cp .env .env.local
```

Convención usada en esta sección:

- **REQUERIDA** — debes reemplazar el valor con el dato real de tu ambiente (URL, token, CI, contraseña). Sin este valor el módulo fallará.
- **OPCIONAL** — ya tiene un valor funcional en el `.env` de ejemplo. Solo la modifiques si tu configuración es diferente al ejemplo.

---

### 3.1 Variables globales / operador QA

El **operador QA** es la persona que actúa como notificador, autoridad, representante delegado y titular QR en los escenarios. Se define una sola vez y todos los módulos lo usan como fallback.

```env
# OPCIONAL — activa logs extra en algunos flujos
DEBUG=true

# OPCIONAL — muestra (false) u oculta (true) el navegador en flujos Playwright
BROWSER_HEADLESS=true

# ── Operador QA ──────────────────────────────────────────────────────────────
# REQUERIDA — tipo de documento del operador: CI | CIE
QA_OPERADOR_TIPO_DOC=CI

# REQUERIDA — número de documento del operador
QA_OPERADOR_NUMERO_DOC=12345678

# REQUERIDA — fecha de nacimiento del operador (YYYY-MM-DD)
QA_OPERADOR_FECHA_NAC=1980-01-15

# REQUERIDA — cédula para login en el portal (debe coincidir con QA_OPERADOR_NUMERO_DOC)
CEDULA_IDENTIDAD=12345678

# REQUERIDA — contraseña del portal para el operador
CONTRASENA=MiClave123

# ── Ciudadano notificado principal ───────────────────────────────────────────
# REQUERIDA — tipo de documento del ciudadano que recibirá notificaciones: CI | CIE
NOTI_NOTIFICADO_TIPO_DOC=CI

# REQUERIDA — número de documento del ciudadano notificado
NOTI_NOTIFICADO_NUMERO_DOC=5585535

# REQUERIDA — fecha de nacimiento del ciudadano notificado (YYYY-MM-DD)
NOTI_NOTIFICADO_FECHA_NAC=1974-01-31

# REQUERIDA para noti-20 — número de documento del ciudadano extranjero (CIE)
NOTI_NOTIFICADO_CIE_NUMERO_DOC=10132067

# REQUERIDA para noti-20 — fecha de nacimiento del ciudadano extranjero (YYYY-MM-DD)
NOTI_NOTIFICADO_CIE_FECHA_NAC=2002-01-02
```

> Las variables `NOTI_NOTIFICADOR_*`, `NOTI_AUTORIDAD_*`, `QR_SEGURO_TITULAR_*` y `NOTI_DELEGADO_REPRESENTANTE_*` toman los datos del operador QA como fallback automático. Solo defínelas si un escenario requiere una persona distinta para ese rol.

---

### 3.2 Módulo Notificador

Escenarios `noti-*`, `renv-*`, `esta-*` y `comp-*`.

```env
# ── Conexión ─────────────────────────────────────────────────────────────────
# REQUERIDA — URL base del servicio notificador
ISSUER_NOTIFICADOR=https://notificador.dominio.gob.bo/ws

# REQUERIDA — token de configuración JWT emitido por Developer
TOKEN_CONFIGURACION=eyJhbGci...

# REQUERIDA — ruta al archivo de clave pública RSA (relativa al proyecto)
RSA_PUBLIC_KEY_PATH=./keys/public.pem

# OPCIONAL — modo de padding RSA: PKCS1 | OAEP
#            el .env de ejemplo usa OAEP; cambiar solo si tu clave usa PKCS1
RSA_PADDING=OAEP

# OPCIONAL — si true, usa clave AES fija en lugar de generar una nueva por escenario
USE_FIXED_AES=false

# OPCIONAL — solo se usan si USE_FIXED_AES=true
FIXED_AES_KEY_HEX=
FIXED_IV_HEX=

# ── Contenido de la notificación ─────────────────────────────────────────────
# OPCIONAL — título de la notificación; el ejemplo tiene un valor funcional
NOTI_TITULO=Notificación de prueba QA

# OPCIONAL — descripción de la notificación; el ejemplo tiene un valor funcional
NOTI_DESCRIPCION=Se notifica al ciudadano sobre el proceso de prueba automatizada.

# ── Enlace principal (tipo APROBACION) ───────────────────────────────────────
# REQUERIDA — URL del archivo adjunto (debe ser HTTPS y accesible desde el servidor)
NOTI_ENLACE_URL=https://mi-servidor.com/archivo/documento.pdf

# OPCIONAL — etiqueta visible del enlace; el ejemplo tiene un valor funcional
NOTI_ENLACE_ETIQUETA=Documento QA

# OPCIONAL — tipo del enlace: FIRMA | APROBACION; el ejemplo usa APROBACION
NOTI_ENLACE_TIPO=APROBACION

# OPCIONAL — hash SHA-256 del archivo; si se deja vacío se calcula automáticamente
NOTI_ENLACE_HASH=

# ── Enlace firmado (tipo FIRMA) ───────────────────────────────────────────────
# REQUERIDA para noti-19 — URL del archivo firmado digitalmente (debe ser HTTPS)
NOTI_ENLACE_FIRMA_URL=https://mi-servidor.com/archivo/firmado.pdf

# OPCIONAL — etiqueta del enlace firmado; el ejemplo tiene un valor funcional
NOTI_ENLACE_FIRMA_ETIQUETA=Documento Firmado QA

# OPCIONAL — hash del archivo firmado; si vacío se calcula automáticamente
NOTI_ENLACE_FIRMA_HASH=

# ── Formulario ───────────────────────────────────────────────────────────────
# REQUERIDA para escenarios con formulario — URL del formulario (debe ser HTTPS)
NOTI_FORMULARIO_URL=https://mi-servidor.com/formulario.pdf

# OPCIONAL — etiqueta del formulario; el ejemplo tiene un valor funcional
NOTI_FORMULARIO_ETIQUETA=Formulario QA

# OPCIONAL — tipo: FIRMA | APROBACION; el ejemplo usa APROBACION
NOTI_FORMULARIO_TIPO=APROBACION

# OPCIONAL — hash del formulario; si vacío se calcula automáticamente
NOTI_FORMULARIO_HASH=

# ── Entidad notificadora ──────────────────────────────────────────────────────
# OPCIONAL — código de la entidad notificadora;
#            si vacío usa la entidad origen del token de configuración
NOTI_ENTIDAD_NOTIFICADORA=
```

---

### 3.3 Módulo Notificador — Jurídico

Escenarios `juri-*`. Notificaciones a personas jurídicas.

```env
# REQUERIDA — código de la entidad jurídica principal a notificar
NOTI_JURIDICO_CODIGO_ENTIDAD=110

# OPCIONAL — segunda entidad jurídica; solo necesaria para juri-20 (múltiples notificados)
#            el ejemplo tiene un valor funcional
NOTI_JURIDICO_CODIGO_ENTIDAD_2=259
```

> Reutiliza el contenido de notificación (`NOTI_TITULO`, `NOTI_ENLACE_*`, etc.) de la sección 3.2.

---

### 3.4 Módulo Notificador — Delegado

Escenarios `dele-*` e `inde-*`. Delegación y desactivación de buzón de entidad.

```env
# REQUERIDA — código de la entidad cuyo buzón se delega
NOTI_DELEGADO_CODIGO_ENTIDAD=416

# OPCIONAL — descripción de la solicitud de delegación; el ejemplo tiene un valor funcional
NOTI_DELEGADO_DESCRIPCION=Solicitud de delegación de buzón de entidad para pruebas QA.

# OPCIONAL — si se define, el runner intenta aprobar la delegación automáticamente
#            en el portal autorizador mediante Playwright
DELEGADO_APPROVAL_URL_BASE=https://notificador-autorizador.dominio.gob.bo/home

# OPCIONAL — tiempo máximo de espera para la aprobación en el portal (ms)
DELEGADO_APPROVAL_TIMEOUT_MS=120000
```

> El representante legal del delegado usa los datos de `QA_OPERADOR_*` como fallback. Define `NOTI_DELEGADO_REPRESENTANTE_TIPO_DOC`, `NOTI_DELEGADO_REPRESENTANTE_NUMERO_DOC` y `NOTI_DELEGADO_REPRESENTANTE_FECHA_NAC` solo si es una persona distinta al operador.

---

### 3.5 Módulo Notificador — Obligatorio Legal y Requerimiento

Escenarios `obl-legal-*` y `obl-req-*`. Requieren tokens de configuración con carácter especial, distintos al token principal.

```env
# ── Carácter Obligatorio Legal ────────────────────────────────────────────────
# REQUERIDA — issuer del servicio con carácter obligatorio legal
ISSUER_NOTIFICADOR_OBL_LEGAL=https://notificador.dominio.gob.bo/ws

# REQUERIDA — token de configuración para carácter obligatorio legal
TOKEN_CONFIGURACION_OBL_LEGAL=eyJhbGci...

# ── Carácter Obligatorio Requerimiento ────────────────────────────────────────
# REQUERIDA — issuer del servicio con carácter obligatorio requerimiento
ISSUER_NOTIFICADOR_OBL_REQ=https://notificador.dominio.gob.bo/ws

# REQUERIDA — token de configuración para carácter obligatorio requerimiento
TOKEN_CONFIGURACION_OBL_REQ=eyJhbGci...
```

---

### 3.6 Módulo Aprobador

Escenarios `apro-*`. Aprobación y verificación de documentos PDF y JSON.

```env
# REQUERIDA — URL base del servicio aprobador (sin trailing slash)
APROBADOR_URL=https://aprobador.dominio.gob.bo

# REQUERIDA — token de cliente para autenticación
TOKEN_CLIENTE=eyJhbGci...

# OPCIONAL — modo de cálculo del hash del documento: BUFFER | BASE64
#            el ejemplo usa BASE64; cambiar solo si el servidor espera BUFFER
HASH_MODE=BASE64

# OPCIONAL — endpoint donde el aprobador notifica el resultado (para listener Playwright)
APROBACION_RESULT_ENDPOINT=/api/solicitudes

# OPCIONAL — patrón JSON para detectar aprobación exitosa en la respuesta
APROBACION_SUCCESS_PATTERN="\"aprobado\":true"

# OPCIONAL — tiempo máximo de espera del resultado del aprobador (ms)
APROBACION_WAIT_TIMEOUT_MS=120000
```

---

### 3.7 Módulo Proveedor OIDC

Escenarios `prov-*`. Flujos de autenticación OAuth2/OIDC (Authorization Code y PKCE móvil).

```env
# ── Cliente web (flujo Authorization Code) ───────────────────────────────────
# REQUERIDA — URL base del proveedor OIDC
OIDC_ISSUER=https://proveedor.dominio.gob.bo

# REQUERIDA — Client ID registrado en Developer
OIDC_CLIENT_ID=mi-client-id

# REQUERIDA — Client Secret del cliente
OIDC_CLIENT_SECRET=mi-client-secret

# REQUERIDA — URI de redirección registrada (debe coincidir exactamente con la registrada)
OIDC_REDIRECT_URI=https://mi-servidor.com/webhook/proveedor

# OPCIONAL — URI de redirección post-logout; el ejemplo la iguala a OIDC_REDIRECT_URI
OIDC_POST_LOGOUT_REDIRECT_URI=https://mi-servidor.com/webhook/proveedor

# OPCIONAL — scopes solicitados; el ejemplo incluye offline_access
OIDC_SCOPE=openid profile offline_access

# OPCIONAL — ruta del endpoint de token; el ejemplo usa /token
OIDC_TOKEN_PATH=/token

# OPCIONAL — método de autenticación del cliente: post | basic | mobile
OIDC_CLIENT_AUTH_METHOD=post

# OPCIONAL — parámetros adicionales del flujo; los valores del ejemplo son funcionales
OIDC_SESSION=true
OIDC_PROPERTY=user
OIDC_AUTH_PATH=/auth
OIDC_PROMPT=login
OIDC_USE_PKCE=false
OIDC_TIMEOUT_MS=180000

# ── Cliente móvil PKCE (escenarios prov-10 / prov-11 / prov-12) ─────────────
# REQUERIDA para prov-10/11/12 — Client ID del cliente móvil (sin secret, con PKCE S256)
OIDC_MOBILE_CLIENT_ID=mi-mobile-client-id

# REQUERIDA para prov-10/11/12 — URI de redirección del cliente móvil
OIDC_MOBILE_REDIRECT_URI=bo.gob.nombre-sistema.rpa:/oauth2redirect

# OPCIONAL — scopes del cliente móvil; el ejemplo incluye scopes extendidos
OIDC_MOBILE_SCOPE=openid profile fecha_nacimiento email celular
```

> Los escenarios `prov-00`, `prov-01` y `prov-10` usan Playwright para completar el login en el portal del proveedor. Las credenciales son `CEDULA_IDENTIDAD` y `CONTRASENA` de la sección 3.1.

---

### 3.8 Módulo Avisos

Escenarios `avis-*`. Envío de avisos push a ciudadanos.

```env
# REQUERIDA — URL base del servicio de avisos (sin trailing slash)
AVISOS_URL_BASE=https://avisos.dominio.gob.bo/ws

# REQUERIDA — token de autenticación para el servicio de avisos
AVISOS_TOKEN=eyJhbGci...

# REQUERIDA — código UUID de la plantilla de aviso registrada en Developer
AVISOS_CODIGO_PLANTILLA=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# REQUERIDA — UUID del ciudadano destino principal
AVISOS_UUID_CIUDADANO=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# OPCIONAL — UUID de un segundo ciudadano; necesario para avis-02 (envío múltiple)
#            el ejemplo tiene un valor funcional
AVISOS_UUID_CIUDADANO_2=yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy

# OPCIONAL — valor del parámetro variable de la plantilla; el ejemplo tiene un valor funcional
AVISOS_PARAMETRO_1=Ciudadano QA

# OPCIONAL — URL de redirección al tocar el aviso; el ejemplo tiene un valor funcional
AVISOS_PARAMETRO_REDIRECCION=tramite/qa-test
```

---

### 3.9 Módulo QR Seguro

Escenarios `qrsg-*`, `qran-*` y `qrcf-*`. Generación, confirmación y anulación de QR seguros.

```env
# REQUERIDA — URL base del servicio QR Seguro (sin trailing slash)
QR_SEGURO_URL_BASE=https://qr-seguro.dominio.gob.bo/ws

# REQUERIDA — token de autenticación para el servicio
QR_SEGURO_TOKEN=eyJhbGci...

# REQUERIDA — código del documento digital asociado al QR (creado en Developer)
QR_SEGURO_CODIGO_DOCUMENTO=R20-2024-000124QA

# OPCIONAL — nombre del documento; el ejemplo tiene un valor funcional
QR_SEGURO_NOMBRE_DOCUMENTO=Certificado QA de Prueba

# OPCIONAL — descripción del documento; el ejemplo tiene un valor funcional
QR_SEGURO_DESCRIPCION_DOCUMENTO=Documento generado por el runner QA.

# OPCIONAL — nombre completo del titular; el ejemplo tiene un valor funcional
QR_SEGURO_TITULAR_NOMBRE=CIUDADANO QA

# OPCIONAL — rol del titular en el documento; el ejemplo usa NATURAL
QR_SEGURO_TITULAR_ROL=NATURAL
```

> El tipo y número de documento del titular toman los valores de `QA_OPERADOR_TIPO_DOC` y `QA_OPERADOR_NUMERO_DOC` como fallback. Define `QR_SEGURO_TITULAR_TIPO_DOC` y `QR_SEGURO_TITULAR_NUMERO_DOC` solo si el titular es una persona distinta al operador.

---

### 3.10 Módulo Documentos Digitales

Escenarios `gen-nonce-*` y `nonce-*`. Generación y verificación de nonces para documentos digitales.

```env
# REQUERIDA — URL base del servicio de documentos digitales (sin trailing slash)
DOC_DIGITAL_URL_BASE=https://documentos-digitales.dominio.gob.bo/ws

# REQUERIDA — token de autenticación para el servicio
DOC_DIGITAL_TOKEN=eyJhbGci...

# REQUERIDA — UUID del documento digital creado en Developer
DOC_DIGITAL_CODIGO_DOCUMENTO=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

### 3.11 Fixtures personalizados

Por defecto el runner genera automáticamente los archivos de prueba en `output/qa/fixtures/`. Para usar archivos reales de tu ambiente (por ejemplo, un PDF firmado auténtico) define las siguientes variables:

```env
# OPCIONAL — reemplaza el PDF válido simple; el ejemplo apunta a un archivo real de casos/
QA_FIXTURE_VALID_PDF_PATH=casos/mi-documento.pdf

# OPCIONAL — reemplaza el PDF con campos de firma; el ejemplo apunta a un archivo real de casos/
QA_FIXTURE_SIGNED_PDF_PATH=casos/mi-documento-firmado.pdf

# OPCIONAL — los siguientes se auto-generan si están vacíos
QA_FIXTURE_VALID_PDF_1MB_PATH=
QA_FIXTURE_VALID_PDF_20MB_PATH=
QA_FIXTURE_EMPTY_PDF_PATH=
QA_FIXTURE_CORRUPTED_PDF_PATH=
QA_FIXTURE_TXT_PATH=
QA_FIXTURE_DOCX_PATH=
QA_FIXTURE_PNG_PATH=
QA_FIXTURE_VALID_JSON_PATH=
QA_FIXTURE_INVALID_PEM_PATH=
```

---

## 4. Ejecución

### 4.1 Comandos disponibles

```bash
# Ejecutar todos los escenarios (177 en total)
npm run qa

# Solo escenarios con carácter obligatorio legal
npm run qa:obl-legal

# Solo escenarios con carácter obligatorio requerimiento
npm run qa:obl-req

# Generar los fixtures de prueba y salir (sin ejecutar escenarios)
npm run qa:fixtures
```

### 4.2 Todos los flags

Los flags se pasan con `--` antes del primer argumento:

```bash
npm run qa -- [flags]
```

| Flag | Descripción |
|---|---|
| `--module=<nombre>` | Ejecutar solo un módulo |
| `--tag=<tag>` | Ejecutar solo escenarios con ese tag |
| `--id=<id>` | Ejecutar un escenario específico |
| `--dry-run` | Listar qué escenarios correrían sin ejecutarlos |
| `--retry=<n>` | Reintentar escenarios fallidos hasta N veces |
| `--env=<nombre>` | Cargar `.env.<nombre>` sobre el `.env` base |
| `--save` | Guardar reporte JSON en `output/qa/reports/` (acumula historial) |
| `--junit` | Guardar reporte JUnit XML en `output/qa/reports/` (para CI/CD) |
| `--fixtures` | Solo regenerar fixtures y salir |
| `--help` | Mostrar ayuda |

Módulos válidos: `notificador` · `aprobador` · `proveedor` · `avisos` · `qr-seguro` · `documentos-digitales`

Tags más comunes: `happy` · `negative` · `auth` · `validation` · `obligatorio-legal` · `obligatorio-requerimiento`

### 4.3 Filtros combinables

```bash
# Un módulo completo
npm run qa -- --module=aprobador

# Por tag en todos los módulos
npm run qa -- --tag=happy

# Por tag dentro de un módulo
npm run qa -- --module=notificador --tag=negative

# Un escenario específico
npm run qa -- --id=noti-07

# Ver qué correría un filtro sin ejecutar
npm run qa -- --module=proveedor --dry-run

# Con reintentos para fallos de red transitorios
npm run qa -- --module=notificador --retry=2

# Contra ambiente staging
npm run qa -- --env=staging

# Guardar historial y JUnit en una sola corrida
npm run qa -- --save --junit
```

---

## 5. Módulos y escenarios

### 5.1 Notificador (81 escenarios)

| Subgrupo | Prefijo | Escenarios | Descripción |
|---|---|---|---|
| Notificación natural | `noti-` | 01–20 | Envío de notificaciones a personas naturales |
| Notificación jurídica | `juri-` | 01–22 | Envío de notificaciones a personas jurídicas |
| Estado y comprobante | `esta-` / `comp-` | 01–06 c/u | Consulta de estado y descarga de comprobante |
| Reenvío | `renv-` | 01–06 | Reenvío de notificaciones existentes |
| Delegado de entidad | `dele-` | 01–10 | Solicitud de delegación de buzón |
| Inactivar delegado | `inde-` | 01–08 | Desactivación de delegación |
| Obligatorio legal | `obl-legal-` | 01 | Happy path con carácter obligatorio legal |
| Obligatorio requerimiento | `obl-req-` | 00–01 | Aceptación y happy path obligatorio requerimiento |

### 5.2 Aprobador (34 escenarios)

| Prefijo | Rango | Descripción |
|---|---|---|
| `apro-` | 01–14 | Happy paths, autenticación y tipos de archivo |
| `apro-` | 15–22 | Modos de hash, base64, UUIDs y campos requeridos |
| `apro-` | 23–27 | Happy paths con JSON |
| `apro-` | 28–32 | Verificación de documentos aprobados |

### 5.3 QR Seguro (26 escenarios)

| Subgrupo | Prefijo | Escenarios | Descripción |
|---|---|---|---|
| Generación | `qrsg-` | 01–13 | Creación de QR seguros con titulares |
| Confirmación | `qrcf-` | 01–06 | Confirmación de QR generados |
| Anulación | `qran-` | 01–07 | Anulación de QR existentes |

### 5.4 Proveedor (13 escenarios)

| Prefijo | Rango | Descripción |
|---|---|---|
| `prov-` | 00–09 | Login navegador y flujo Authorization Code |
| `prov-` | 10–12 | Flujo PKCE móvil |

### 5.5 Avisos (12 escenarios)

| Prefijo | Rango | Descripción |
|---|---|---|
| `avis-` | 01–12 | Envío individual, múltiple, validaciones y casos negativos |

### 5.6 Documentos Digitales (11 escenarios)

| Subgrupo | Prefijo | Escenarios | Descripción |
|---|---|---|---|
| Generador de nonce | `gen-nonce-` | 01–05 | Generación de nonces para documentos |
| Verificación de nonce | `nonce-` | 01–06 | Verificación y casos de nonce expirado/inválido |

---

## 6. Fixtures de prueba

Al iniciar, el runner genera automáticamente los archivos de prueba en `output/qa/fixtures/`:

| Archivo | Uso |
|---|---|
| `valid.pdf` | PDF válido pequeño (~300 bytes) |
| `signed.pdf` | PDF con campos de firma |
| `valid-1mb.pdf` | PDF de ~1 MB (pruebas de tamaño) |
| `valid-20mb.pdf` | PDF de ~20 MB (pruebas de límite) |
| `empty.pdf` | PDF vacío |
| `corrupted.pdf` | PDF corrupto (pruebas de validación) |
| `document.txt` | Tipo de archivo no soportado |
| `document.docx` | Tipo de archivo no soportado |
| `image.png` | Tipo de archivo no soportado |
| `valid.json` | JSON válido |
| `invalid-key.pem` | Clave criptográfica inválida |

Para usar archivos reales del ambiente define las variables `QA_FIXTURE_*` de la [sección 3.11](#311-fixtures-personalizados). Para regenerar sin ejecutar tests:

```bash
npm run qa:fixtures
```

---

## 7. Artefactos de salida

### Curls reproducibles

Después de cada corrida se guarda en `output/qa/curls/run-<timestamp>/` un directorio por módulo y escenario con:

- **`request.sh`** — comando `curl` ejecutable que reproduce la petición exactamente como fue enviada (con headers, token y body)
- **`response.json`** — respuesta completa del servidor con metadatos (status HTTP, body, duración, fallos detectados)
- **`data.json`** — body de la petición como archivo separado cuando supera 350 caracteres

```
output/qa/curls/
└── run-2026-04-23T10-00-00-000Z/
    ├── aprobador/
    │   ├── apro-01/
    │   │   ├── request.sh
    │   │   └── response.json
    │   └── apro-02/
    │       ├── request.sh
    │       ├── data.json
    │       └── response.json
    └── notificador/
        └── noti-01/
            ├── request.sh
            └── response.json
```

### Reporte JSON (--save)

```bash
npm run qa -- --save
```

Guarda un reporte completo en `output/qa/reports/qa-report-<timestamp>.json` con todos los resultados, escenarios omitidos, tiempos y metadatos. Es la base para la [comparación con run anterior](#8-comparación-con-run-anterior).

### Reporte JUnit XML (--junit)

```bash
npm run qa -- --junit
```

Guarda `output/qa/reports/qa-report-<timestamp>.xml` compatible con GitHub Actions, GitLab CI y Jenkins. Cada módulo es un `<testsuite>`, cada escenario un `<testcase>`. Los fallidos incluyen el mensaje de error completo.

---

## 8. Comparación con run anterior

Al finalizar cada corrida, el runner busca automáticamente el JSON más reciente en `output/qa/reports/` y muestra una sección de diferencias:

```
──────────────────────────────────────────────────────────────────
  COMPARACIÓN CON RUN ANTERIOR
──────────────────────────────────────────────────────────────────
  ⚠  3 nuevo(s) en fallar:
    ✖  apro-05  (aprobador)
    ✖  noti-12  (notificador)
  ✔  2 ahora pasa(n):
    ✔  apro-01  (aprobador)
    4 escenario(s) sigue(n) fallando desde el run anterior.
```

Para acumular historial hay que usar `--save` en cada corrida:

```bash
# Primera corrida — genera la línea base
npm run qa -- --save

# Corridas siguientes — compara automáticamente y actualiza el historial
npm run qa -- --save
```

Sin historial previo, la sección muestra un aviso indicando que se debe activar `--save`.

---

## 9. Múltiples ambientes

Crea un archivo `.env.<nombre>` con las variables que difieren respecto al `.env` base y pasa `--env=<nombre>`. El runner carga primero `.env` y luego sobreescribe con las variables del archivo de ambiente específico.

```bash
# Crear archivo de ambiente
cp .env .env.staging
# Editar .env.staging — solo las variables que cambian respecto a .env

# Ejecutar contra staging
npm run qa -- --env=staging
npm run qa -- --env=staging --module=aprobador
npm run qa -- --env=prod --save --junit
```

El `.env.staging` solo necesita contener las variables que cambian. Las que no aparezcan se toman del `.env` base.

---

## 10. Integración CI/CD

### GitHub Actions

```yaml
- name: Ejecutar QA
  run: npm run qa -- --junit
  continue-on-error: true

- name: Publicar resultados
  uses: mikepenz/action-junit-report@v4
  with:
    report_paths: output/qa/reports/*.xml
```

### GitLab CI

```yaml
qa:
  script:
    - npm run qa -- --junit
  artifacts:
    reports:
      junit: output/qa/reports/*.xml
    when: always
```

### Jenkins

```groovy
junit 'output/qa/reports/*.xml'
```

---

## 11. Estructura del proyecto

```
src/qa/
├── index.ts                          # CLI principal — parseo de args y orquestación
├── config/
│   └── qa-env.ts                     # Variables de entorno (con soporte --env=)
├── fixtures/
│   ├── generator.ts                  # Generador de archivos de prueba
│   └── paths.ts                      # Rutas a los fixtures
├── http/
│   └── qa-http.ts                    # Cliente HTTP (nunca lanza en 4xx/5xx)
├── runner/
│   ├── scenario.runner.ts            # Motor de ejecución (filtros, reintentos)
│   └── report.service.ts             # Consola, JSON, JUnit XML, diff
├── types/
│   └── scenario.types.ts             # Tipos: Scenario, ScenarioResult, evaluate()
├── services/                         # Servicios compartidos entre módulos
│   ├── qa-body-builder.ts
│   ├── qa-body-builder-juridico.ts
│   ├── qa-body-builder-delegado.ts
│   ├── qa-crypto.service.ts
│   ├── qa-file.service.ts
│   ├── qa-playwright-approval.service.ts
│   ├── qa-playwright-delegado-approval.service.ts
│   └── helpers.ts
└── scenarios/
    ├── notificador/                  # 81 escenarios en 8 subgrupos
    │   ├── noti-*.ts                 # Notificación natural (01–20)
    │   ├── juridico/                 # juri-* (01–22)
    │   ├── estado/                   # esta-* y comp-* (01–06)
    │   ├── reenvio/                  # renv-* (01–06)
    │   ├── delegado/                 # dele-* (01–10)
    │   ├── inactivar-delegado/       # inde-* (01–08)
    │   ├── obligatorio-legal/        # obl-legal-* (01)
    │   └── obligatorio-requerimiento/# obl-req-* (00–01)
    ├── aprobador/                    # 34 escenarios — apro-* (01–32)
    ├── qr-seguro/                    # 26 escenarios
    │   ├── qrsg-*.ts                 # Generación (01–13)
    │   ├── confirmacion/             # qrcf-* (01–06)
    │   └── anulacion/                # qran-* (01–07)
    ├── proveedor/                    # 13 escenarios — prov-* (00–12)
    ├── avisos/                       # 12 escenarios — avis-* (01–12)
    └── documentos-digitales/         # 11 escenarios
        ├── generador-nonce/          # gen-nonce-* (01–05)
        └── nonce/                    # nonce-* (01–06)
```

### Convención de IDs de escenarios

| Prefijo | Módulo |
|---|---|
| `noti-` | Notificador natural |
| `juri-` | Notificador jurídico |
| `esta-` / `comp-` | Estado y comprobante |
| `renv-` | Reenvío |
| `dele-` | Delegado de entidad |
| `inde-` | Inactivar delegado |
| `obl-legal-` | Obligatorio legal |
| `obl-req-` | Obligatorio requerimiento |
| `apro-` | Aprobador |
| `qrsg-` | QR Seguro — generación |
| `qrcf-` | QR Seguro — confirmación |
| `qran-` | QR Seguro — anulación |
| `prov-` | Proveedor OIDC |
| `avis-` | Avisos |
| `gen-nonce-` | Generador de nonce |
| `nonce-` | Verificación de nonce |
