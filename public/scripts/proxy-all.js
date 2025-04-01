(function() {
    console.log('[Proxy] Инициализация глобального прокси-перехватчика');
    
    // Переопределяем XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        // Проверяем, является ли URL абсолютным (внешним)
        if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
            const newUrl = '/proxy/' + url;
            console.log('[Proxy] XHR: ' + url + ' -> ' + newUrl);
            return originalXHROpen.call(this, method, newUrl, async, user, password);
        }
        return originalXHROpen.call(this, method, url, async, user, password);
    };
    
    // Переопределяем fetch
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
            const newUrl = '/proxy/' + url;
            console.log('[Proxy] Fetch: ' + url + ' -> ' + newUrl);
            return originalFetch(newUrl, options);
        }
        return originalFetch(url, options);
    };
    
    // Перехватываем тег script
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);
        if (tagName.toLowerCase() === 'script') {
            const originalSetter = Object.getOwnPropertyDescriptor(element, 'src').set;
            Object.defineProperty(element, 'src', {
                set: function(url) {
                    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
                        const newUrl = '/proxy/' + url;
                        console.log('[Proxy] Script: ' + url + ' -> ' + newUrl);
                        originalSetter.call(this, newUrl);
                    } else {
                        originalSetter.call(this, url);
                    }
                },
                get: Object.getOwnPropertyDescriptor(element, 'src').get
            });
        }
        return element;
    };
    
    // Перехватываем загрузку изображений
    const originalImage = window.Image;
    window.Image = function() {
        const image = new originalImage();
        const originalSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;
        Object.defineProperty(image, 'src', {
            set: function(url) {
                if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
                    const newUrl = '/proxy/' + url;
                    console.log('[Proxy] Image: ' + url + ' -> ' + newUrl);
                    originalSetter.call(this, newUrl);
                } else {
                    originalSetter.call(this, url);
                }
            },
            get: Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').get
        });
        return image;
    };
    
    console.log('[Proxy] Глобальный прокси-перехватчик успешно инициализирован');
})();