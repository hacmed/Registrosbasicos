/* ============================================================================
   Service Worker — Registros Básicos
   Estrategia offline-first con cache versionada.
   Adaptado del patrón SUPPV-BJA.
   ============================================================================ */

const CACHE_VERSION = 'registros-basicos-v2.6.2';
const CACHE_STATIC  = `${CACHE_VERSION}-static`;
const CACHE_RUNTIME = `${CACHE_VERSION}-runtime`;

// Recursos críticos: shell de la app + datos (sin lms ni patologias que son pesados)
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/tokens.css',
  './css/components.css',
  './js/state.js',
  './js/modal-editor.js',
  './js/excel-io.js',
  './js/vendor-xlsx.min.js',
  './js/news-feed.js',
  './js/announcement.js',
  './js/roles.js',
  './js/backup.js',
  './js/auth.js',
  './js/search.js',
  './js/obstetric.js',
  './js/app.js',
  './js/modules/m1-m5-m9.js',
  './js/modules/m2-nutricion.js',
  './js/modules/m3-gestante.js',
  './js/modules/m4-vademecum.js',
  './js/modules/m6-clinica.js',
  './js/modules/m7-pai-vigil.js',
  './js/modules/m8-suppv-bja.js',
  './js/modules/m10-seguimiento.js',
  './data/db_pai.js',
  './data/db_vigilancia.js',
  './data/db_agenda.js',
  './data/db_enlaces.js',
  './data/db_dosis_pediatricas.js',
  './data/db_sedem.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];

// Recursos pesados: se cachean en runtime al primer uso (no en install)
// - data/db_patologias.js (2 MB)
// - data/db_vademecum.js (525 KB)
// - data/db_lms.js (71 KB)
// - Fuentes Google (cualquier origin externo)
// - Fuse.js de CDN

// =========================================================================
// INSTALL — Precachear shell
// =========================================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('[SW] Precacheando shell + datos esenciales');
        // addAll falla si UN solo recurso falla. Hacemos add() individual y toleramos errores.
        return Promise.all(
          PRECACHE_URLS.map(url =>
            cache.add(url).catch(err => console.warn('[SW] No se pudo precachear', url, err.message))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// =========================================================================
// ACTIVATE — Limpiar caches obsoletos
// =========================================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names
          .filter(n => !n.startsWith(CACHE_VERSION))
          .map(n => {
            console.log('[SW] Eliminando cache obsoleto:', n);
            return caches.delete(n);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// =========================================================================
// FETCH — Estrategia híbrida
// • Navegación HTML        → network-first (siempre quiere lo último)
// • CDN externo            → stale-while-revalidate (rápido + actualiza en bg)
// • Recursos propios       → cache-first (no cambian sin re-deploy)
// =========================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }
  if (url.origin !== self.location.origin) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  event.respondWith(cacheFirst(request));
});

// === Estrategias ==========================================================
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.warn('[SW] cacheFirst falló:', request.url);
    throw err;
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_RUNTIME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const fallback = await caches.match('./index.html');
    if (fallback) return fallback;
    throw err;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_RUNTIME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.status === 200) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

// =========================================================================
// MESSAGES — Cliente puede forzar actualización
// =========================================================================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
