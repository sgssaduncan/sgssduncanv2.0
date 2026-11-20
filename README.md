# 🛡️ SGD Duncan 2.0 — PWA (Costo Cero)

Sistema de Gestión Digital de Seguridad, Salud y Ambiente (SG-SSA) para el grupo empresarial **Duncan**.

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + PWA (Service Worker Offline)
- **Backend:** Google Apps Script Web App (API REST Gratuita)
- **Base de Datos:** Google Sheets (Costo $0 / mes)
- **Despliegue:** Vercel o GitHub Pages (Costo $0)

---

## 🚀 Guía Rápida de Puesta en Marcha

### 1. Probar en Local
```bash
# Entrar a la carpeta
cd sgd-duncan-pwa

# Iniciar servidor de desarrollo
npm run dev
```
La aplicación abrirá en `http://localhost:5173`. Funciona de inmediato en **modo local/offline** guardando todo en el navegador.

---

### 2. Configurar Backend Gratuito en Google Sheets (5 minutos)

1. Abre tu [Google Drive](https://drive.google.com) y crea una nueva **Hoja de Cálculo de Google** (nómbrala ej: `SGD Duncan 2.0 DB`).
2. En el menú superior de la hoja de cálculo, ve a: **Extensiones > Apps Script**.
3. Borra el código existente y copia el contenido completo del archivo:
   `google-apps-script/Code.gs`
4. En el editor de Apps Script, en el selector desplegable de funciones de arriba, selecciona **`setupSpreadsheet`** y haz clic en **Ejecutar** (Run).
   - Te pedirá autorizar permisos de Google una sola vez.
   - Esto creará automáticamente todas las pestañas (`Inspecciones`, `PlanAccion`, `Audit_Log`, `Empleados`, `Usuarios`) con sus encabezados en azul institucional.
5. Haz clic en el botón superior derecho: **Implementar** (Deploy) > **Nueva implementación**.
   - Haz clic en el engranaje ⚙️ y selecciona tipo: **Aplicación web** (Web App).
   - **Descripción:** `API SGD Duncan 2.0`
   - **Ejecutar como:** `Yo (tu correo)`
   - **Quién tiene acceso:** `Cualquier persona` (Anyone)
   - Haz clic en **Implementar**.
6. Copia la **URL de la aplicación web** generada (termina en `/exec`).
7. En la aplicación PWA, ve a **Ajustes** (ícono de tuerca en el menú lateral) y pega la URL en el campo correspondiente. Haz clic en **Probar conexión** y luego en **Guardar**.

¡Listo! Todos los datos se sincronizan automáticamente en tiempo real entre la PWA y tu Google Sheet.

---

### 3. Despliegue Gratuito en Vercel (1 minuto)

La aplicación ya viene con `vercel.json` configurado:

#### Método A: Desde GitHub (Recomendado)
1. Sube esta carpeta a un repositorio en tu [GitHub](https://github.com):
   ```bash
   git init
   git add .
   git commit -m "feat: SGD Duncan 2.0 PWA release"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/sgd-duncan-pwa.git
   git push -u origin main
   ```
2. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub.
3. Haz clic en **"Add New Project"** e importa tu repositorio.
4. En **Framework Preset** detectará automáticamente `Vite`.
5. *(Opcional)* En Environment Variables agrega `VITE_GOOGLE_SHEETS_URL` con tu URL de Apps Script.
6. Haz clic en **Deploy**. Tendrás tu enlace HTTPS público en segundos (ej: `https://sgd-duncan.vercel.app`).

#### Método B: Vercel CLI
```bash
npx vercel
```

---

## 📱 Instalación en Dispositivos Móviles (PWA)

- **Android (Chrome):**
  Abre la URL desplegada en Chrome, toca el menú de tres puntos (⋮) y selecciona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
- **iOS / iPhone (Safari):**
  Abre la URL en Safari, toca el botón **Compartir** (cuadrado con flecha hacia arriba) y selecciona **"Agregar al inicio"**.

La app funcionará como una aplicación nativa, a pantalla completa, incluso cuando no haya señal o internet en los talleres/plantas.

---

## 📦 Módulos Incluidos

1. **Dashboard:** Métricas ejecutivas, % cumplimiento, inspecciones recientes y acciones vencidas.
2. **Inspecciones (16 tipos preconfigurados):**
   - 🔥 Extintores (EXT)
   - 🚨 Detección de Incendios (DI)
   - 🚿 Fuente Lavaojos Portátil (FLP)
   - 🚿 Fuente y Ducha de Emergencia (FYD)
   - 🏭 Orden y Limpieza (OL)
   - ⚠️ Kit para Derrames (KD)
   - 🏗️ Montacargas (MTCG y MTCG_SSA)
   - 💡 Lámparas de Emergencia (LEM)
   - 🚛 Inspección Diaria de Vehículos (VHT)
   - 🧰 Herramientas y Equipos (HEQ)
   - 📋 SSA Distribuidoras (DD)
   - 🏪 SSA Servicentros (SC)
   - 🚗 Evaluación Transporte de Carga (VTC)
   - 📄 Permisos de Bomberos (PB)
   - 👷 Dotación Periódica EPP (DP)
3. **Formularios Dinámicos con Calificación Automática:** Conforme (C), No Conforme (NC), Observación Menor (OM) y No Aplica (NA).
4. **Auto-generación de Plan de Acción:** Al completar una inspección con No Conformidades (NC) u Observaciones Menores (OM), se crean automáticamente los planes correctivos.
5. **Reportes Profesionales:**
   - Exportación a PDF con membrete institucional.
   - Exportación a CSV / Excel.
   - Compartir instantáneo vía WhatsApp.
   - Vista de impresión limpia (`window.print`).
6. **Soporte Offline & Cola de Sincronización:** Si se pierde la conexión en campo, las inspecciones se guardan localmente y se sincronizan al recuperar señal.
