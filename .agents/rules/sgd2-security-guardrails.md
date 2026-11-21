# Reglas Permanentes de Seguridad y Blindaje — SGD Duncan 2.0 (Zero-Trust)

Este documento define las políticas mandatorias y reglas de codificación para cualquier agente, desarrollador o proceso de CI/CD que interactúe con el repositorio de **SGD Duncan 2.0**.

---

## 1. Cero Credenciales en Código (Zero Hardcoded Secrets)
- **Prohibido terminantemente** incluir contraseñas maestras, contraseñas por defecto, tokens de GitHub/GitLab, claves de API o correos electrónicos personales (`@gmail.com`) en archivos TypeScript, JavaScript, JSON o Markdown del código fuente.
- Toda configuración de credenciales del backend debe residir exclusivamente en **`PropertiesService.getScriptProperties()`** de Google Apps Script (`SPREADSHEET_ID`, `JWT_SECRET`, `PEPPER_SECRET`, `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`).
- En el frontend, las URLs de conexión deben ser dinámicas o provistas por variables de entorno protegidas (`VITE_*`) o configuración autenticada.

---

## 2. Protección de PII y Datos Médicos Ocupacionales (Privacidad por Diseño)
- **Prohibido** almacenar nóminas masivas de empleados con PII real (nombres completos, cédulas, sueldos, cargos) dentro de archivos de inicialización (`seedEmpleados.ts`, `seedData.ts`). Solo se permiten datos sintéticos/demo anonimizados.
- Las evaluaciones médicas ocupacionales (plombemia, espirometría, audiometría, historias médicas) deben encriptarse en reposo local mediante la **Web Crypto API** (`AES-GCM-256` con derivación `PBKDF2` y 100,000 iteraciones).
- Ningún dato de salud puede exponerse a roles no autorizados (inspección básica u operativa).

---

## 3. Autenticación y Control de Sesión (Zero-Trust Auth)
- Todas las sesiones deben estar amparadas por un **token criptográfico HMAC-SHA256** con tiempo de vida limitado (TTL de 24 horas) emitido por el backend.
- Las contraseñas deben ser almacenadas y verificadas mediante hashing seguro: **Salt criptográfico (16 bytes hex) + Pepper de servidor + HMAC-SHA256**.
- La comparación de hashes y tokens debe realizarse siempre mediante funciones **`timingSafeEqual`** de tiempo constante para prevenir ataques de canal lateral (Timing Attacks).
- Se prohíben terminantemente los métodos de suplantación de identidad en cliente (`switchUser`, botones "Usar" sin login previo) y atajos de restablecimiento de contraseña que no requieran validación OTP estricta.

---

## 4. Mitigación de Formula Injection (CSV/Sheets Injection)
- Todo dato ingresado por usuarios o inspectores que vaya a ser escrito en Google Sheets debe pasar obligatoriamente por la rutina de sanitización **`sanitizeCell()`**:
  - Si una celda inicia con caracteres de ejecución (`=`, `+`, `-`, `@`, `\t`, `\r`), se antepone un apóstrofo `'` para forzar su interpretación como texto literal seguro.
  - Esto previene exfiltración forzada de datos (`=IMPORTXML`, `=IMAGE`) y ejecución de comandos DDE en exportaciones de Excel.

---

## 5. Concurrencia y Bloqueos de Transacción (LockService)
- Toda operación de escritura en Google Sheets (`saveInspeccion`, `saveUsuario`, `saveEvaluacionMedica`, `saveDotacion`, etc.) debe estar envuelta en un bloque **`withScriptLock(15000, callback)`**.
- Esto garantiza consistencia ACID, previene condiciones de carrera (*Race Conditions*) y evita la sobreescritura accidental entre múltiples cuadrillas de inspectores sincronizando en paralelo.

---

## 6. Rate Limiting Anti-Abuso (CacheService)
- El endpoint de autenticación (`login`) no debe permitir más de 5 intentos fallidos cada 15 minutos por dirección IP / correo.
- El endpoint de solicitud de código de recuperación (`solicitarCodigoRecuperacion`) no debe permitir más de 3 solicitudes cada 30 minutos por cuenta.

---

## 7. Registro de Auditoría Inmutable (Cryptographic Audit Log)
- Toda acción crítica (creación/edición de usuarios, login, cambios de contraseña, auditorías) debe ser registrada con hash criptográfico SHA-256 encadenado (*Hash Chaining* con `previousHash`).
- Ningún registro de auditoría puede ser sobrescrito o eliminado desde la interfaz de usuario.

---

## 8. Salvaguardas de Despliegue en Producción (Turbo Mode Safeguards)
- **Detención Obligatoria**: Jamás actualizar `Code.gs` en Google Apps Script ni alterar datos de producción en Google Sheets sin la autorización explícita del usuario y la entrega previa de la guía de despliegue (`APPS_SCRIPT_DEPLOY_GUIDE.md`).
- Todas las modificaciones de código deben ser respaldadas previamente en una rama o etiqueta git (`backup/pre-security-audit-sgd2`).
