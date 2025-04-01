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
loader.load('/models/the_human_spinal_column/scene.gltf', function (gltf) {
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
