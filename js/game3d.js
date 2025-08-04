// 3D Space Explorer Game
// Copyright © 2024 - جميع الحقوق محفوظة

let scene, camera, renderer, spaceship, bullets = [], asteroids = [], stars = [];
let gameRunning = false, gamePaused = false;
let score = 0, fuel = 100, lives = 3, level = 1;
let keys = {};

// إعداد المشهد ثلاثي الأبعاد
function init3D() {
    const canvas = document.getElementById('game-canvas');
    
    // إنشاء المشهد
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000011, 1, 1000);
    
    // إعداد الكاميرا
    camera = new THREE.PerspectiveCamera(75, 800/600, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // إعداد المُرندر
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(800, 600);
    renderer.setClearColor(0x000011);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // إضاءة المشهد
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // إنشاء الطائرة
    createSpaceship();
    
    // إنشاء النجوم في الخلفية
    createStarField();
    
    // بدء حلقة الرسم
    animate();
}

// إنشاء الطائرة الفضائية
function createSpaceship() {
    const group = new THREE.Group();
    
    // جسم الطائرة الرئيسي - شكل متقدم
    const bodyGeometry = new THREE.ConeGeometry(0.6, 3, 12);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2980b9,
        shininess: 150,
        specular: 0x4a90e2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    body.castShadow = true;
    group.add(body);
    
    // قمرة القيادة
    const cockpitGeometry = new THREE.SphereGeometry(0.3, 8, 6);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1abc9c,
        transparent: true,
        opacity: 0.8,
        emissive: 0x0a5d56
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.z = 0.5;
    cockpit.scale.set(1, 1, 0.6);
    group.add(cockpit);
    
    // الأجنحة
    const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x2980b9 });
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(0, 0, -0.5);
    leftWing.castShadow = true;
    group.add(leftWing);
    
    // المحركات
    const engineGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.5, 8);
    const engineMaterial = new THREE.MeshPhongMaterial({ color: 0xe74c3c });
    
    const leftEngine = new THREE.Mesh(engineGeometry, engineMaterial);
    leftEngine.position.set(-0.8, 0, -0.8);
    leftEngine.rotation.x = Math.PI / 2;
    group.add(leftEngine);
    
    const rightEngine = new THREE.Mesh(engineGeometry, engineMaterial);
    rightEngine.position.set(0.8, 0, -0.8);
    rightEngine.rotation.x = Math.PI / 2;
    group.add(rightEngine);
    
    // إضافة تأثير الدفع
    const thrustGeometry = new THREE.ConeGeometry(0.1, 0.5, 6);
    const thrustMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff6b35,
        transparent: true,
        opacity: 0.8
    });
    
    const leftThrust = new THREE.Mesh(thrustGeometry, thrustMaterial);
    leftThrust.position.set(-0.8, 0, -1.2);
    leftThrust.rotation.x = -Math.PI / 2;
    group.add(leftThrust);
    
    const rightThrust = new THREE.Mesh(thrustGeometry, thrustMaterial);
    rightThrust.position.set(0.8, 0, -1.2);
    rightThrust.rotation.x = -Math.PI / 2;
    group.add(rightThrust);
    
    spaceship = group;
    spaceship.position.set(0, 0, 0);
    scene.add(spaceship);
}

// إنشاء حقل النجوم
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 200;     // x
        positions[i + 1] = (Math.random() - 0.5) * 200; // y
        positions[i + 2] = (Math.random() - 0.5) * 200; // z
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        transparent: true
    });
    
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

// إطلاق النار - طلقات ليزر متقدمة
function shootBullet() {
    // طلقة ليزر مضيئة
    const bulletGeometry = new THREE.CylinderGeometry(0.08, 0.03, 1.2, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9
    });
    
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.copy(spaceship.position);
    bullet.position.z += 2;
    bullet.rotation.x = Math.PI / 2;
    
    // تأثير ضوئي حول الطلقة
    const glowGeometry = new THREE.SphereGeometry(0.15, 8, 6);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    bullet.add(glow);
    
    // إضافة خصائص الحركة
    bullet.velocity = new THREE.Vector3(0, 0, 20);
    bullet.life = 120;
    
    bullets.push(bullet);
    scene.add(bullet);
    
    // إطلاق مزدوج - طلقتان من الجانبين
    const leftBullet = bullet.clone();
    leftBullet.position.x -= 0.8;
    bullets.push(leftBullet);
    scene.add(leftBullet);
    
    const rightBullet = bullet.clone();
    rightBullet.position.x += 0.8;
    bullets.push(rightBullet);
    scene.add(rightBullet);
    
    // تشغيل صوت الإطلاق
    if (typeof audioManager !== 'undefined') {
        audioManager.play('shoot', 0.4);
    }
}

// إنشاء كويكب
function createAsteroid() {
    const size = Math.random() * 0.5 + 0.3;
    const asteroidGeometry = new THREE.DodecahedronGeometry(size, 0);
    const asteroidMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
        flatShading: true
    });
    
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        -50
    );
    
    // إضافة دوران عشوائي
    asteroid.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    
    asteroid.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        Math.random() * 5 + 3
    );
    
    asteroid.rotationSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
    );
    
    asteroid.castShadow = true;
    asteroids.push(asteroid);
    scene.add(asteroid);
}

// إنشاء نجمة قابلة للجمع
function createCollectableStar() {
    const starGeometry = new THREE.ConeGeometry(0.2, 0.4, 5);
    const starMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0.3
    });
    
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        -50
    );
    
    star.velocity = new THREE.Vector3(0, 0, 5);
    star.rotationSpeed = 0.1;
    
    stars.push(star);
    scene.add(star);
}

// تحديث اللعبة
function update() {
    if (!gameRunning || gamePaused) return;
    
    // تحريك الطائرة
    const moveSpeed = 0.3;
    if (keys['ArrowLeft'] && spaceship.position.x > -10) {
        spaceship.position.x -= moveSpeed;
        spaceship.rotation.z = Math.min(spaceship.rotation.z + 0.05, 0.3);
    } else if (keys['ArrowRight'] && spaceship.position.x < 10) {
        spaceship.position.x += moveSpeed;
        spaceship.rotation.z = Math.max(spaceship.rotation.z - 0.05, -0.3);
    } else {
        spaceship.rotation.z *= 0.95;
    }
    
    if (keys['ArrowUp'] && spaceship.position.y < 7) {
        spaceship.position.y += moveSpeed;
        spaceship.rotation.x = Math.min(spaceship.rotation.x + 0.05, 0.2);
    } else if (keys['ArrowDown'] && spaceship.position.y > -7) {
        spaceship.position.y -= moveSpeed;
        spaceship.rotation.x = Math.max(spaceship.rotation.x - 0.05, -0.2);
    } else {
        spaceship.rotation.x *= 0.95;
    }
    
    // تحديث الطلقات
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.position.add(bullet.velocity.clone().multiplyScalar(0.1));
        bullet.life--;
        
        if (bullet.life <= 0 || bullet.position.z < -60) {
            scene.remove(bullet);
            bullets.splice(i, 1);
            continue;
        }
        
        // فحص التصادم مع الكويكبات
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const asteroid = asteroids[j];
            if (bullet.position.distanceTo(asteroid.position) < 1) {
                // انفجار
                createExplosion(asteroid.position);
                scene.remove(bullet);
                scene.remove(asteroid);
                bullets.splice(i, 1);
                asteroids.splice(j, 1);
                score += 100;
                updateUI();
                break;
            }
        }
    }
    
    // تحديث الكويكبات
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.position.add(asteroid.velocity.clone().multiplyScalar(0.1));
        asteroid.rotation.add(asteroid.rotationSpeed);
        
        // فحص التصادم مع الطائرة
        if (asteroid.position.distanceTo(spaceship.position) < 1.5) {
            createExplosion(spaceship.position);
            lives--;
            scene.remove(asteroid);
            asteroids.splice(i, 1);
            
            if (lives <= 0) {
                gameOver();
                return;
            }
            updateUI();
            continue;
        }
        
        if (asteroid.position.z > 15) {
            scene.remove(asteroid);
            asteroids.splice(i, 1);
        }
    }
    
    // تحديث النجوم
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        star.position.add(star.velocity.clone().multiplyScalar(0.1));
        star.rotation.y += star.rotationSpeed;
        
        // فحص الجمع
        if (star.position.distanceTo(spaceship.position) < 1) {
            scene.remove(star);
            stars.splice(i, 1);
            score += 50;
            fuel = Math.min(100, fuel + 10);
            updateUI();
            continue;
        }
        
        if (star.position.z > 15) {
            scene.remove(star);
            stars.splice(i, 1);
        }
    }
    
    // توليد كويكبات جديدة
    if (Math.random() < 0.02) {
        createAsteroid();
    }
    
    // توليد نجوم جديدة
    if (Math.random() < 0.01) {
        createCollectableStar();
    }
    
    // استهلاك الوقود
    fuel -= 0.05;
    if (fuel <= 0) {
        lives--;
        fuel = 100;
        if (lives <= 0) {
            gameOver();
            return;
        }
    }
    
    updateUI();
}

// إنشاء انفجار
function createExplosion(position) {
    const particleCount = 20;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.05, 4, 4);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color().setHSL(Math.random() * 0.1, 1, 0.5)
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        particle.life = 30;
        
        particles.push(particle);
        scene.add(particle);
    }
    
    // إزالة الجسيمات بعد فترة
    setTimeout(() => {
        particles.forEach(particle => {
            scene.remove(particle);
        });
    }, 1000);
    
    // تشغيل صوت الانفجار
    if (typeof audioManager !== 'undefined') {
        audioManager.play('explosion');
    }
}

// حلقة الرسم
function animate() {
    requestAnimationFrame(animate);
    
    if (gameRunning) {
        update();
    }
    
    // تحريك الكاميرا قليلاً لتأثير ديناميكي
    if (spaceship) {
        camera.position.x = spaceship.position.x * 0.1;
        camera.position.y = spaceship.position.y * 0.1 + 5;
        camera.lookAt(spaceship.position.x * 0.2, spaceship.position.y * 0.2, -5);
    }
    
    renderer.render(scene, camera);
}

// تحديث واجهة المستخدم
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('fuel').textContent = Math.floor(fuel);
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

// بدء اللعبة
function startGame3D() {
    gameRunning = true;
    gamePaused = false;
    score = 0;
    fuel = 100;
    lives = 3;
    level = 1;
    
    // مسح الكائنات السابقة
    bullets.forEach(bullet => scene.remove(bullet));
    asteroids.forEach(asteroid => scene.remove(asteroid));
    stars.forEach(star => scene.remove(star));
    bullets = [];
    asteroids = [];
    stars = [];
    
    // إخفاء الشاشات
    document.querySelector('.start-screen').style.display = 'none';
    document.querySelector('.game-screen').style.display = 'block';
    
    updateUI();
    
    // تشغيل الموسيقى
    if (typeof audioManager !== 'undefined') {
        audioManager.play('background');
    }
}

// انتهاء اللعبة
function gameOver() {
    gameRunning = false;
    document.querySelector('.game-over').style.display = 'flex';
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-level').textContent = level;
}

// أحداث لوحة المفاتيح
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ' && gameRunning && !gamePaused) {
        e.preventDefault();
        shootBullet();
    }
    
    if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePause();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// إيقاف/استئناف اللعبة
function togglePause() {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
    document.querySelector('.pause-screen').style.display = gamePaused ? 'flex' : 'none';
}

// تحديث أحداث الأزرار
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة 3D
    init3D();
    
    // أحداث الأزرار
    document.getElementById('start-btn').addEventListener('click', startGame3D);
    document.getElementById('restart-btn').addEventListener('click', () => {
        document.querySelector('.game-over').style.display = 'none';
        startGame3D();
    });
    
    document.getElementById('quit-btn').addEventListener('click', () => {
        gameRunning = false;
        document.querySelector('.game-screen').style.display = 'none';
        document.querySelector('.start-screen').style.display = 'flex';
    });
});

// تحكم باللمس للأجهزة المحمولة
let touchStartX = 0, touchStartY = 0;
let isTouching = false;

function setupTouchControls() {
    const canvas = document.getElementById('game-canvas');
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameRunning || gamePaused) return;
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        touchStartX = touch.clientX - rect.left;
        touchStartY = touch.clientY - rect.top;
        isTouching = true;
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isTouching || !gameRunning || gamePaused) return;
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;
        
        const deltaX = (currentX - touchStartX) / rect.width;
        const deltaY = (currentY - touchStartY) / rect.height;
        
        // تحريك الطائرة حسب اللمس
        if (spaceship) {
            spaceship.position.x = Math.max(-10, Math.min(10, spaceship.position.x + deltaX * 20));
            spaceship.position.y = Math.max(-7, Math.min(7, spaceship.position.y - deltaY * 14));
        }
        
        touchStartX = currentX;
        touchStartY = currentY;
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!isTouching) return;
        
        // إطلاق نار عند رفع الإصبع
        if (gameRunning && !gamePaused) {
            shootBullet();
        }
        
        isTouching = false;
    }, { passive: false });
}

// تفعيل التحكم باللمس عند التحميل
window.addEventListener('load', setupTouchControls);

console.log('🚀 تم تحميل المحرك ثلاثي الأبعاد بنجاح!');