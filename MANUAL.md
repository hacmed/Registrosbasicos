# Registros Básicos — Manual de uso

Aplicación clínica web para Bolivia. Funciona **sin internet** (offline-first), **sin servidor** y **sin base de datos**. Todo corre en el navegador.

---

## Instalación y actualización

### Primera vez
1. Descomprime el ZIP en una carpeta.
2. Necesitas servirla por HTTP (no abrir el `index.html` directo con doble clic, porque el navegador bloquea algunas funciones con `file://`). Opciones:
   - **Python:** dentro de la carpeta, ejecuta `python3 -m http.server 8000` y abre `http://localhost:8000`.
   - **Node:** `npx serve` dentro de la carpeta.
   - **Hosting gratis:** sube la carpeta a Netlify, GitHub Pages o Vercel.
3. La primera carga descarga todo; luego funciona sin conexión.

### Cuando entrego una versión nueva
La app detecta versiones nuevas automáticamente y muestra un banner verde **"Actualizar ahora"**. Si algo se ve raro o no aparece contenido nuevo:
- Baja al pie de página y pulsa **"🔄 Forzar actualización (limpiar caché)"**.
- O abre en **ventana de incógnito** (no tiene caché viejo).

> El 99% de los "no se ve nada" son caché del navegador sirviendo la versión anterior. El botón de forzar actualización lo resuelve.

---

## Acceso y usuarios

La app tiene **dos tipos de acceso**:

### Usuarios normales (login visible)
En la esquina superior, junto al buscador, hay un recuadro de inicio de sesión. Por ahí entran los usuarios que el administrador crea (enfermería, recepción, etc.), cada uno con su rol y sus pestañas permitidas. Al iniciar sesión se muestra su nombre y un botón "Salir".

### Modo administrador / DIOS (oculto)
El administrador NO usa el login visible (queda rechazado ahí). Entra por una vía oculta:
- **5 toques** en el logo "R" de la esquina.
- Mantener presionado el logo ~1 segundo (móvil).
- **3 toques** en el texto "Registros Básicos · vX" del pie de página (vía de respaldo en móvil).
- Atajo `Ctrl+Shift+A` (escritorio).

Credenciales por defecto: usuario `hacmed` o `CARLOS_MIRANDA`, contraseña `P4r4s1t0l0g1$`.

**La sesión se cierra al recargar la página** (vive solo en memoria), por seguridad en equipos compartidos.

### Panel de Administración (pestaña ⚙)
Solo visible para el administrador. Permite:
- **Usuarios:** crear, editar, eliminar (con nombre, rol y contraseña). Protege el último admin.
- **Roles:** crear roles y marcar qué pestañas ve cada uno, incluido el **invitado** (quien entra sin contraseña).
- **Respaldo de usuarios:** exportar/importar la base de usuarios (las contraseñas van como hash, nunca en texto plano).
- **Respaldo completo:** toda la configuración y bases de datos en un archivo, para migrar de equipo.
- **Orden de pestañas, configuración de Inicio y registro de actividad (audit log).**

> **Nota de seguridad:** al ser una app sin servidor, este control es **organizativo**, no una barrera criptográfica. Para seguridad real (datos protegidos, login a prueba de manipulación) se requiere un servidor con base de datos.

---

## Los 10 módulos

### 01 · Inicio
Pantalla de inicio (antes "Dashboard") configurable. Widgets activables por el admin: noticias, patología del día, eventos, tareas, enlaces.

**Noticias de salud (automáticas):** intenta cargar feeds RSS de OPS/OMS a través de un proxy. Si no hay internet o el proxy falla, muestra las **noticias manuales** que el admin escribió. Botones:
- 🔄 actualizar noticias
- ⚙️ configurar fuentes RSS (admin) — puedes añadir/quitar feeds
- "+ Manual" (admin) — escribir una noticia de respaldo

### 02 · Nutrición
Cálculo de Z-scores con tablas **LMS oficiales de la OMS**. Seis curvas: peso/edad, talla/edad, IMC/edad, peso/talla, peso/longitud, perímetro cefálico. Calculadora de gasto energético (GER) con 15 niveles de actividad física.

### 03 · Gestante
Cálculo de edad gestacional y fecha probable de parto por **Naegele, Parikh y Wahl**. Comparativa de FPP. Ganancia de peso recomendada **IOM 2009**. Curva de altura uterina **CLAP/OPS**.

### 04 · Vademécum
Vademécum LINAME. Buscador, calculadora de dosis y **dosis pediátricas** (WHO, Nelson, AAP, BNF). Admin: editar fármacos con formulario completo, importar/exportar Excel y JSON, plantilla descargable.

### 05 · Agenda
**Calendario mensual** con hasta 5 actividades por día, con hora (sugiere la hora actual) y colores. Navegación entre meses.
- **🖨️ Imprimir calendario:** abre una ventana con solo el calendario (mes y año), formato carta, listo para imprimir.
- Las actividades se guardan en el JSON de agenda.
- Check-in/out, eventos, tareas y audit log (admin).

### 06 · Clínica
551 patologías de la Ley 475 con 1949 prestaciones. Buscador en cascada (CIE-10 → prefijo → Fuse.js). Admin: editar con formulario completo (incluye prestaciones anidadas), Excel y JSON.

### 07 · PAI / Vigilancia
Esquema de vacunación PAI y protocolos de vigilancia epidemiológica. Admin: crear/editar/eliminar vacunas (21 campos) y protocolos con formulario real.

### 08 · SUPPV / BJA
Subsidio Universal Prenatal por la Vida y Bono Juana Azurduy.
- Ingresa **FUM** y **fecha de control**: la app calcula automáticamente qué paquete corresponde.
- Genera mensaje de WhatsApp listo para enviar, que incluye **solo los paquetes pendientes** (no repite los ya habilitados) y los datos de la oficina SEDEM (teléfono, horario, ubicación en Maps).
- Admin gestiona oficinas SEDEM: nombre, área, **link de Google Maps**, teléfono y **horario predictivo** (eliges días + hora entrada/salida, hasta 3 bloques, y la app arma la frase).

### 09 · Enlaces y recursos
Enlaces útiles organizados por categoría. La categoría **ADMIN** solo es visible con sesión de administrador.

### 10 · Seguimiento Gestante
Ficha completa de seguimiento prenatal. **Por privacidad, los datos del paciente NO se guardan en el dispositivo** — viven solo en memoria y se exportan como archivo JSON individual.

Pestañas:
- **Cabecera:** identificación (CUS/CI/HC), datos del embarazo, antecedentes, factores de riesgo basales.
- **1°, 2°, 3° Trimestre:** antropometría, examen obstétrico, laboratorio, ecografía (con desplegables), notas, plan, y **diagnósticos con fecha** (lista de 21 frecuentes + "Otro").
- **Postparto:** datos del parto y recién nacido.
- **Evolución:** tabla resumen de las 3 visitas con tendencias (↑↓→) y alertas de color, línea de tiempo de diagnósticos, 4 gráficos (peso IOM, TA, altura uterina CLAP, Hb), y **imprimir resumen completo**.

Guardar/cargar: botones 💾 (descarga JSON con nombre `seguimiento_TIPO_NUMERO_APELLIDO.json`) y 📂 (carga un JSON).

---

## Privacidad y datos

- **Datos de configuración** (agenda, enlaces, ediciones admin de las BD): se guardan en el `localStorage` del navegador.
- **Datos de pacientes en Seguimiento Gestante:** NO se guardan. Solo en memoria + export manual a JSON. Esto es intencional para proteger la información sensible.
- **Nada sale del dispositivo** salvo: las noticias RSS (que se descargan), y los mensajes de WhatsApp que tú decides enviar.

---

## Preguntas frecuentes

**No veo un módulo / no aparece contenido nuevo.**
Caché del navegador. Pulsa "🔄 Forzar actualización" en el pie, o usa incógnito.

**Las noticias no cargan.**
El proxy RSS puede estar caído o no hay internet. La app mostrará tus noticias manuales. Como admin puedes cambiar las fuentes en ⚙️.

**Perdí los datos de una gestante en seguimiento.**
Por diseño no se guardan en el dispositivo. Siempre exporta el JSON al terminar (botón 💾).

**¿Puedo usar la app sin internet?**
Sí, todo funciona offline salvo las noticias RSS automáticas.

---

*Desarrollado para HACMED · Bolivia*
