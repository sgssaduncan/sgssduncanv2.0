# Runbook Operativo de Seguridad — SGD Duncan 2.0 (Zero-Trust)

Este manual operativo establece los procedimientos de gestión, administración y respuesta ante incidentes para mantener la postura de seguridad de **SGD Duncan 2.0**.

---

## 1. Arquitectura de Seguridad y Flujos de Autenticación

```
[ Cliente PWA (React) ]
         │
         ▼  (1) Solicitud de Login (Email + Password) vía HTTPS POST
[ Google Apps Script /exec ]
         │
         ├─► (2) Verificación de Rate Limiting (CacheService: máx. 5 intentos / 15 min)
         ├─► (3) Búsqueda en hoja 'Usuarios' con ScriptLock (15s)
         ├─► (4) Verificación Criptográfica:
         │        Salt (16-hex) + Pepper (ScriptProperties) + HMAC-SHA256
         │        Comparación timing-safe en tiempo constante
         │        (Si existía en texto plano, migración automática transparente)
         │
         ▼  (5) Generación de Token de Sesión HMAC-SHA256 (TTL 24h)
[ Respuesta al Cliente: Token de Sesión ]
         │
         ▼  (6) Almacenamiento seguro en memoria / IndexedDB
[ PWA lista para operar Online / Offline ]
```

---

## 2. Gestión del Ciclo de Vida de Usuarios y Credenciales

### 2.1 Alta de Nuevos Usuarios
1. Acceda a la plataforma con una cuenta de **Propietario / Super Admin** o **Admin**.
2. Navegue al módulo **Usuarios y Roles** (`/usuarios`).
3. Haga clic en **Nuevo Usuario**. El sistema generará automáticamente una contraseña aleatoria de alta entropía (12 caracteres).
4. Complete Nombre, Cédula, Correo, Sede, Cargo y Nivel de Acceso.
5. Al guardar, el backend recibirá la solicitud firmada con token HMAC y almacenará la contraseña aplicando inmediatamente Salt + Pepper.

### 2.2 Restablecimiento de Contraseñas
- **Autogestión por el Usuario (Costo Cero)**:
  1. En la pantalla de Login, seleccione **Recuperar Acceso**.
  2. Ingrese su correo registrado y haga clic en **Enviar Código OTP a mi Correo**.
  3. El backend generará un código de 6 dígitos con 15 minutos de vigencia almacenado en `CacheService` y lo enviará a su buzón vía `MailApp`.
  4. Ingrese el código OTP recibido junto con la nueva contraseña (mínimo 8 caracteres).
  5. El backend verificará el OTP de manera estricta y actualizará el hash de contraseña en la base de datos.
- **Asistencia Administrativa**:
  1. El Administrador puede ingresar a `/usuarios`, buscar al usuario y hacer clic en el ícono de llave (**Restablecer Contraseña**).
  2. Se generará una clave aleatoria temporal que el administrador podrá suministrar por canal seguro.

### 2.3 Baja y Desactivación de Acceso
1. En `/usuarios`, haga clic en **Editar Usuario** y desmarque la casilla **Usuario Activo**.
2. De inmediato, cualquier solicitud de inicio de sesión o renovación de token para esa cuenta será rechazada por el backend.
3. Si el usuario ya no pertenece a la empresa, haga clic en el ícono de papelera para eliminar su registro.

---

## 3. Verificación de Integridad Forense de la Bitácora (`AuditLog`)

La bitácora de auditoría implementa un encadenamiento criptográfico SHA-256 (*Hash Chaining*). Cada evento contiene el hash del evento precedente (`previousHash`), garantizando que cualquier manipulación o eliminación de registros rompa la cadena de custodia.

### Procedimiento de Verificación:
1. Ingrese a **Auditoría & Trazabilidad** (`/auditoria`).
2. Haga clic en el botón **Verificar Integridad Forense**.
3. El motor criptográfico recorrerá la cadena secuencialmente calculando:
   $$\text{Hash}_i = \text{SHA-256}(\text{Index}_i + \text{Timestamp}_i + \text{Usuario}_i + \text{Accion}_i + \text{Entidad}_i + \text{Detalles}_i + \text{Hash}_{i-1})$$
4. Si todos los hashes coinciden, el sistema certificará la inmutabilidad de los registros.

---

## 4. Procedimiento de Respuesta ante Incidentes (IRP)

### Incidente 1: Sospecha de Credenciales Comprometidas
1. Ingrese inmediatamente como Super Admin y desactive la cuenta afectada en `/usuarios`.
2. Restablezca la contraseña del usuario forzando una clave de alta entropía.
3. Si la cuenta comprometida corresponde a un Administrador Principal:
   - Acceda a Google Apps Script > Configuración del proyecto > Propiedades de la secuencia de comandos.
   - Regenere el `JWT_SECRET` y el `PEPPER_SECRET`. Al cambiar estos secretos, **todos los tokens de sesión activos quedarán automáticamente invalidados** en todos los dispositivos.

### Incidente 2: Fuga de URL de Web App (`/exec`)
- Gracias al modelo **Zero Trust** implementado, el conocimiento de la URL `/exec` no permite a un atacante leer ni escribir datos, ya que todos los endpoints operativos exigen un token de sesión HMAC-SHA256 válido.
- Como medida preventiva adicional, en Apps Script puede publicar una nueva implementación (**Nueva versión**) y actualizar la URL en la configuración de la PWA.

---

## 5. Automatización de Auditorías Periódicas

Se recomienda programar auditorías periódicas de seguridad mediante el comando `/automation` de Antigravity:
- **Verificación semanal de integridad de bitácora forense**.
- **Monitoreo mensual de cuentas inactivas (> 60 días sin login)**.
- **Auditoría de integridad de enlaces y dependencias de la PWA**.
