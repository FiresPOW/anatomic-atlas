import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// Создание сцены
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xCCCCCC);

// Настройка камеры
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(1, 1, 1);

// Создание рендерера
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Создание CSS2D рендерера для аннотаций
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// Добавление освещения
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 2, 3);
scene.add(directionalLight);

// Добавление элементов управления камерой
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Для хранения миксера анимаций
let mixer;
// Для хранения времени для анимации
let clock = new THREE.Clock();
// Текущая активная анимация
let currentAction = null;

// Загрузка 3D модели
const loader = new GLTFLoader();
loader.load('/models/human_anatomic/scene.gltf', function (gltf) {
    // Размещаем модель в центре
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.x = -center.x;
    gltf.scene.position.y = -center.y;
    gltf.scene.position.z = -center.z;

    // Добавляем модель в сцену
    scene.add(gltf.scene);
    
    // Обработка анимаций
    if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(gltf.scene);
        
        // Создаем упрощенную панель управления анимацией
        const animationPanel = document.createElement('div');
        animationPanel.className = 'animation-panel';
        animationPanel.style.position = 'absolute';
        animationPanel.style.bottom = '20px';
        animationPanel.style.left = '20px';
        animationPanel.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        animationPanel.style.padding = '10px';
        animationPanel.style.borderRadius = '5px';
        animationPanel.style.zIndex = '100';
        document.body.appendChild(animationPanel);
        
        // Заголовок панели с информацией о текущей анимации
        const panelTitle = document.createElement('h3');
        panelTitle.textContent = 'Анимация';
        panelTitle.style.margin = '0 0 10px 0';
        animationPanel.appendChild(panelTitle);
        
        // Отображение информации о текущей анимации
        const animationInfo = document.createElement('div');
        animationInfo.style.marginBottom = '10px';
        animationPanel.appendChild(animationInfo);
        
        // Кнопки для управления анимацией
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        
        const playButton = document.createElement('button');
        playButton.textContent = 'Играть';
        playButton.style.padding = '5px 10px';
        playButton.style.flex = '1';
        
        const stopButton = document.createElement('button');
        stopButton.textContent = 'Стоп';
        stopButton.style.padding = '5px 10px';
        stopButton.style.flex = '1';
        
        buttonContainer.appendChild(playButton);
        buttonContainer.appendChild(stopButton);
        animationPanel.appendChild(buttonContainer);
        
        // Автоматически запускаем первую анимацию
        if (gltf.animations.length > 0) {
            currentAction = mixer.clipAction(gltf.animations[0]);
            currentAction.play();
            
            // Отображаем информацию о запущенной анимации
            const animName = gltf.animations[0].name || 'Анимация 1';
            animationInfo.textContent = `Активна: ${animName}`;
        }
        
        // Обработчики событий для кнопок
        playButton.addEventListener('click', function() {
            if (currentAction) {
                currentAction.paused = false;
                animationInfo.textContent = `Активна: ${gltf.animations[0].name || 'Анимация 1'}`;
            } else if (gltf.animations.length > 0) {
                currentAction = mixer.clipAction(gltf.animations[0]);
                currentAction.play();
                animationInfo.textContent = `Активна: ${gltf.animations[0].name || 'Анимация 1'}`;
            }
        });
        
        stopButton.addEventListener('click', function() {
            if (currentAction) {
                currentAction.paused = true;
                animationInfo.textContent = `Приостановлена: ${gltf.animations[0].name || 'Анимация 1'}`;
            }
        });
    }
    
    // Обработка аннотаций (если они есть в userData модели)
    processAnnotations(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});

// Функция для создания аннотаций из метаданных модели
function processAnnotations(scene) {
    // В Sketchfab аннотации часто хранятся в userData моделей
    scene.traverse((node) => {
        if (node.userData && node.userData.annotations) {
            node.userData.annotations.forEach(annotation => {
                // Создаем DOM элемент для аннотации
                const annotationDiv = document.createElement('div');
                annotationDiv.className = 'annotation';
                annotationDiv.textContent = annotation.title || 'Аннотация';
                annotationDiv.style.backgroundColor = 'rgba(0, 102, 204, 0.8)';
                annotationDiv.style.color = 'white';
                annotationDiv.style.padding = '5px 10px';
                annotationDiv.style.borderRadius = '4px';
                annotationDiv.style.pointerEvents = 'auto';
                annotationDiv.style.cursor = 'pointer';
                
                // Создаем объект 2D аннотации
                const annotationObj = new CSS2DObject(annotationDiv);
                
                // Устанавливаем позицию аннотации
                if (annotation.position) {
                    annotationObj.position.set(
                        annotation.position.x || 0,
                        annotation.position.y || 0,
                        annotation.position.z || 0
                    );
                } else {
                    // Если нет позиции, используем центр объекта
                    const box = new THREE.Box3().setFromObject(node);
                    const center = box.getCenter(new THREE.Vector3());
                    annotationObj.position.copy(center);
                }
                
                // Добавляем информацию в аннотацию
                annotationDiv.addEventListener('click', () => {
                    // Создаем всплывающее окно с полной информацией
                    const popup = document.createElement('div');
                    popup.className = 'annotation-popup';
                    popup.style.position = 'absolute';
                    popup.style.top = '50%';
                    popup.style.left = '50%';
                    popup.style.transform = 'translate(-50%, -50%)';
                    popup.style.backgroundColor = 'white';
                    popup.style.padding = '20px';
                    popup.style.borderRadius = '8px';
                    popup.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                    popup.style.zIndex = '1000';
                    popup.style.maxWidth = '500px';
                    
                    // Заголовок аннотации
                    const title = document.createElement('h3');
                    title.textContent = annotation.title || 'Аннотация';
                    title.style.marginTop = '0';
                    
                    // Содержимое аннотации
                    const content = document.createElement('div');
                    content.innerHTML = annotation.description || '';
                    
                    // Кнопка закрытия
                    const closeButton = document.createElement('button');
                    closeButton.textContent = 'Закрыть';
                    closeButton.style.marginTop = '15px';
                    closeButton.style.padding = '5px 15px';
                    
                    closeButton.addEventListener('click', () => {
                        document.body.removeChild(popup);
                    });
                    
                    popup.appendChild(title);
                    popup.appendChild(content);
                    popup.appendChild(closeButton);
                    document.body.appendChild(popup);
                });
                
                // Добавляем аннотацию в сцену
                scene.add(annotationObj);
            });
        }
    });
    
    // Если аннотаций нет в userData, создаем их на основе имен объектов
    // Это альтернативный подход, так как Sketchfab иногда использует имена объектов
    scene.traverse((node) => {
        if (node.name && node.name.includes('annotation')) {
            const annotationDiv = document.createElement('div');
            annotationDiv.className = 'annotation';
            annotationDiv.textContent = node.name.replace('annotation_', '');
            annotationDiv.style.backgroundColor = 'rgba(0, 102, 204, 0.8)';
            annotationDiv.style.color = 'white';
            annotationDiv.style.padding = '5px 10px';
            annotationDiv.style.borderRadius = '4px';
            
            const annotationObj = new CSS2DObject(annotationDiv);
            annotationObj.position.copy(node.position);
            scene.add(annotationObj);
        }
    });
}

// Ручное добавление аннотаций, если они не найдены автоматически
function addManualAnnotations() {
    const annotationData = [
        { 
            position: new THREE.Vector3(0, 0.5, 0), 
            title: "Череп", 
            description: "Костная структура, защищающая головной мозг."
        },
        { 
            position: new THREE.Vector3(0, 0, 0.5), 
            title: "Позвоночник", 
            description: "Гибкий опорный столб тела, защищающий спинной мозг."
        },
        // Добавьте другие аннотации по необходимости
    ];
    
    // Создаем аннотации
    annotationData.forEach(data => {
        const annotationDiv = document.createElement('div');
        annotationDiv.className = 'annotation';
        annotationDiv.textContent = data.title;
        annotationDiv.style.backgroundColor = 'rgba(0, 102, 204, 0.8)';
        annotationDiv.style.color = 'white';
        annotationDiv.style.padding = '5px 10px';
        annotationDiv.style.borderRadius = '4px';
        annotationDiv.style.pointerEvents = 'auto';
        annotationDiv.style.cursor = 'pointer';
        
        annotationDiv.addEventListener('click', () => {
            alert(`${data.title}: ${data.description}`);
        });
        
        const annotationObj = new CSS2DObject(annotationDiv);
        annotationObj.position.copy(data.position);
        scene.add(annotationObj);
    });
}

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Функция анимации
function animate() {
    requestAnimationFrame(animate);
    
    // Обновление миксера анимаций
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    
    controls.update(); // Обновляем контроллер камеры
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera); // Рендерим CSS2D объекты
}

// Добавляем кнопку для ручного добавления аннотаций
const addAnnotationsBtn = document.createElement('button');
addAnnotationsBtn.textContent = 'Добавить аннотации';
addAnnotationsBtn.style.position = 'absolute';
addAnnotationsBtn.style.top = '20px';
addAnnotationsBtn.style.right = '20px';
addAnnotationsBtn.style.padding = '10px';
addAnnotationsBtn.style.zIndex = '100';
addAnnotationsBtn.addEventListener('click', addManualAnnotations);
document.body.appendChild(addAnnotationsBtn);

// Запускаем цикл анимации
animate();