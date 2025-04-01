// Service Worker для проксирования всех запросов к Sketchfab
const SKETCHFAB_DOMAINS = ['sketchfab.com', 'api.sketchfab.com', 'static.sketchfab.com'];
const PROXY_PREFIX = '/skfb-proxy';

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('[Sketchfab Proxy SW] Установка Service Worker');
  self.skipWaiting(); // Активация без ожидания
});

// Активация Service Worker
self.addEventListener('activate', event => {
  console.log('[Sketchfab Proxy SW] Service Worker активирован');
  return self.clients.claim(); // Захватывает управление сразу
});

// Перехват всех запросов
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Проверяем, нужно ли проксировать этот запрос
  if (SKETCHFAB_DOMAINS.some(domain => url.hostname.includes(domain))) {
    console.log('[Sketchfab Proxy SW] Перехват запроса:', url.href);
    
    // Создаем URL для прокси
    const proxyUrl = createProxyUrl(url);
    console.log('[Sketchfab Proxy SW] Перенаправляем через:', proxyUrl);
    
    // Перенаправляем запрос через прокси
    event.respondWith(
      fetch(proxyUrl, {
        method: event.request.method,
        headers: event.request.headers,
        body: event.request.method !== 'GET' && event.request.method !== 'HEAD' ? event.request.body : undefined,
        mode: 'cors',
        credentials: 'include',
        redirect: 'follow'
      }).catch(error => {
        console.error('[Sketchfab Proxy SW] Ошибка проксирования:', error);
        // Пробуем оригинальный запрос как запасной вариант
        return fetch(event.request);
      })
    );
  }
});

// Функция для создания URL прокси
function createProxyUrl(originalUrl) {
  const originalPath = originalUrl.pathname + originalUrl.search + originalUrl.hash;
  let proxyPath = '';
  
  // Определяем правильный путь для прокси
  if (originalUrl.hostname.includes('api.sketchfab.com')) {
    proxyPath = `${PROXY_PREFIX}/api${originalPath}`;
  } else if (originalUrl.hostname.includes('static.sketchfab.com')) {
    proxyPath = `${PROXY_PREFIX}/static${originalPath}`;
  } else {
    proxyPath = `${PROXY_PREFIX}/main${originalPath}`;
  }
  
  return proxyPath;
}