# Guía Oficial de Despliegue y Configuración Segura — Backend Google Apps Script (SGD Duncan 2.0)

> [!IMPORTANT]
> **ESTADO DE DETENCIÓN OBLIGATORIA (FASE 3 — HARD STOP)**
> El código del backend (`Code.gs`) y el frontend PWA han sido completamente blindados, testeados y compilados localmente sin errores. 
> De acuerdo con las directrices de seguridad de **Turbo Mode**, **la ejecución se detiene aquí para solicitar la autorización explícita del usuario** antes de realizar cualquier actualización en el entorno de producción de Google Apps Script o sobre la base de datos viva en Google Sheets.

---

## 1. Resumen de Mejoras de Seguridad en `Code.gs`
El nuevo backend serverless `Code.gs` reemplaza completamente la versión anterior e incorpora los siguientes controles de seguridad de grado industrial:

1. **Gestión Segura de Credenciales (`PropertiesService`)**:
   - Eliminación de todas las contraseñas en texto plano, correos personales y claves maestras del código fuente.
   - Lectura segura de secretos mediante `PropertiesService.getScriptProperties()`.

2. **Sesiones con Tokens Criptográficos HMAC-SHA256**:
   - Emisión de tokens de sesión con firma criptográfica HMAC-SHA256 y tiempo de vida (TTL 24 horas).
   - Inclusión de claims (`sub`, `email`, `rol`, `exp`, `iat`).

3. **Hashing de Contraseñas con Salt + Pepper y Migración Transparente**:
   - Implementación de `hashPassword(password, salt)` usando `Utilities.computeHmacSha256Signature` con un Salt aleatorio de 16 bytes y un Pepper secreto del servidor.
   - Migración transparente: Al primer inicio de sesión de un usuario existente en texto plano, el sistema valida la clave, genera automáticamente su Salt y almacena el hash criptográfico en la hoja, eliminando el texto plano de inmediato.

4. **Comparación Timing-Safe (`timingSafeEqual`)**:
   - Prevención total de ataques de canal lateral (Timing Attacks) en la verificación de hashes y firmas de token.

5. **Mitigación Estricta de Formula Injection (CSV/Sheets Injection)**:
   - Función `sanitizeCell()` que detecta caracteres de inyección de fórmulas (`=`, `+`, `-`, `@`, `\t`, `\r`) y antepone un apóstrofo `'` para forzar su interpretación como texto literal.

6. **Control de Concurrencia Transaccional (`LockService`)**:
   - Envoltura de todas las escrituras en `withScriptLock(15000, callback)`. Previene condiciones de carrera (*Race Conditions*) durante sincronizaciones simultáneas de cuadrillas en campo.

7. **Rate Limiting Anti-Fuerza Bruta y Anti-Abuso (`CacheService`)**:
   - Bloqueo temporal tras 5 intentos fallidos de login en 15 minutos.
   - Limitación de emisión de códigos OTP a 3 solicitudes por cuenta cada 30 minutos.

8. **Recuperación de Contraseña con OTP Seguro**:
   - Generación de códigos OTP en servidor almacenados temporalmente en `CacheService` (15 min) y enviados vía `MailApp`.
   - Cero exposición de códigos OTP en las respuestas HTTP hacia el cliente.

---

## 2. Variables de Configuración Mandatorias (`Script Properties`)

Antes de publicar la nueva versión de la Web App en Google Apps Script, debe configurar las siguientes propiedades de script en el editor de Apps Script:

| Propiedad | Descripción | Ejemplo / Valor Recomendado |
| :--- | :--- | :--- |
| `SPREADSHEET_ID` | ID de la hoja de cálculo de producción de Google Sheets | `1dH0vgYL80DDpwPcdwwaxsg9qCNvNahCbCUxlzDejcFU` |
| `JWT_SECRET` | Clave secreta para la firma de tokens HMAC-SHA256 (64 caracteres hex) | Generar valor aleatorio de alta entropía |
| `PEPPER_SECRET` | Secreto maestro del servidor para el hashing de contraseñas | Generar valor aleatorio de alta entropía |
| `INITIAL_ADMIN_EMAIL` | Correo institucional del Administrador Principal inicial | `admin@duncan.com.ve` |
| `INITIAL_ADMIN_PASSWORD` | Contraseña temporal para el primer acceso del administrador | Generar contraseña de alta seguridad (mín. 12 caracteres) |

> [!TIP]
> Puede generar cadenas seguras de 64 caracteres hex ejecutando en PowerShell:
> ```powershell
> -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Minimum 0 -Maximum 256) })
> ```

---

## 3. Instrucciones Paso a Paso para el Despliegue en Producción

### Paso 1: Acceder al Editor de Google Apps Script
1. Abra la hoja de cálculo de Google Sheets: [SGD Duncan 2.0 DB](https://docs.google.com/spreadsheets/d/1dH0vgYL80DDpwPcdwwaxsg9qCNvNahCbCUxlzDejcFU/edit).
2. En el menú superior, haga clic en **Extensiones** > **Apps Script**.

### Paso 2: Configurar las Propiedades del Script (`Script Properties`)
1. En el panel izquierdo del editor de Apps Script, haga clic en el ícono de engranaje ⚙️ (**Configuración del proyecto**).
2. Desplácese hasta la sección **Propiedades de la secuencia de comandos**.
3. Haga clic en **Editar las propiedades de la secuencia de comandos** > **Agregar propiedad**.
4. Agregue las 5 variables descritas en la tabla de la Sección 2:
   - `SPREADSHEET_ID` = `1dH0vgYL80DDpwPcdwwaxsg9qCNvNahCbCUxlzDejcFU`
   - `JWT_SECRET` = `[su_clave_secreta_hex_generada]`
   - `PEPPER_SECRET` = `[su_pepper_secreto_hex_generada]`
   - `INITIAL_ADMIN_EMAIL` = `admin@duncan.com.ve`
   - `INITIAL_ADMIN_PASSWORD` = `[su_clave_temporal_inicial]`
5. Haga clic en **Guardar propiedades de la secuencia de comandos**.

### Paso 3: Reemplazar el Código de `Code.gs`
1. En el panel izquierdo, haga clic en el ícono de editor `<>` (**Editor**).
2. Seleccione el archivo `Code.gs`.
3. Seleccione todo el contenido existente (`Ctrl + A`) y bórrelo.
4. Abra el archivo local blindado:
   [`google-apps-script/Code.gs`](file:///c:/Users/Lenovo/OneDrive/Documentos/SGD%202.0/sgd-duncan-pwa/google-apps-script/Code.gs)
5. Copie todo el código y péguelo en el editor de Apps Script.
6. Guarde los cambios (`Ctrl + S`).

### Paso 4: Ejecutar Inicialización de Estructura (`setupSpreadsheet`)
1. En la barra de herramientas superior del editor, en el menú desplegable de funciones, seleccione la función **`setupSpreadsheet`**.
2. Haga clic en **Ejecutar**.
3. Si Google solicita permisos de autorización (*Revisar permisos*):
   - Seleccione su cuenta de Google Workspace/Gmail autorizada.
   - Haga clic en *Configuración avanzada* > *Ir a SGD Duncan 2.0 (no seguro)*.
   - Conceda los permisos requeridos (Google Sheets, MailApp, PropertiesService).
4. Verifique en el registro de ejecución que aparezca `Spreadsheet configurado con éxito`. Esto asegurará que las columnas de seguridad (`salt`, `isHashed`) estén creadas en la hoja `Usuarios`.

### Paso 5: Implementar Nueva Versión de la Web App
1. En la esquina superior derecha, haga clic en el botón azul **Implementar** > **Administrar implementaciones**.
2. Seleccione la implementación activa de tipo **Aplicación web**.
3. Haga clic en el ícono de lápiz ✏️ (**Editar**).
4. En el campo **Versión**, seleccione **Nueva versión**.
5. Descripción: `SGD 2.0 - Zero Trust Hardening v2.0`.
6. Configuración de acceso:
   - **Ejecutar como**: *Yo (propietario del script)*
   - **Quién tiene acceso**: *Cualquier usuario* (la seguridad se valida internamente mediante tokens HMAC-SHA256 y RBAC).
7. Haga clic en **Implementar**.
8. Confirme que la URL de `/exec` coincida con la configurada en la PWA:
   `https://script.google.com/macros/s/AKfycbxRGmBAY7Msgz3eRGz2nGGaZs_wp0inmNPanRXANtVDGr2tjRJFpsQVud6NfFXmCI4AIQ/exec`

---

## 4. Matriz de Verificación y Pruebas Post-Despliegue (Smoke Tests)

Una vez completado el despliegue de la nueva versión de `Code.gs`:

- [ ] **Prueba 1: Consulta de Estado (`ping`)**
  - Enviar solicitud GET: `https://script.google.com/macros/s/.../exec?action=ping`
  - Respuesta esperada: `{"status":"ok","timestamp":...,"service":"SGD Duncan 2.0 API","version":"2.0.0-hardened"}`
- [ ] **Prueba 2: Inicio de Sesión y Migración Transparente**
  - Iniciar sesión con un usuario existente.
  - Verificar que el backend retorne un token HMAC y que en la hoja `Usuarios` de Google Sheets la columna `isHashed` cambie a `TRUE` y `salt` contenga un valor de 16 bytes hex.
- [ ] **Prueba 3: Intento de Acceso sin Token a Endpoints Protegidos**
  - Enviar solicitud POST `saveInspeccion` sin token.
  - Respuesta esperada: HTTP 401 / `Token de sesión no proporcionado`.
- [ ] **Prueba 4: Sanitización de Fórmulas**
  - Guardar una inspección con observaciones `=cmd|' /C calc'!A0`.
  - Verificar en la celda de Google Sheets que se almacene `'=cmd|' /C calc'!A0` con apóstrofo inicial.
- [ ] **Prueba 5: Rate Limiting**
  - Probar 6 logins consecutivos con contraseña incorrecta.
  - Verificar que a partir del 6º intento retorne `Demasiados intentos fallidos. Intente de nuevo en 15 minutos.`

---

## 5. Contacto y Soporte de Seguridad
- **Sistema**: Sistema de Gestión Digital Duncan 2.0 (SGD)
- **Supervisión**: Servicio de Seguridad y Salud en el Trabajo (SSST)
- **Empresa**: Acumuladores Duncan, S.A.
