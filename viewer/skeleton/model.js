import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Создание сцены
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xCCCCCC); // 0xdddddd

// Настройка камеры
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(1, 1, 12); // Позиционируем камеру

// Создание рендерера
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Добавление освещения
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 2, 3);
scene.add(directionalLight);

// Добавление элементов управления камерой
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping =  true;
controls.dampingFactor = 0.05;


// Загрузка 3D модели
const loader = new GLTFLoader();
loader.load('/models/female_human_skeleton/scene.gltf', function (gltf) {
    // Размещаем модель в центре
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.x = -center.x;
    gltf.scene.position.y = -center.y;
    gltf.scene.position.z = -center.z;

    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Функция анимации
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Обновляем контроллер камеры
    renderer.render(scene, camera);
}

// Запускаем цикл анимации
animate();


// Добавление текста через спрайт (всегда смотрит на камеру)
function createTextSprite(xcord, ycord, height, text) {
    // Увеличиваем размер холста для большего текста
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024; // Увеличиваем ширину
    canvas.height = height; // Увеличиваем высоту для многострочного текста

    // Заливка фона (опционально)
    context.fillStyle = "rgba(204,204,204,0.7)"; // Полупрозрачный белый фон
    context.fillRect(0, 0, canvas.width, canvas.height);
    //204, 204, 204
    // Настраиваем стиль текста
    context.font = "Bold 32px Arial"; // Уменьшаем размер для большего количества текста
    context.fillStyle = "rgba(0,0,0,1.0)"; // Черный цвет

    // Разбиваем текст на строки и выводим каждую строку отдельно
    const lines = text.split('\n');
    let y = 40; // Начальная позиция по Y
    const lineHeight = 36; // Высота строки

    // Выводим каждую строку текста
    for (let i = 0; i < lines.length; i++) {
        // Разбиваем длинные строки
        const words = lines[i].split(' ');
        let line = '';

        for (let j = 0; j < words.length; j++) {
            const testLine = line + words[j] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            // Если строка слишком длинная, переносим слова на следующую строку
            if (testWidth > canvas.width - 40 && j > 0) {
                context.fillText(line, 20, y);
                line = words[j] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }

        // Выводим оставшуюся строку
        context.fillText(line, 20, y);
        y += lineHeight;
    }

    // Создаем текстуру из канваса
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    // Создаем материал спрайта
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    // Создаем спрайт с увеличенным масштабом
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(5, 2.5, 1); // Увеличиваем масштаб для большего текста
    sprite.position.set(xcord, ycord, 0); // Позиционируем над моделью

    scene.add(sprite);
    return sprite;
}


// Используем функцию
createTextSprite(5, 4, 512, `Скелет человека — это совокупность костей и их соединений, пассивная часть опорно-двигательного аппарата. Служит опорой мягким тканям, точкой приложения мышц, вместилищем и защитой внутренних органов.  

Основные части скелета: осевой(кости черепа, позвоночника, грудной клетки) и добавочный(верхние и нижние конечности, плечевой и тазовый пояс).  

Скелет взрослого человека состоит примерно из 206 костей, которые объединяются в единое целое с помощью суставов, связок и других соединений.`);


createTextSprite(-7, 6, 600, `1.Череп — костный каркас головы, совокупность костей. Выполняет защитную, опорную и двигательную функции. 

У человека череп состоит из двух отделов:

Мозговой. Его составляют непарные кости — затылочная, лобная, клиновидная и парные височная и теменная; частично в него входит решётчатая кость. Верхняя часть мозгового черепа образует крышу, а нижняя — основание черепа. Изнутри в основании имеются углубления (передняя, средняя и задняя ямки), где расположены лобные и височные доли и мозжечок. 
Лицевой. Его составляет костный скелет верхних отделов органов дыхания (нос) и пищеварения (рот, глотка), в нём расположены органы слуха, зрения, обонятельная часть носа. Лицевая часть черепа состоит из мелких костей, наиболее крупные из которых верхняя и нижняя челюсти. На обеих челюстях расположены ячейки для зубов. 
Средняя окружность черепа человека — 52–64 см, длина — 15–18 см, ширина — 12–15 см.`);

