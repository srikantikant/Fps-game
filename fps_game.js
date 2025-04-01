// Import Three.js dan Ammo.js (pastikan library sudah diinstal)
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

let scene, camera, renderer, controls;
let bullets = [];
let enemies = [];
let score = 0;
let health = 100;
let weaponType = 'pistol';
let ammo = { pistol: 10, shotgun: 5 };
let audioLoader, shootSound, hitSound, damageSound, reloadSound, emptySound;

init();
animate();

function init() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    controls = new PointerLockControls(camera, document.body);
    document.addEventListener('click', () => controls.lock());
    
    // Light
    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);
    
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    
    // Player position
    camera.position.y = 2;
    
    // Event listener untuk menembak dan mengganti senjata
    document.addEventListener('click', shoot);
    document.addEventListener('keydown', switchWeapon);
    document.addEventListener('keydown', reloadWeapon);
    
    // Tambahkan musuh
    spawnEnemies();

    // Tampilkan skor dan kesehatan
    createHUD();
    updateHUD();

    // Load efek suara
    const listener = new THREE.AudioListener();
    camera.add(listener);
    audioLoader = new THREE.AudioLoader();
    shootSound = new THREE.Audio(listener);
    hitSound = new THREE.Audio(listener);
    damageSound = new THREE.Audio(listener);
    reloadSound = new THREE.Audio(listener);
    emptySound = new THREE.Audio(listener);
    
    audioLoader.load('shoot.mp3', buffer => shootSound.setBuffer(buffer).setVolume(0.5));
    audioLoader.load('hit.mp3', buffer => hitSound.setBuffer(buffer).setVolume(0.5));
    audioLoader.load('damage.mp3', buffer => damageSound.setBuffer(buffer).setVolume(0.5));
    audioLoader.load('reload.mp3', buffer => reloadSound.setBuffer(buffer).setVolume(0.5));
    audioLoader.load('empty.mp3', buffer => emptySound.setBuffer(buffer).setVolume(0.5));
}

function createHUD() {
    const hud = document.createElement('div');
    hud.id = 'hud';
    hud.style.position = 'absolute';
    hud.style.top = '10px';
    hud.style.left = '10px';
    hud.style.color = 'white';
    hud.style.fontSize = '20px';
    document.body.appendChild(hud);
}

function updateHUD() {
    document.getElementById('hud').innerText = `Score: ${score} | Health: ${health} | Weapon: ${weaponType} | Ammo: ${ammo[weaponType]}`;
}

function switchWeapon(event) {
    if (event.key === '1') {
        weaponType = 'pistol';
    } else if (event.key === '2') {
        weaponType = 'shotgun';
    }
    reloadSound.play();
    updateHUD();
}

function reloadWeapon(event) {
    if (event.key === 'r') {
        ammo[weaponType] = weaponType === 'pistol' ? 10 : 5;
        reloadSound.play();
        updateHUD();
    }
}

function shoot() {
    if (ammo[weaponType] <= 0) {
        emptySound.play();
        return;
    }
    
    if (shootSound.isPlaying) shootSound.stop();
    shootSound.play();
    ammo[weaponType]--;
    updateHUD();
    
    let bulletSpeed = 0.5;
    let bulletSpread = 0;
    let bulletCount = 1;

    if (weaponType === 'shotgun') {
        bulletCount = 5;
        bulletSpeed = 0.3;
        bulletSpread = 0.1;
    }

    for (let i = 0; i < bulletCount; i++) {
        const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        
        bullet.position.set(camera.position.x, camera.position.y, camera.position.z);
        
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        
        if (bulletSpread > 0) {
            direction.x += (Math.random() - 0.5) * bulletSpread;
            direction.y += (Math.random() - 0.5) * bulletSpread;
        }
        
        bullet.userData.velocity = direction.multiplyScalar(bulletSpeed);
        
        bullets.push(bullet);
        scene.add(bullet);
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    bullets.forEach((bullet, index) => {
        bullet.position.add(bullet.userData.velocity);
        if (bullet.position.length() > 50) {
            scene.remove(bullet);
            bullets.splice(index, 1);
        }
    });
    
    renderer.render(scene, camera);
}
