(function() {
    console.log('[Proxy] Инициализация глобального прокси-перехватчика');
    
    // Сохраняем оригинальные методы
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalFetch = window.fetch;
    const originalCreateElement = document.createElement;
    const originalImageSrcSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;

    // Список критических URL, которые нужно обрабатывать особым образом
    const criticalUrls = [
        'https://static.sketchfab.com/static/builds/web/dist/e0da9f93346f2476497a8e1bc087540c-v2.css',
        'https://media.sketchfab.com/models/e1be1ce75d3b4770959d79881b640a6b/thumbnails/621ab501cdd2489199d35e111b71c60a/d4e8a570d2334c2cb6beddc6921fafbb.jpeg'
    ];
    
    // Функция для проверки и модификации URL
    function transformUrl(url) {
        if (typeof url !== 'string') return url;
        
        // Если URL в списке критических, используем прямой прокси
        if (criticalUrls.includes(url)) {
            console.log('[Proxy] Критический URL: ' + url + ' -> /direct-proxy/' + url);
            return '/direct-proxy/' + url;
        }
        
        // Проверка на абсолютный URL
        if (url.startsWith('http://') || url.startsWith('https://')) {
            // Особая обработка для media.sketchfab.com
            if (url.includes('media.sketchfab.com')) {
                console.log('[Proxy] Media URL: ' + url + ' -> /direct-proxy/' + url);
                return '/direct-proxy/' + url;
            }
            
            // Особая обработка для статических ресурсов
            if (url.includes('static.sketchfab.com')) {
                console.log('[Proxy] Static URL: ' + url + ' -> /direct-proxy/' + url);
                return '/direct-proxy/' + url;
            }
            
            // Общая обработка
            const newUrl = '/proxy/' + url;
            console.log('[Proxy] URL: ' + url + ' -> ' + newUrl);
            return newUrl;
        }
        return url;
    }
    
    // Переопределяем XMLHttpRequest
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        return originalXHROpen.call(this, method, transformUrl(url), async, user, password);
    };
    
    // Переопределяем fetch
    window.fetch = function(url, options) {
        return originalFetch(transformUrl(url), options);
    };
    
    // Остальной код без изменений...
    
    // Добавляем отладочную функцию для тестирования
    window.testProxy = function(url) {
        console.log('Тестирование прокси для: ' + url);
        fetch(url)
            .then(response => {
                console.log('Успешно! Статус: ' + response.status);
                return response.text();
            })
            .then(text => {
                console.log('Получено байт: ' + text.length);
            })
            .catch(error => {
                console.error('Ошибка: ' + error);
            });
    };
    
    console.log('[Proxy] Глобальный прокси-перехватчик успешно инициализирован');
})();