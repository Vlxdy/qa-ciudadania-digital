# QA Runner --- Estrategia de Automatización para Ciudadanía Digital

## 📌 Descripción General

El **QA Runner** es un framework de automatización orientado a pruebas
de integración HTTP que permite validar servicios reales de Ciudadanía
Digital mediante ejecución de escenarios controlados.

Está diseñado para: - Ejecutar pruebas contra APIs reales - Validar
flujos completos entre múltiples servicios - Generar evidencia
reproducible (`curl`) - Integrarse con pipelines CI/CD

------------------------------------------------------------------------

## 🎯 Objetivo

Asegurar la calidad de los servicios backend mediante: - Validación
automatizada de contratos API - Cobertura de escenarios funcionales y
negativos - Detección temprana de regresiones - Evidencia técnica
trazable para auditoría

------------------------------------------------------------------------

## 🧠 Enfoque QA aplicado

### ✔ Pruebas automatizadas:

-   Integración entre servicios
-   Validación de contratos (request/response)
-   Flujos críticos del negocio
-   Casos negativos (errores controlados)

### ❗ Pruebas no cubiertas (manuales):

-   UX/UI
-   Usabilidad
-   Validación visual
-   Experiencia de usuario

------------------------------------------------------------------------

## 🏗 Arquitectura del Sistema

-   Motor de ejecución
-   Cliente HTTP
-   Módulos funcionales
-   Generador de fixtures
-   Sistema de reportes
-   Integración Playwright

------------------------------------------------------------------------

## 🔧 Tecnologías utilizadas

-   Node.js
-   Playwright
-   JSON / JUnit reporting

------------------------------------------------------------------------

## 📦 Módulos principales

-   Notificador
-   Aprobador
-   QR Seguro
-   Proveedor OIDC
-   Avisos
-   Documentos Digitales

------------------------------------------------------------------------

## ⚙️ Características clave

### 🔁 Reproducibilidad

-   curl exacto
-   request/response completos

### 📊 Reportes

-   Consola
-   JSON
-   JUnit XML

### 🔍 Comparación de ejecuciones

-   Detección de regresiones

### 🌍 Multiambiente

-   Soporte `.env`

------------------------------------------------------------------------

## 🚀 Ejecución

``` bash
npm run qa
```

------------------------------------------------------------------------

## 🔗 CI/CD

Compatible con GitHub Actions, GitLab CI y Jenkins.

------------------------------------------------------------------------

## 📈 Impacto

### Ventajas

-   Menos errores en producción
-   Evidencia auditable
-   QA independiente

### Limitaciones

-   No cubre UX
-   Requiere mantenimiento

------------------------------------------------------------------------

## 🧭 Conclusión

El QA Runner permite automatizar pruebas de integración con control
total y evidencia reproducible.
