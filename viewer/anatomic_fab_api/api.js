var iframe = document.getElementById('api-frame');
var uid = 'e1be1ce75d3b4770959d79881b640a6b';

// By default, the latest version of the viewer API will be used.
var client = new Sketchfab(iframe);

// Словарь переводов аннотаций
var translations = {
    // Заголовки аннотаций
    "El catàleg de la botiga de Francesc Darder": "Test 1 ",
    "Spine": "Позвоночник",
    "Ribcage": "Грудная клетка",
    "Pelvis": "Таз",
    "Upper Limbs": "Верхние конечности",
    "Lower Limbs": "Нижние конечности",
    "Jaw": "Челюсть",
    "Teeth": "Зубы",
    
    // Содержимое аннотаций (первые несколько строк текста для сопоставления)
    "Aquest model tenia una presència destacada al catàleg de Darder. El venia a 600 pts, preu que considerava econòmic i en destacava menor fragilitat que d’altres models, com els de cera o paper maixé.": 
        "Череп — костная структура, формирующая голову у позвоночных.",
   
    
    // Добавьте остальные переводы по мере необходимости
};

client.init(uid, {
    success: function onSuccess(api) {
        api.start();

        api.addEventListener('viewerready', function() {
            console.log('Viewer is ready');
            
            // Проверка доступности методов API
            console.log('API методы:', Object.keys(api).filter(function(key) {
                return typeof api[key] === 'function';
            }));
            
            // Проверка конкретного метода
            if (typeof api.updateAnnotation !== 'function') {
                console.error('Метод updateAnnotation не доступен в этой версии API');
                

            } else {
                // Получаем список аннотаций
                api.getAnnotationList(function(err, annotations) {
                    if (err) {
                        console.log('Error getting annotations', err);
                        return;
                    }
                    
                    // Выводим оригинальные аннотации для изучения
                    console.log('Original annotations:', annotations);
                    
                    // Переводим и обновляем аннотации
                    translateAnnotations(api, annotations);
                });
            }
        });
    },
    error: function onError() {
        console.log('Viewer error');
    },
    ui_controls:0,
    ui_infos:0,
    ui_watermark:0,
});

// Упрощенная функция перевода аннотаций
function translateAnnotations(api, annotations) {
    // Получаем все аннотации
    api.getAnnotationList(function(err, annotations) {
        if (err) {
            console.error('Ошибка получения аннотаций:', err);
            return;
        }
        
        // Обрабатываем каждую аннотацию
        annotations.forEach(function(annotation, index) {
            var originalTitle = annotation.name || '';
            var originalContent = (annotation.content && annotation.content.raw) || '';
            
            // Находим перевод в словаре - сначала ищем точное совпадение
            var translatedTitle = translations[originalTitle];
            var translatedContent = translations[originalContent];
            
            // Если точное совпадение для заголовка не найдено, ищем по первым 20 символам
            if (!translatedTitle && originalTitle.length > 0) {
                var firstChars = originalTitle.substring(0, Math.min(20, originalTitle.length));
                
                // Ищем ключи в словаре, которые начинаются с тех же символов
                for (var key in translations) {
                    if (key.startsWith(firstChars)) {
                        translatedTitle = translations[key];
                        console.log('Найдено частичное совпадение для заголовка:', {
                            'Оригинал': originalTitle,
                            'Ключ в словаре': key,
                            'Перевод': translatedTitle
                        });
                        break;
                    }
                }
            }
            
            // Если точное совпадение для содержимого не найдено, ищем по первым 20 символам
            if (!translatedContent && originalContent.length > 0) {
                var firstChars = originalContent.substring(0, Math.min(20, originalContent.length));
                
                // Ищем ключи в словаре, которые начинаются с тех же символов
                for (var key in translations) {
                    if (key.startsWith(firstChars)) {
                        translatedContent = translations[key];
                        console.log('Найдено частичное совпадение для содержимого:', {
                            'Оригинал (начало)': firstChars + '...',
                            'Ключ в словаре (начало)': key.substring(0, Math.min(30, key.length)) + '...',
                            'Перевод (начало)': translatedContent.substring(0, Math.min(30, translatedContent.length)) + '...'
                        });
                        break;
                    }
                }
            }
            
            // Если не найдено совпадений, используем оригинал
            if (!translatedTitle) translatedTitle = originalTitle;
            if (!translatedContent) translatedContent = originalContent;
            
            // Если есть что переводить
            if (translatedTitle !== originalTitle || translatedContent !== originalContent) {
                console.log('Переводим аннотацию ' + index + ':', {
                    'Оригинальный заголовок': originalTitle,
                    'Переведенный заголовок': translatedTitle
                });
                
                // Обновляем аннотацию, используя правильные имена полей
                api.updateAnnotation(index, {
                    title: translatedTitle,  // Исправлено: name вместо title
                    content: translatedContent 
                }, function(err) {
                    if (err) {
                        console.error('Ошибка обновления аннотации ' + index + ':', err);
                    } else {
                        console.log('Аннотация ' + index + ' обновлена');
                    }
                });
            } else {
                console.log('Аннотация ' + index + ' не требует перевода или перевод не найден:', {
                    'Заголовок': originalTitle
                });
            }
        });
    });
}