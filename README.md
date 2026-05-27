# Registros Básicos · Sistema Clínico v1.0

Aplicación clínica web (PWA, offline-first, Mobile-First) para Bolivia.
Cliente puro (HTML + CSS + Vanilla JS), sin servidor ni base SQL.
Funciona offline tras la primera carga gracias al Service Worker.

---

## ✅ Versión completa: 9 módulos + PWA

- ✅ Shell con 9 tabs navegables + buscador omnipotente en header
- ✅ Autenticación PBKDF2 (gate solo para acciones críticas)
- ✅ Audit log de acciones administrativas (últimas 500)
- ✅ **M1** Dashboard con noticias, patología del día, eventos, tareas, enlaces frecuentes
- ✅ **M2** Valoración Nutricional con tablas LMS oficiales OMS (1,386 puntos) + GER (Schofield/Mifflin) + curvas SVG interactivas
- ✅ **M3** Gestante: Naegele, Parikh, Wahl, datación ecográfica, ganancia IOM 2009, altura uterina CLAP/OPS
- ✅ **M4** Vademécum LINAME (777 fármacos) + calculadora de dosis adaptativa
- ✅ **M5** Agenda con CRUD admin: eventos, tareas, check-in/out auditado
- ✅ **M6** Clínica (551 patologías + 1,949 prestaciones Ley 475) + cruce automático a fármacos
- ✅ **M7** PAI (19 vacunas) + Vigilancia Epidemiológica (13 protocolos)
- ✅ **M8** SUPPV/BJA con **fórmulas idénticas al original** + Bono Niños 12 bimestrales
- ✅ **M9** Enlaces con filtrado en tiempo real
- ✅ Service Worker offline-first + Manifest PWA instalable

---

## 🚀 Cómo correr

```bash
unzip registros-basicos-v1.zip -d registros-basicos
cd registros-basicos
python3 -m http.server 8000
# Abre http://localhost:8000
```

Requiere servidor HTTP local: `<script src>` y Service Worker no funcionan con `file://`.

---

## 🔐 Modelo de autenticación

App **abierta para lectura**, **gate para acciones críticas**:

| Acción | Login |
|--------|-------|
| Buscar, leer patologías, fármacos, vacunas, vigilancia | No |
| Calcular Z-score, dosis, EG, SUPPV/BJA | No |
| Importar/exportar JSON | **Sí** |
| Editar/eliminar eventos, tareas, enlaces | **Sí** |
| Check-in/out auditado | **Sí** |

- PBKDF2-SHA256, 120,000 iteraciones (Web Crypto API), sal de 16 bytes
- Sesión expira a 30 min de inactividad (cualquier click la renueva)
- Audit log de cada acción admin
- Usuarios por defecto: `hacmed` y `CARLOS_MIRANDA`, contraseña `P4r4s1t0l0g1$`

**Aviso:** este login es protección contra vista casual. No es bancario — el
código corre en el navegador.

---

## 📊 Datos clínicos

### Patologías (551 unificadas)
Fusión de `T_PATOLOGIAS.xlsx` (249 con descripción) y `T_PATOLOGIAS_BASE.xlsx`
(339 con prestaciones Ley 475). Matching por:
1. Slug exacto: 28 entradas
2. Prefijo + sinónimo entre paréntesis: 19 entradas
3. Entradas únicas: 504

**Cero pérdida** verificada: las 1,949 prestaciones del Excel están en el JSON.

### Tablas LMS OMS (1,386 puntos)

| Indicador | Rango |
|-----------|-------|
| Length/Height-for-age | 0–228 meses |
| Weight-for-age | 0–60 meses |
| BMI-for-age | 0–228 meses |
| Weight-for-length | 45–110 cm |
| Weight-for-height | 65–120 cm |
| Head-circumference-for-age | 0–60 meses |

Ecuación Z: `Z = (((valor/M)^L) - 1) / (L*S)` (L≠0), `Z = ln(valor/M)/S` (L=0).
Interpolación lineal entre puntos.

### Vademécum (777), PAI (19), Vigilancia (13)
LINAME completo con mecanismo, RAMs, interacciones. Esquemas PAI con 22 campos
cada uno. Vigilancia con criterios de confirmación.

---

## ✅ Validación clínica

- **Naegele** FUM 2026-01-01 → FPP 2026-10-08 ✓ (exacto)
- **Parikh c/32d**: +4 días vs Naegele ✓ (exacto)
- **IOM 2009 ganancia gemelos IMC 22**: 16.8–24.5 kg ✓
- **Schofield niño 12 kg/2 años**: 684 kcal/día ✓ (FAO/WHO/UNU)
- **Mifflin adulta 70/165/30**: 1,420 kcal/día (esperado ~1,427) ✓
- **Z-scores OMS**: coherentes ±0.05 SD
- **SUPPV/BJA**: fórmulas, offsets, direcciones SEDEM y plantilla idénticas al original

---

## 🗂️ Estructura

```
.
├── index.html, manifest.json, sw.js, README.md
├── css/
│   ├── tokens.css           Paleta + tipografías
│   └── components.css       Componentes UI
├── js/
│   ├── state.js, auth.js, search.js, obstetric.js, app.js
│   └── modules/
│       ├── m1-m5-m9.js      Dashboard + Agenda + Enlaces
│       ├── m2-nutricion.js  Z-scores + GER + curvas SVG
│       ├── m3-gestante.js   EG + ganancia + AU
│       ├── m4-vademecum.js  Vademécum + dosis
│       ├── m6-clinica.js    Patologías + cruce
│       ├── m7-pai-vigil.js  PAI + Vigilancia
│       └── m8-suppv-bja.js  SUPPV + BJA + Niños
└── data/
    ├── db_patologias.js     2.0 MB (551 + 1949 prestaciones)
    ├── db_vademecum.js      525 KB (777 fármacos)
    ├── db_lms.js             71 KB (1386 puntos OMS)
    ├── db_pai.js             21 KB
    ├── db_vigilancia.js       7 KB
    ├── db_agenda.js         editable admin
    └── db_enlaces.js        editable admin
```

**Carga inicial:** ~600 KB. **Patologías y LMS:** carga perezosa al entrar a M6/M2.

---

## 🔧 Editar contenido

1. Acceder a la app, autenticarse como admin.
2. En el módulo correspondiente: "⬇️ Exportar JSON".
3. Editar el archivo descargado.
4. "⬆️ Importar JSON". La app valida y hace backup automático.

---

*v1.0 · Bolivia · Ley 475 + SAFCI + LINAME + PAI*
