// Complete 3D Space Explorer Game
// Copyright © 2024 - جميع الحقوق محفوظة

// 3D Scene variables
let scene, camera, renderer, spaceship;
let gameRunning = false, gamePaused = false;
let score = 0, fuel = 100, lives = 3, shield = 0, level = 1;
let highScore = localStorage.getItem('highScore') || 0;
let combo = 0, maxCombo = 0, comboTimer = 0;

// Game objects arrays
let bullets = [], asteroids = [], stars = [], powerUps = [];
let enemyShips = [], enemyBullets = [], bosses = [], missiles = [];
let explosions = [], particles = [], backgroundStars = [];

// Audio and controls
let muted = false, musicVolume = 0.3, sfxVolume = 0.5;
let keys = {};

// Game stats and achievements
let gameStats = {
    totalPlayTime: 0, enemiesKilled: 0, longestSurvival: 0,
    bestCombo: 0, gamesPlayed: 0, starsCollected: 0, startTime: 0
};

let achievements = {
    firstKill: { unlocked: false, name: 'أول قتل', desc: 'دمر عدوك الأول' },
    combo10: { unlocked: false, name: 'كومبو عشرة', desc: 'حقق كومبو 10' },
    level10: { unlocked: false, name: 'مستكشف', desc: 'وصل للمستوى 10' },
    survivor: { unlocked: false, name: 'ناجي', desc: 'عش 5 دقائق' },
    starCollector: { unlocked: false, name: 'جامع النجوم', desc: 'اجمع 100 نجمة' },
    bossKiller: { unlocked: false, name: 'قاتل الزعماء', desc: 'دمر زعيم مرحلة' }
};

// Audio setup
let sounds = {};
try {
    sounds = {
        explosion: new Audio('sounds/explosion-42132.mp3'),
        collect: new Audio('sounds/aylex-i-can-fly.mp3'),
        background: new Audio('sounds/escp-neon-metaphor.mp3'),
        shoot: new Audio('sounds/large-explosion-100420.mp3')
    };
    Object.values(sounds).forEach(sound => {
        sound.volume = 0.3;
        sound.onerror = () => console.log('Audio not found');
    });
    sounds.background.loop = true;
    sounds.background.volume = 0.1;
} catch (e) {
    sounds = { explosion: {play:()=>{}}, collect: {play:()=>{}}, background: {play:()=>{},pause:()=>{}}, shoot: {play:()=>{}} };
}

// Stage system
const stageNames = [
    'الفضاء القريب', 'حقل الكويكبات', 'النيازك الحمراء', 'مجرة النجوم', 'العاصفة الشمسية',
    'الثقب الأسود', 'منطقة الكريستال', 'الفضاء العميق', 'بوابة المجهول', 'المعركة النهائية'
];

function getStage(level) {
    const nameIndex = (level - 1) % stageNames.length;
    return {
        name: level > 10 ? `${stageNames[nameIndex]} ${Math.floor((level-1)/10) + 1}` : stageNames[nameIndex],
        bgColor: `hsl(${(level * 30) % 360}, 70%, 10%)`,
        asteroidColor: `hsl(${(level * 30) % 360}, 70%, 50%)`,
        starColor: `hsl(${(level * 50) % 360}, 90%, 70%)`
    };
}

// Initialize 3D scene
function init3D() {
    const canvas = document.getElementById('game-canvas');
    
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000011, 10, 200);
    
    camera = new THREE.PerspectiveCamera(75, 800/600, 0.1, 1000);
    camera.position.set(0, 5, 15);
    
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(800, 600);
    renderer.setClearColor(0x000011);
    renderer.shadowMap.enabled = true;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    createSpaceship();
    createStarField();
    loadStats();
    loadAchievements();
    
    animate();
}

// Create 3D spaceship
function createSpaceship() {
    const group = new THREE.Group();
    
    // Main body
    const bodyGeometry = new THREE.ConeGeometry(0.6, 3, 12);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2980b9, shininess: 150, specular: 0x4a90e2 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    body.castShadow = true;
    group.add(body);
    
    // Cockpit
    const cockpitGeometry = new THREE.SphereGeometry(0.3, 8, 6);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1abc9c, transparent: true, opacity: 0.8, emissive: 0x0a5d56 
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.z = 0.5;
    cockpit.scale.set(1, 1, 0.6);
    group.add(cockpit);
    
    // Wings
    const wingGeometry = new THREE.BoxGeometry(2.5, 0.1, 0.8);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.z = -0.5;
    wings.castShadow = true;
    group.add(wings);
    
    // Engines
    const engineGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8);
    const engineMaterial = new THREE.MeshPhongMaterial({ color: 0xe74c3c });
    
    [-1, 1].forEach(side => {
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.position.set(side * 0.8, 0, -1);
        engine.rotation.x = Math.PI / 2;
        group.add(engine);
        
        // Thrust effect
        const thrustGeometry = new THREE.ConeGeometry(0.12, 0.8, 6);
        const thrustMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff6b35, transparent: true, opacity: 0.8 
        });
        const thrust = new THREE.Mesh(thrustGeometry, thrustMaterial);
        thrust.position.set(side * 0.8, 0, -1.5);
        thrust.rotation.x = -Math.PI / 2;
        group.add(thrust);
    });
    
    spaceship = group;
    spaceship.position.set(0, 0, 0);
    scene.add(spaceship);
}

// Create star field
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 400;
        positions[i + 1] = (Math.random() - 0.5) * 400;
        positions[i + 2] = (Math.random() - 0.5) * 400;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

// Shoot bullets
function shootBullet() {
    const bulletGeometry = new THREE.CylinderGeometry(0.08, 0.03, 1.5, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.8 
    });
    
    [-0.8, 0.8].forEach(offset => {
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        bullet.position.copy(spaceship.position);
        bullet.position.x += offset;
        bullet.position.z += 2;
        bullet.rotation.x = Math.PI / 2;
        bullet.velocity = new THREE.Vector3(0, 0, 25);
        bullet.life = 120;
        bullet.damage = 1;
        bullets.push(bullet);
        scene.add(bullet);
    });
    
    if (!muted) {
        sounds.shoot.currentTime = 0;
        sounds.shoot.volume = sfxVolume;
        sounds.shoot.play().catch(() => {});
    }
}

// Create 3D asteroid
function createAsteroid() {
    const size = Math.random() * 0.8 + 0.4;
    const asteroidGeometry = new THREE.DodecahedronGeometry(size, 0);
    const stage = getStage(level);
    const asteroidMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(stage.asteroidColor), flatShading: true 
    });
    
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        -80
    );
    
    asteroid.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 2,
        Math.random() * 8 + 5
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

// Create collectible star
function createCollectableStar() {
    const starGeometry = new THREE.ConeGeometry(0.3, 0.6, 5);
    const stage = getStage(level);
    const starMaterial = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(stage.starColor),
        emissive: new THREE.Color(stage.starColor),
        emissiveIntensity: 0.5
    });
    
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 18,
        -80
    );
    
    star.velocity = new THREE.Vector3(0, 0, 6);
    star.rotationSpeed = 0.15;
    
    stars.push(star);
    scene.add(star);
}

// Create power-up
function createPowerUp() {
    const types = ['shield', 'fuel', 'life', 'rapidfire', 'multishot', 'damage'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = { shield: 0x00ffff, fuel: 0x00ff00, life: 0xff00ff, 
                    rapidfire: 0xffff00, multishot: 0xff8000, damage: 0xff0000 };
    
    const powerUpGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const powerUpMaterial = new THREE.MeshBasicMaterial({ 
        color: colors[type], emissive: colors[type], emissiveIntensity: 0.3 
    });
    
    const powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
    powerUp.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 18,
        -80
    );
    
    powerUp.velocity = new THREE.Vector3(0, 0, 4);
    powerUp.type = type;
    powerUp.rotationSpeed = 0.1;
    
    powerUps.push(powerUp);
    scene.add(powerUp);
}

// Create enemy ship
function createEnemyShip() {
    const enemyGeometry = new THREE.ConeGeometry(0.4, 1.5, 8);
    const enemyMaterial = new THREE.MeshPhongMaterial({ color: 0xff4757 });
    
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 18,
        -80
    );
    enemy.rotation.x = -Math.PI / 2;
    
    enemy.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 1,
        Math.random() * 4 + 3
    );
    enemy.shootTimer = 0;
    enemy.health = 2;
    
    enemyShips.push(enemy);
    scene.add(enemy);
}

// Create boss
function createBoss() {
    const bossGeometry = new THREE.BoxGeometry(3, 2, 1.5);
    const bossMaterial = new THREE.MeshPhongMaterial({ color: 0x8b0000 });
    
    const boss = new THREE.Mesh(bossGeometry, bossMaterial);
    boss.position.set(0, 0, -60);
    
    boss.velocity = new THREE.Vector3(0, 0, 1);
    boss.health = 20;
    boss.maxHealth = 20;
    boss.shootTimer = 0;
    boss.type = 'boss';
    
    bosses.push(boss);
    scene.add(boss);
}

// Create explosion
function createExplosion(position) {
    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color().setHSL(Math.random() * 0.1, 1, 0.5)
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15
        );
        particle.life = 40;
        
        particles.push(particle);
        scene.add(particle);
    }
    
    if (!muted) {
        sounds.explosion.currentTime = 0;
        sounds.explosion.volume = sfxVolume;
        sounds.explosion.play().catch(() => {});
    }
}

// Game update loop
function update() {
    if (!gameRunning || gamePaused) return;
    
    // Move spaceship
    const moveSpeed = 0.4;
    if (keys['ArrowLeft'] && spaceship.position.x > -12) {
        spaceship.position.x -= moveSpeed;
        spaceship.rotation.z = Math.min(spaceship.rotation.z + 0.05, 0.3);
    } else if (keys['ArrowRight'] && spaceship.position.x < 12) {
        spaceship.position.x += moveSpeed;
        spaceship.rotation.z = Math.max(spaceship.rotation.z - 0.05, -0.3);
    } else {
        spaceship.rotation.z *= 0.95;
    }
    
    if (keys['ArrowUp'] && spaceship.position.y < 8) {
        spaceship.position.y += moveSpeed;
        spaceship.rotation.x = Math.min(spaceship.rotation.x + 0.05, 0.2);
    } else if (keys['ArrowDown'] && spaceship.position.y > -8) {
        spaceship.position.y -= moveSpeed;
        spaceship.rotation.x = Math.max(spaceship.rotation.x - 0.05, -0.2);
    } else {
        spaceship.rotation.x *= 0.95;
    }
    
    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.position.add(bullet.velocity.clone().multiplyScalar(0.1));
        bullet.life--;
        
        if (bullet.life <= 0 || bullet.position.z < -100) {
            scene.remove(bullet);
            bullets.splice(i, 1);
            continue;
        }
        
        // Check collisions with asteroids
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (bullet.position.distanceTo(asteroids[j].position) < 1.5) {
                createExplosion(asteroids[j].position);
                scene.remove(bullet);
                scene.remove(asteroids[j]);
                bullets.splice(i, 1);
                asteroids.splice(j, 1);
                score += 100 * level;
                gameStats.enemiesKilled++;
                updateCombo();
                break;
            }
        }
        
        // Check collisions with enemies
        for (let j = enemyShips.length - 1; j >= 0; j--) {
            if (bullet.position.distanceTo(enemyShips[j].position) < 1) {
                enemyShips[j].health--;
                if (enemyShips[j].health <= 0) {
                    createExplosion(enemyShips[j].position);
                    scene.remove(enemyShips[j]);
                    enemyShips.splice(j, 1);
                    score += 200 * level;
                    gameStats.enemiesKilled++;
                    updateCombo();
                }
                scene.remove(bullet);
                bullets.splice(i, 1);
                break;
            }
        }
    }
    
    // Update asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.position.add(asteroid.velocity.clone().multiplyScalar(0.1));
        asteroid.rotation.add(asteroid.rotationSpeed);
        
        if (asteroid.position.distanceTo(spaceship.position) < 2) {
            createExplosion(spaceship.position);
            scene.remove(asteroid);
            asteroids.splice(i, 1);
            
            if (shield > 0) {
                shield -= 30;
            } else {
                lives--;
                if (lives <= 0) {
                    defeat();
                    return;
                }
            }
            continue;
        }
        
        if (asteroid.position.z > 20) {
            scene.remove(asteroid);
            asteroids.splice(i, 1);
            score += 10;
        }
    }
    
    // Update stars
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        star.position.add(star.velocity.clone().multiplyScalar(0.1));
        star.rotation.y += star.rotationSpeed;
        
        if (star.position.distanceTo(spaceship.position) < 1.5) {
            scene.remove(star);
            stars.splice(i, 1);
            score += 50 * level;
            fuel = Math.min(100, fuel + 15);
            gameStats.starsCollected++;
            
            if (!muted) {
                sounds.collect.currentTime = 0;
                sounds.collect.play().catch(() => {});
            }
            continue;
        }
        
        if (star.position.z > 20) {
            scene.remove(star);
            stars.splice(i, 1);
        }
    }
    
    // Update power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.position.add(powerUp.velocity.clone().multiplyScalar(0.1));
        powerUp.rotation.y += powerUp.rotationSpeed;
        
        if (powerUp.position.distanceTo(spaceship.position) < 1.5) {
            applyPowerUp(powerUp.type);
            scene.remove(powerUp);
            powerUps.splice(i, 1);
            continue;
        }
        
        if (powerUp.position.z > 20) {
            scene.remove(powerUp);
            powerUps.splice(i, 1);
        }
    }
    
    // Spawn objects
    if (Math.random() < 0.015 + level * 0.002) createAsteroid();
    if (Math.random() < 0.01) createCollectableStar();
    if (Math.random() < 0.003) createPowerUp();
    if (Math.random() < 0.002 * level && level >= 3) createEnemyShip();
    if (level % 5 === 0 && bosses.length === 0 && Math.random() < 0.01) createBoss();
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.position.add(particle.velocity.clone().multiplyScalar(0.1));
        particle.life--;
        
        if (particle.life <= 0) {
            scene.remove(particle);
            particles.splice(i, 1);
        }
    }
    
    // Consume fuel and update combo
    fuel -= 0.05;
    if (fuel <= 0) {
        lives--;
        fuel = 100;
        if (lives <= 0) {
            defeat();
            return;
        }
    }
    
    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer <= 0) resetCombo();
    }
    
    // Level progression
    if (score >= level * 1500) {
        level++;
        if (level > 100) {
            victory();
            return;
        }
    }
    
    updateUI();
}

// Apply power-up effects
function applyPowerUp(type) {
    switch(type) {
        case 'shield': shield = Math.min(100, shield + 50); break;
        case 'fuel': fuel = Math.min(100, fuel + 30); break;
        case 'life': lives = Math.min(5, lives + 1); break;
        case 'rapidfire': /* implement rapid fire */ break;
        case 'multishot': /* implement multi shot */ break;
        case 'damage': /* implement damage boost */ break;
    }
}

// Combo system
function updateCombo() {
    combo++;
    comboTimer = 180;
    maxCombo = Math.max(maxCombo, combo);
    
    if (combo >= 5) {
        document.getElementById('combo-display').style.display = 'block';
        document.getElementById('combo-count').textContent = combo;
    }
    
    if (combo >= 10 && !achievements.combo10.unlocked) {
        unlockAchievement('combo10');
    }
}

function resetCombo() {
    combo = 0;
    document.getElementById('combo-display').style.display = 'none';
}

// Achievement system
function unlockAchievement(id) {
    if (!achievements[id] || achievements[id].unlocked) return;
    
    achievements[id].unlocked = true;
    saveAchievements();
    
    const notification = document.getElementById('achievement-notification');
    notification.textContent = `🏆 ${achievements[id].name}: ${achievements[id].desc}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (gameRunning) {
        update();
    }
    
    // Camera follow
    if (spaceship) {
        camera.position.x = spaceship.position.x * 0.1;
        camera.position.y = spaceship.position.y * 0.1 + 5;
        camera.lookAt(spaceship.position.x * 0.2, spaceship.position.y * 0.2, -10);
    }
    
    renderer.render(scene, camera);
}

// Game control functions
function startGame() {
    gameRunning = true;
    gamePaused = false;
    score = 0;
    fuel = 100;
    lives = 3;
    shield = 0;
    level = 1;
    combo = 0;
    
    // Clear objects
    [...bullets, ...asteroids, ...stars, ...powerUps, ...enemyShips, ...particles].forEach(obj => scene.remove(obj));
    bullets = []; asteroids = []; stars = []; powerUps = []; enemyShips = []; particles = [];
    
    // Reset spaceship position
    spaceship.position.set(0, 0, 0);
    spaceship.rotation.set(0, 0, 0);
    
    // Hide screens
    document.querySelector('.start-screen').style.display = 'none';
    document.querySelector('.game-screen').style.display = 'block';
    document.querySelector('.game-over').style.display = 'none';
    document.querySelector('.defeat-screen').style.display = 'none';
    
    // Start music
    if (!muted) {
        sounds.background.play().catch(() => {});
    }
    
    gameStats.gamesPlayed++;
    gameStats.startTime = Date.now();
    updateUI();
}

function victory() {
    gameRunning = false;
    sounds.background.pause();
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    
    document.getElementById('victory-score').textContent = score;
    document.getElementById('victory-level').textContent = level;
    document.querySelector('.victory-screen').style.display = 'flex';
}

function defeat() {
    gameRunning = false;
    sounds.background.pause();
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    
    saveStats();
    
    document.getElementById('defeat-score').textContent = score;
    document.getElementById('defeat-level').textContent = level;
    document.getElementById('defeat-combo').textContent = maxCombo;
    document.querySelector('.defeat-screen').style.display = 'flex';
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('fuel').textContent = Math.floor(fuel);
    document.getElementById('lives').textContent = lives;
    document.getElementById('shield').textContent = Math.floor(shield);
    document.getElementById('level').textContent = level;
    document.getElementById('high-score').textContent = highScore;
}

// Data persistence
function saveStats() {
    localStorage.setItem('gameStats', JSON.stringify(gameStats));
}

function loadStats() {
    const saved = localStorage.getItem('gameStats');
    if (saved) {
        gameStats = { ...gameStats, ...JSON.parse(saved) };
    }
}

function saveAchievements() {
    localStorage.setItem('achievements', JSON.stringify(achievements));
}

function loadAchievements() {
    const saved = localStorage.getItem('achievements');
    if (saved) {
        achievements = { ...achievements, ...JSON.parse(saved) };
    }
}

// Event listeners
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

function togglePause() {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
    document.querySelector('.pause-screen').style.display = gamePaused ? 'flex' : 'none';
}

// Audio controls
window.addEventListener('DOMContentLoaded', function() {
    const muteBtn = document.getElementById('mute-btn');
    const musicSlider = document.getElementById('music-volume');
    const sfxSlider = document.getElementById('sfx-volume');
    
    if (muteBtn) {
        muteBtn.addEventListener('click', function() {
            muted = !muted;
            muteBtn.textContent = muted ? '🔇 الصوت' : '🔊 الصوت';
            muteBtn.classList.toggle('muted', muted);
            
            if (muted) {
                sounds.background.pause();
            } else if (gameRunning) {
                sounds.background.play().catch(() => {});
            }
        });
    }
    
    if (musicSlider) {
        musicSlider.addEventListener('input', function() {
            musicVolume = this.value / 100;
            sounds.background.volume = musicVolume;
        });
    }
    
    if (sfxSlider) {
        sfxSlider.addEventListener('input', function() {
            sfxVolume = this.value / 100;
        });
    }
});

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    init3D();
    
    // Button events
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    document.getElementById('victory-restart-btn').addEventListener('click', startGame);
    document.getElementById('defeat-restart-btn').addEventListener('click', startGame);
    
    document.getElementById('quit-btn').addEventListener('click', () => {
        gameRunning = false;
        sounds.background.pause();
        document.querySelector('.start-screen').style.display = 'flex';
        document.querySelector('.game-screen').style.display = 'none';
    });
    
    // Initialize high score
    document.getElementById('high-score').textContent = highScore;
});

console.log('🚀 تم تحميل اللعبة ثلاثية الأبعاد الكاملة بنجاح!');