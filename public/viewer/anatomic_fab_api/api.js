var iframe = document.getElementById('api-frame');
var uid = 'e1be1ce75d3b4770959d79881b640a6b';

// By default, the latest version of the viewer API will be used.
var client = new Sketchfab(iframe);

var annotationTranslations = [
    { title: "Каталог магазина Франческа Дардера", content: "описание первой анотации" },
    { title: "2 анотация", content: "2 описание анотации" },
    { title: "3 анотация", content: "3 описание анотации" },
    { title: "4 анотация", content: "4 описание анотации" },
    { title: "5 анотация", content: "Описание для 5 аннотации" },
    { title: "6 анотация", content: "Описание для 6 аннотации" },
    { title: "7 анотация", content: "Описание для 7 аннотации" },
    { title: "8 анотация", content: "Описание для 8 аннотации" }
];

// Максимально простая функция перевода - просто по индексу
function translateAnnotationsSimple(api) {
    api.getAnnotationList(function(err, annotations) {
        if (err) {
            console.error('Ошибка получения аннотаций:', err);
            return;
        }
        
        console.log('Найдено аннотаций:', annotations.length);
        
        // Проходим по всем аннотациям
        annotations.forEach(function(annotation, index) {
            // Проверяем, есть ли перевод для этого индекса
            if (annotationTranslations[index]) {
                console.log('Переводим аннотацию ' + index);
                
                // Используем name вместо title
                api.updateAnnotation(index, {
                    title: annotationTranslations[index].title,
                    content: {
                        raw: annotationTranslations[index].content
                    }
                }, function(err) {
                    if (err) {
                        console.error('Ошибка обновления аннотации ' + index + ':', err);
                    } else {
                        console.log('Аннотация ' + index + ' успешно обновлена');
                    }
                });
            } else {
                console.log('Нет перевода для аннотации ' + index);
            }
        });
    });
}

client.init(uid, {
    success: function onSuccess(api) {
        api.start();

        api.addEventListener('viewerready', function() {
            console.log('Viewer is ready');
            translateAnnotationsSimple(api);
        });
    },
    error: function onError() {
        console.log('Viewer error');
    },
    ui_controls: 0,
    ui_infos: 0,
    ui_watermark: 0
});
