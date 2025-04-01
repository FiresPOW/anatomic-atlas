(function() {
    console.log('[Proxy] Инициализация глобального прокси-перехватчика');
    
    // Сохраняем оригинальные методы
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalFetch = window.fetch;
    const originalCreateElement = document.createElement;
    const originalImageSrcSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;
    
    // Функция для проверки и модификации URL
    function transformUrl(url) {
        if (typeof url !== 'string') return url;
        
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
    
    // Перехватываем создание тегов <script>
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);
        if (tagName.toLowerCase() === 'script') {
            const originalSetter = Object.getOwnPropertyDescriptor(element, 'src').set;
            Object.defineProperty(element, 'src', {
                set: function(url) {
                    originalSetter.call(this, transformUrl(url));
                },
                get: Object.getOwnPropertyDescriptor(element, 'src').get
            });
        }
        return element;
    };
    
    // Перехватываем установку атрибута src для изображений
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
        set: function(url) {
            originalImageSrcSetter.call(this, transformUrl(url));
        },
        get: Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').get
    });
    
    console.log('[Proxy] Глобальный прокси-перехватчик успешно инициализирован');
})();