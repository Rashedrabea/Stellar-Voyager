// عناصر DOM
const startScreen = document.querySelector('.start-screen');
const gameScreen = document.querySelector('.game-screen');
const gameOverScreen = document.querySelector('.game-over');
const pauseScreen = document.querySelector('.pause-screen');
const victoryScreen = document.querySelector('.victory-screen');
const defeatScreen = document.querySelector('.defeat-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const quitBtn = document.getElementById('quit-btn');
const victoryRestartBtn = document.getElementById('victory-restart-btn');
const victoryMenuBtn = document.getElementById('victory-menu-btn');
const defeatRestartBtn = document.getElementById('defeat-restart-btn');
const defeatMenuBtn = document.getElementById('defeat-menu-btn');
// سيتم قراءة هذه القيم مباشرة في دالة startGame
const statsBtn = document.getElementById('stats-btn');
const achievementsBtn = document.getElementById('achievements-btn');
const statsScreen = document.querySelector('.stats-screen');
const achievementsScreen = document.querySelector('.achievements-screen');
const statsBackBtn = document.getElementById('stats-back-btn');
const achievementsBackBtn = document.getElementById('achievements-back-btn');
const comboDisplay = document.getElementById('combo-display');
const comboCount = document.getElementById('combo-count');
const achievementNotification = document.getElementById('achievement-notification');
const shareBtn = document.getElementById('share-btn');
const defeatCombo = document.getElementById('defeat-combo');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const fuelElement = document.getElementById('fuel');
const livesElement = document.getElementById('lives');
const shieldElement = document.getElementById('shield');
const levelElement = document.getElementById('level');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const finalLevelElement = document.getElementById('final-level');
const victoryScoreElement = document.getElementById('victory-score');
const victoryLevelElement = document.getElementById('victory-level');
const defeatScoreElement = document.getElementById('defeat-score');
const defeatLevelElement = document.getElementById('defeat-level');

// إعداد اللعبة
canvas.width = 800;
canvas.height = 600;

// تحسين الحجم للموبايل
function adjustCanvasSize() {
    if (window.innerWidth <= 768) {
        const container = document.querySelector('.game-screen');
        if (container) {
            canvas.style.width = '100%';
            canvas.style.height = 'calc(100vh - 200px)';
        }
    } else {
        canvas.style.width = '800px';
        canvas.style.height = '600px';
    }
}

adjustCanvasSize();
window.addEventListener('resize', adjustCanvasSize);

// Copyright Protection System - Simplified
(function() {
    'use strict';
    
    // Console warning only
    console.log('%cتحذير!', 'color: red; font-size: 20px; font-weight: bold;');
    console.log('%cهذه اللعبة محمية بحقوق الطبع والنشر', 'color: red; font-size: 16px;');
})();

// Game Copyright Info
const GAME_INFO = {
    name: 'المستكشف الفضائي',
    version: '1.0.0',
    copyright: '© 2024 - جميع الحقوق محفوظة',
    author: 'المستكشف الفضائي Team',
    license: 'Proprietary - ملكية خاصة'
};

// الأصوات - مع معالجة الأخطاء
let sounds = {};
try {
    sounds = {
        explosion: new Audio('sounds/explosion-42132.mp3'),
        collect: new Audio('sounds/aylex-i-can-fly.mp3'),
        background: new Audio('sounds/escp-neon-metaphor.mp3'),
        shoot: new Audio('sounds/large-explosion-100420.mp3')
    };
    
    // تقليل مستوى الصوت
    Object.values(sounds).forEach(sound => {
        sound.volume = 0.3;
        sound.onerror = () => console.log('فشل تحميل الصوت');
    });
    
    sounds.background.loop = true;
    sounds.background.volume = 0.1;
} catch (error) {
    console.log('فشل تحميل الأصوات:', error);
    // أصوات وهمية لتجنب الأخطاء
    sounds = {
        explosion: { play: () => {}, currentTime: 0 },
        collect: { play: () => {}, currentTime: 0 },
        background: { play: () => {}, pause: () => {}, currentTime: 0 },
        shoot: { play: () => {}, currentTime: 0, volume: 0.1 }
    };
}

// متغيرات اللعبة
let gameRunning = false;
let gamePaused = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let fuel = 100;
let lives = 3;
let shield = 0;
let level = 1;
let difficulty = 'medium';
let lastTime = 0;
const WIN_LEVEL = 100; // المستوى المطلوب للفوز

// نظام المراحل - 100 مرحلة
const stageNames = [
    'الفضاء القريب', 'حقل الكويكبات', 'النيازك الحمراء', 'مجرة النجوم', 'العاصفة الشمسية',
    'الثقب الأسود', 'منطقة الكريستال', 'الفضاء العميق', 'بوابة المجهول', 'المعركة النهائية',
    'عالم النار', 'محيط الجليد', 'صحراء الفضاء', 'مدينة الروبوت', 'مملكة الظلام',
    'جزيرة العواصف', 'وادي الأشباح', 'قلعة الشر', 'بحر النجوم', 'جبال البرق'
];

const bgColors = [
    '#000033', '#1a0033', '#330000', '#003366', '#663300', '#000000', '#004d4d', '#1a001a', '#4d0026', '#660000',
    '#4d1a00', '#001a4d', '#4d4d00', '#1a1a1a', '#4d004d', '#004d26', '#26004d', '#4d0013', '#00264d', '#4d2600'
];

function getStage(level) {
    const nameIndex = (level - 1) % stageNames.length;
    const colorIndex = (level - 1) % bgColors.length;
    const intensity = Math.min(1 + (level - 1) * 0.1, 5);
    
    return {
        name: level > 20 ? `${stageNames[nameIndex]} ${Math.floor((level-1)/20) + 1}` : stageNames[nameIndex],
        bgColor: bgColors[colorIndex],
        asteroidColor: `hsl(${(level * 30) % 360}, 70%, ${Math.min(30 + level * 2, 80)}%)`,
        starColor: `hsl(${(level * 50) % 360}, 90%, ${Math.min(50 + level, 90)}%)`,
        planetColor: `hsl(${(level * 40) % 360}, 60%, ${Math.min(40 + level, 70)}%)`,
        enemyColor: `hsl(${(level * 20) % 360}, 80%, ${Math.min(50 + level, 85)}%)`
    };
}

const stages = {}; // سيتم ملؤها ديناميكياً

let currentStage = 1;
let asteroids = [];
let stars = [];
let explosions = [];
let powerUps = [];
let backgroundStars = [];
let bullets = [];
let planets = [];
let enemyShips = [];
let enemyBullets = [];
let stageTransition = false;
let transitionTimer = 0;
let stageNameDisplay = false;
let stageNameTimer = 0;
let particles = [];
let thrustParticles = [];
let weaponUpgrades = [];
let specialEffects = [];
let fireRate = 1;
let bulletDamage = 1;
let multiShot = 1;
let rapidFire = false;
let rapidFireTimer = 0;

// أنظمة جديدة
let combo = 0;
let maxCombo = 0;
let comboTimer = 0;
let bosses = [];
let missiles = [];
let laserBeams = [];
let fuelStations = [];
let rescueTargets = [];
let cameraShake = 0;
let superMode = false;
let superModeTimer = 0;
let spaceStorms = [];
let spaceTraps = [];
let wormholes = [];
let meteorShowers = [];
let timeSlowEffect = false;
let timeSlowTimer = 0;

// إحصائيات
let gameStats = {
    totalPlayTime: 0,
    enemiesKilled: 0,
    longestSurvival: 0,
    bestCombo: 0,
    gamesPlayed: 0,
    starsCollected: 0,
    startTime: 0
};

// الإنجازات
let achievements = {
    firstKill: { unlocked: false, name: 'أول قتل', desc: 'دمر عدوك الأول' },
    combo10: { unlocked: false, name: 'كومبو عشرة', desc: 'حقق كومبو 10' },
    level10: { unlocked: false, name: 'مستكشف', desc: 'وصل للمستوى 10' },
    survivor: { unlocked: false, name: 'ناجي', desc: 'عش 5 دقائق' },
    starCollector: { unlocked: false, name: 'جامع النجوم', desc: 'اجمع 100 نجمة' },
    bossKiller: { unlocked: false, name: 'قاتل الزعماء', desc: 'دمر زعيم مرحلة' }
};

// نظام صعوبة تلقائي حسب المستوى
function getDifficultySettings(level) {
    const baseSettings = {
        asteroidChance: 0.015 + (level - 1) * 0.002,
        starChance: 0.015 - (level - 1) * 0.0005,
        asteroidSpeed: 1.5 + (level - 1) * 0.1,
        fuelConsumption: 0.03 + (level - 1) * 0.005
    };
    
    // حدود قصوى
    baseSettings.asteroidChance = Math.min(baseSettings.asteroidChance, 0.05);
    baseSettings.starChance = Math.max(baseSettings.starChance, 0.005);
    baseSettings.asteroidSpeed = Math.min(baseSettings.asteroidSpeed, 4);
    baseSettings.fuelConsumption = Math.min(baseSettings.fuelConsumption, 0.1);
    
    return baseSettings;
}

// عناصر اللعبة
const spaceship = {
    x: 400 - 25,
    y: 500,
    width: 50,
    height: 50,
    speed: 5,
    color: '#3498db',
    movingLeft: false,
    movingRight: false,
    movingUp: false,
    movingDown: false
};

// أحداث لوحة المفاتيح
window.addEventListener('keydown', (e) => {
    if (!gameRunning && e.key !== ' ') return;
    
    switch(e.key) {
        case 'ArrowLeft':
            if (!gamePaused) spaceship.movingLeft = true;
            break;
        case 'ArrowRight':
            if (!gamePaused) spaceship.movingRight = true;
            break;
        case 'ArrowUp':
            if (!gamePaused) spaceship.movingUp = true;
            break;
        case 'ArrowDown':
            if (!gamePaused) spaceship.movingDown = true;
            break;
        case ' ':
            e.preventDefault();
            if (!gamePaused) {
                if (rapidFire) {
                    // إطلاق سريع - 3 طلقات في الثانية
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => shootBullet(), i * 100);
                    }
                } else {
                    shootBullet();
                }
            }
            break;
        case 'p':
        case 'P':
            e.preventDefault();
            togglePause();
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            spaceship.movingLeft = false;
            break;
        case 'ArrowRight':
            spaceship.movingRight = false;
            break;
        case 'ArrowUp':
            spaceship.movingUp = false;
            break;
        case 'ArrowDown':
            spaceship.movingDown = false;
            break;
    }
});

// بدء اللعبة - مع معالجة الأخطاء
try {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    quitBtn.addEventListener('click', quitGame);
    victoryRestartBtn.addEventListener('click', startGame);
    victoryMenuBtn.addEventListener('click', backToMenu);
    defeatRestartBtn.addEventListener('click', startGame);
    defeatMenuBtn.addEventListener('click', backToMenu);
    statsBtn.addEventListener('click', showStats);
    achievementsBtn.addEventListener('click', showAchievements);
    statsBackBtn.addEventListener('click', backToMenu);
    achievementsBackBtn.addEventListener('click', backToMenu);
    shareBtn.addEventListener('click', shareScore);
} catch (error) {
    console.error('خطأ في إعداد الأحداث:', error);
}

// تحكم باللمس المباشر
let touchOverlay, mobileUI, pauseBtn;
let isTouching = false;
let touchStartTime = 0;

window.addEventListener('DOMContentLoaded', function() {
    try {
        touchOverlay = document.getElementById('touch-overlay');
        mobileUI = document.getElementById('mobile-ui');
        pauseBtn = document.getElementById('pause-btn');
        
        setupTouchControls();
    } catch (error) {
        console.error('خطأ في إعداد اللعبة:', error);
    }
});

function setupTouchControls() {
    if (touchOverlay) {
        touchOverlay.addEventListener('touchstart', handleTouchStart, {passive: false});
        touchOverlay.addEventListener('touchmove', handleTouchMove, {passive: false});
        touchOverlay.addEventListener('touchend', handleTouchEnd, {passive: false});
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            togglePause();
        });
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    if (gamePaused || !gameRunning) return;
    
    isTouching = true;
    touchStartTime = Date.now();
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    moveSpaceshipToTouch(touchX, touchY);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isTouching || gamePaused || !gameRunning) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    moveSpaceshipToTouch(touchX, touchY);
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!isTouching) return;
    
    const touchDuration = Date.now() - touchStartTime;
    
    if (touchDuration < 200 && !gamePaused && gameRunning) {
        shootBullet();
    }
    
    isTouching = false;
    spaceship.movingLeft = false;
    spaceship.movingRight = false;
    spaceship.movingUp = false;
    spaceship.movingDown = false;
}

function moveSpaceshipToTouch(touchX, touchY) {
    const canvasScale = canvas.width / canvas.offsetWidth;
    const scaledX = touchX * canvasScale;
    const scaledY = touchY * canvasScale;
    
    const spaceshipCenterX = spaceship.x + spaceship.width / 2;
    const spaceshipCenterY = spaceship.y + spaceship.height / 2;
    
    const deltaX = scaledX - spaceshipCenterX;
    const deltaY = scaledY - spaceshipCenterY;
    
    const threshold = 20;
    
    if (Math.abs(deltaX) > threshold) {
        spaceship.movingLeft = deltaX < 0;
        spaceship.movingRight = deltaX > 0;
    } else {
        spaceship.movingLeft = false;
        spaceship.movingRight = false;
    }
    
    if (Math.abs(deltaY) > threshold) {
        spaceship.movingUp = deltaY < 0;
        spaceship.movingDown = deltaY > 0;
    } else {
        spaceship.movingUp = false;
        spaceship.movingDown = false;
    }
}

// تحميل الإحصائيات والإنجازات
loadStats();
loadAchievements();



function startGame() {

    
    gameRunning = true;
    gamePaused = false;
    score = 0;
    fuel = 100;
    lives = 3;
    shield = 0;
    level = 1;
    currentStage = 1;
    stageTransition = false;
    transitionTimer = 0;
    stageNameDisplay = true;
    stageNameTimer = 180; // 3 ثواني لعرض اسم المرحلة
    particles = [];
    thrustParticles = [];
    weaponUpgrades = [];
    specialEffects = [];
    fireRate = 1;
    bulletDamage = 1;
    multiShot = 1;
    rapidFire = false;
    rapidFireTimer = 0;
    asteroids = [];
    stars = [];
    explosions = [];
    powerUps = [];
    bullets = [];
    planets = [];
    enemyShips = [];
    enemyBullets = [];
    missiles = [];
    laserBeams = [];
    fuelStations = [];
    rescueTargets = [];
    bosses = [];
    

    
    // إخفاء عرض الكومبو
    comboDisplay.style.display = 'none';
    
    // إنشاء النجوم في الخلفية
    createBackgroundStars();
    
    // تشغيل الموسيقى الخلفية
    if (!muted) {
        sounds.background.play().catch(() => {});
    }
    
    hideAllScreens();
    gameScreen.style.display = 'block';
    
    // إظهار واجهة الموبايل
    if (window.innerWidth <= 1024 && touchOverlay && mobileUI) {
        touchOverlay.style.display = 'block';
        mobileUI.style.display = 'flex';
    }
    

    
    updateUI();
    
    // تحديث إحصائيات بدء اللعبة
    gameStats.gamesPlayed++;
    gameStats.startTime = Date.now();
    
    // بدء حلقة اللعبة
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (!gamePaused) {
        update(deltaTime);
    }
    render();
    
    requestAnimationFrame(gameLoop);
}

function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseScreen.style.display = gamePaused ? 'flex' : 'none';
}

function update(deltaTime) {
    try {
    // تحريك المركبة الفضائية
    const currentSpeed = window.innerWidth <= 768 ? 8 : spaceship.speed;
    
    if (spaceship.movingLeft && spaceship.x > 0) {
        spaceship.x -= currentSpeed;
    }
    if (spaceship.movingRight && spaceship.x < canvas.width - spaceship.width) {
        spaceship.x += currentSpeed;
    }
    if (spaceship.movingUp && spaceship.y > 0) {
        spaceship.y -= currentSpeed;
    }
    if (spaceship.movingDown && spaceship.y < canvas.height - spaceship.height) {
        spaceship.y += currentSpeed;
    }
    
    // استهلاك الوقود
    if (spaceship.movingLeft || spaceship.movingRight || spaceship.movingUp || spaceship.movingDown) {
        const settings = getDifficultySettings(level);
        fuel -= settings.fuelConsumption;
        
        if (fuel <= 0) {
            loseLife();
            return;
        }
    }
    
    // تقليل الدرع تدريجياً
    if (shield > 0) {
        shield -= 0.1;
        if (shield < 0) shield = 0;
    }
    
    // توليد الكويكبات بشكل عشوائي (مع تأثير إبطاء الزمن)
    const settings = getDifficultySettings(level);
    const timeMultiplier = timeSlowEffect ? 0.3 : 1;
    if (Math.random() < settings.asteroidChance * timeMultiplier) {
        createAsteroid();
    }
    
    // توليد النجوم بشكل عشوائي
    if (Math.random() < settings.starChance) {
        createStar();
    }
    
    // توليد القوى الخاصة
    if (Math.random() < 0.003) {
        createPowerUp();
    }
    
    // توليد الكواكب
    if (Math.random() < 0.001 * level) {
        createPlanet();
    }
    
    // توليد الطائرات المعادية
    if (Math.random() < 0.002 * level && level >= 3) {
        createEnemyShip();
    }
    
    // توليد زعيم في نهاية كل 5 مراحل + زعماء عشوائيين
    if ((level % 5 === 0 && level > 0 && bosses.length === 0 && Math.random() < 0.02) || 
        (level > 20 && Math.random() < 0.005)) {
        createBoss();
    }
    
    // توليد عواصف فضائية
    if (Math.random() < 0.0008 * level) {
        createSpaceStorm();
    }
    
    // توليد أفخاخ فضائية
    if (Math.random() < 0.0005 && level > 10) {
        createSpaceTrap();
    }
    
    // توليد محطات وقود
    if (Math.random() < 0.001 && fuelStations.length === 0) {
        createFuelStation();
    }
    
    // تحديث عداد الكومبو
    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer <= 0) {
            resetCombo();
        }
    }
    
    // تحديث اهتزاز الكاميرا
    if (cameraShake > 0) {
        cameraShake--;
    }
    
    // تحريك الكويكبات والتحقق من التصادم
    for (let i = asteroids.length - 1; i >= 0; i--) {
        asteroids[i].y += asteroids[i].speed;
        
        // التحقق من التصادم مع المركبة
        if (checkCollision(spaceship, asteroids[i])) {
            createExplosion(asteroids[i].x, asteroids[i].y);
            sounds.explosion.currentTime = 0;
            sounds.explosion.play().catch(() => {});
            asteroids.splice(i, 1);
            
            if (shield > 0) {
                shield -= 30;
                if (shield < 0) shield = 0;
            } else {
                fuel -= 20;
                if (fuel <= 0) {
                    loseLife();
                    return;
                }
            }
            continue;
        }
        
        // إزالة الكويكبات التي تخرج من الشاشة
        if (asteroids[i].y > canvas.height) {
            asteroids.splice(i, 1);
            score += 1;
            scoreElement.textContent = score;
        }
    }
    
    // تحريك النجوم والتحقق من الجمع
    for (let i = stars.length - 1; i >= 0; i--) {
        stars[i].y += stars[i].speed;
        
        // التحقق من جمع النجوم
        if (checkCollision(spaceship, stars[i])) {
            stars.splice(i, 1);
            score += 10 * level;
            gameStats.starsCollected++;
            fuel = Math.min(100, fuel + 15);
            if (!muted) {
                sounds.collect.currentTime = 0;
                sounds.collect.play().catch(() => {});
            }
            
            // زيادة المستوى كل 1500 نقطة (مراحل أطول وأكثر إثارة)
            if (score >= level * 1500) {
                level++;
                if (level > WIN_LEVEL) {
                    victory();
                    return;
                }
                // تغيير المرحلة عند زيادة المستوى
                if (level <= WIN_LEVEL && level !== currentStage) {
                    currentStage = level;
                    startStageTransition();
                }
            }
            
            continue;
        }
        
        // إزالة النجوم التي تخرج من الشاشة
        if (stars[i].y > canvas.height) {
            stars.splice(i, 1);
        }
    }
    
    // تحديث الانفجارات
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].radius += 1;
        explosions[i].alpha -= 0.02;
        
        if (explosions[i].alpha <= 0) {
            explosions.splice(i, 1);
        }
    }
    
    // تحديث القوى الخاصة
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].y += powerUps[i].speed;
        
        // التحقق من جمع القوى الخاصة
        if (checkCollision(spaceship, powerUps[i])) {
            applyPowerUp(powerUps[i].type);
            if (!muted) {
                sounds.collect.currentTime = 0;
                sounds.collect.play().catch(() => {});
            }
            powerUps.splice(i, 1);
            continue;
        }
        
        // إزالة القوى الخاصة التي تخرج من الشاشة
        if (powerUps[i].y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }
    
    // تحديث الطلقات
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        
        // إزالة الطلقات التي تخرج من الشاشة
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            continue;
        }
        
        // التحقق من إصابة الكويكبات
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], asteroids[j])) {
                createExplosion(asteroids[j].x, asteroids[j].y);
                sounds.explosion.currentTime = 0;
                sounds.explosion.play().catch(() => {});
                score += Math.floor(20 * level * (bullets[i].damage || 1) * (1 + combo * 0.1));
                gameStats.enemiesKilled++;
                updateCombo();
                
                if (gameStats.enemiesKilled === 1 && !achievements.firstKill.unlocked) {
                    unlockAchievement('firstKill');
                }
                
                if (!bullets[i].mega) {
                    bullets.splice(i, 1);
                }
                asteroids.splice(j, 1);
                break;
            }
        }
        
        // التحقق من إصابة الطائرات المعادية
        for (let j = enemyShips.length - 1; j >= 0; j--) {
            if (enemyShips[j] && bullets[i] && checkCollision(bullets[i], enemyShips[j])) {
                createExplosion(enemyShips[j].x, enemyShips[j].y);
                sounds.explosion.currentTime = 0;
                sounds.explosion.play().catch(() => {});
                score += Math.floor(50 * level * (bullets[i].damage || 1) * (1 + combo * 0.1));
                gameStats.enemiesKilled++;
                updateCombo();
                
                if (!bullets[i].mega) {
                    bullets.splice(i, 1);
                }
                enemyShips.splice(j, 1);
                break;
            }
        }
    }
    
    // تحديث الكواكب
    for (let i = planets.length - 1; i >= 0; i--) {
        planets[i].y += planets[i].speed;
        
        // التحقق من التصادم مع الطائرة
        if (checkCollision(spaceship, planets[i])) {
            createExplosion(spaceship.x + spaceship.width/2, spaceship.y + spaceship.height/2);
            sounds.explosion.currentTime = 0;
            sounds.explosion.play().catch(() => {});
            loseLife();
            return;
        }
        
        // إزالة الكواكب التي تخرج من الشاشة
        if (planets[i].y > canvas.height + planets[i].radius) {
            planets.splice(i, 1);
        }
    }
    
    // تحديث الطائرات المعادية
    for (let i = enemyShips.length - 1; i >= 0; i--) {
        if (!enemyShips[i]) continue; // حماية من القيم الفارغة
        
        enemyShips[i].y += enemyShips[i].speed;
        
        // إطلاق النار من الطائرات المعادية
        if (Math.random() < 0.02) {
            createEnemyBullet(enemyShips[i]);
        }
        
        // التحقق من التصادم مع الطائرة
        if (checkCollision(spaceship, enemyShips[i])) {
            createExplosion(enemyShips[i].x, enemyShips[i].y);
            sounds.explosion.currentTime = 0;
            sounds.explosion.play().catch(() => {});
            enemyShips.splice(i, 1);
            
            if (shield > 0) {
                shield -= 40;
                if (shield < 0) shield = 0;
            } else {
                fuel -= 30;
                if (fuel <= 0) {
                    loseLife();
                    return;
                }
            }
            continue;
        }
        
        // إزالة الطائرات التي تخرج من الشاشة
        if (enemyShips[i] && enemyShips[i].y > canvas.height) {
            enemyShips.splice(i, 1);
        }
    }
    
    // تحديث طلقات العدو
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        if (!enemyBullets[i]) continue; // حماية من القيم الفارغة
        
        enemyBullets[i].y += enemyBullets[i].speed;
        
        // التحقق من إصابة الطائرة
        if (checkCollision(spaceship, enemyBullets[i])) {
            enemyBullets.splice(i, 1);
            
            if (shield > 0) {
                shield -= 20;
                if (shield < 0) shield = 0;
            } else {
                fuel -= 15;
                if (fuel <= 0) {
                    loseLife();
                    return;
                }
            }
            continue;
        }
        
        // إزالة الطلقات التي تخرج من الشاشة
        if (enemyBullets[i] && enemyBullets[i].y > canvas.height) {
            enemyBullets.splice(i, 1);
        }
    }
    
    updateParticles();
    updateWeaponEffects();
    updateBosses();
    updateMissiles();
    updateFuelStations();
    updateSpaceStorms();
    updateSpaceTraps();
    updateTimeSlowEffect();
    updateStageTransition();
    updateGameStats();
    updateUI();
    
    } catch (error) {
        console.error('خطأ في تحديث اللعبة:', error);
        // منع توقف اللعبة بسبب الأخطاء
    }
}

function drawSpecialEffects() {
    specialEffects.forEach(effect => {
        const alpha = effect.life / effect.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = effect.color;
        ctx.font = `bold ${effect.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 10;
        ctx.fillText(effect.text, effect.x, effect.y);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'start';
    });
    ctx.globalAlpha = 1.0;
}

function drawWeaponIndicators() {
    let y = canvas.height - 100;
    
    // مؤشر الإطلاق السريع
    if (rapidFire) {
        ctx.fillStyle = '#ff0';
        ctx.fillRect(canvas.width - 120, y, rapidFireTimer / 3, 8);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(canvas.width - 120, y, 100, 8);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText('إطلاق سريع', canvas.width - 120, y - 5);
        y -= 25;
    }
    
    // مؤشر الطلقات المتعددة
    if (multiShot > 1) {
        ctx.fillStyle = '#f80';
        ctx.font = '14px Arial';
        ctx.fillText(`طلقات x${multiShot}`, canvas.width - 120, y);
        y -= 20;
    }
    
    // مؤشر قوة الضرر
    if (bulletDamage > 1) {
        ctx.fillStyle = '#f00';
        ctx.font = '14px Arial';
        ctx.fillText(`قوة x${bulletDamage.toFixed(1)}`, canvas.width - 120, y);
        y -= 20;
    }
    
    // مؤشر الوضع المحسن
    if (superMode) {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(canvas.width - 120, y, superModeTimer / 6, 8);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(canvas.width - 120, y, 100, 8);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText('وضع القوة الفائقة', canvas.width - 120, y - 5);
    }
}

// دالة رسم النجمة
function drawStar(ctx, x, y, radius, color) {
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius * 0.4;
    
    ctx.save();
    ctx.translate(x, y);
    
    // تأثير بريق
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    
    // تدرج لوني
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, color);
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.restore();
}

// دالة رسم النيزك (الكويكب)
function drawAsteroid(ctx, x, y, radius, color) {
    ctx.save();
    ctx.translate(x, y);
    
    // شكل غير منتظم للنيزك
    const points = 8;
    const irregularity = 0.3;
    
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const variation = 1 + (Math.sin(angle * 3) * irregularity);
        const r = radius * variation;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    
    // تدرج لوني للنيزك
    const gradient = ctx.createRadialGradient(-radius/3, -radius/3, 0, 0, 0, radius);
    gradient.addColorStop(0, '#888888');
    gradient.addColorStop(0.4, color);
    gradient.addColorStop(0.8, '#333333');
    gradient.addColorStop(1, '#111111');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // فوهات على سطح النيزك
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    for (let i = 0; i < 3; i++) {
        const craterX = (Math.random() - 0.5) * radius;
        const craterY = (Math.random() - 0.5) * radius;
        const craterSize = radius * (0.1 + Math.random() * 0.2);
        
        ctx.beginPath();
        ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // حدود مضيئة
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
}

function render() {
    // مسح الشاشة بلون المرحلة
    const stage = getStage(currentStage);
    ctx.fillStyle = stage.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    

    
    // رسم خلفية النجوم
    drawStarsBackground();
    
    // رسم الطائرة مع تأثير الدرع
    if (shield > 0) {
        ctx.fillStyle = `rgba(0, 255, 255, ${shield / 100})`;
        ctx.beginPath();
        ctx.arc(spaceship.x + spaceship.width/2, spaceship.y + spaceship.height/2, spaceship.width, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawSpaceship();
    
    // رسم الكويكبات (النيازك) بشكل واقعي
    asteroids.forEach(asteroid => {
        drawAsteroid(ctx, asteroid.x, asteroid.y, asteroid.radius, stage.asteroidColor);
    });
    
    // رسم النجوم بشكل نجمة
    ctx.fillStyle = stage.starColor;
    stars.forEach(star => {
        drawStar(ctx, star.x, star.y, star.radius, stage.starColor);
    });
    
    // رسم القوى الخاصة مع تأثير نبض
    powerUps.forEach(powerUp => {
        const pulseSize = Math.sin(powerUp.pulse) * 3;
        ctx.fillStyle = powerUp.color;
        ctx.shadowColor = powerUp.color;
        ctx.shadowBlur = 10 + pulseSize;
        ctx.fillRect(powerUp.x - pulseSize/2, powerUp.y - pulseSize/2, 
                    powerUp.width + pulseSize, powerUp.height + pulseSize);
        ctx.shadowBlur = 0;
        
        // رمز القوة
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        const symbols = { shield: '⛨', fuel: '⛽', life: '♥', 
                         rapidfire: '⚡', multishot: '⚙', damage: '💥', megashot: '⭐', 
                         supermode: '🚀', timeslow: '⏱️', wormhole: '🌀' };
        ctx.fillText(symbols[powerUp.type] || '?', 
                    powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2 + 4);
        ctx.textAlign = 'start';
    });
    
    // رسم الطلقات مع تأثير مضيء
    bullets.forEach(bullet => {
        if (bullet.mega) {
            // طلقة عملاقة
            const gradient = ctx.createRadialGradient(bullet.x + bullet.width/2, bullet.y + bullet.height/2, 0,
                                                    bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.5, '#8000ff');
            gradient.addColorStop(1, '#4000ff');
            ctx.fillStyle = gradient;
            ctx.shadowColor = '#8000ff';
            ctx.shadowBlur = 15;
        } else if (bullet.super) {
            // طلقة محسنة
            const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bullet.height);
            gradient.addColorStop(0, '#ff00ff');
            gradient.addColorStop(0.5, '#ff80ff');
            gradient.addColorStop(1, '#8000ff');
            ctx.fillStyle = gradient;
            ctx.shadowColor = '#ff00ff';
            ctx.shadowBlur = 10;
        } else {
            // طلقة عادية
            const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bullet.height);
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(0.5, '#ffa500');
            gradient.addColorStop(1, '#ff6b35');
            ctx.fillStyle = gradient;
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 5;
        }
        
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
    });
    
    // رسم الكواكب
    planets.forEach(planet => {
        drawPlanet(planet);
    });
    
    // رسم الطائرات المعادية
    enemyShips.forEach(enemy => {
        if (enemy) {
            drawEnemyShip(enemy);
        }
    });
    
    // رسم طلقات العدو مع تأثير مضيء
    enemyBullets.forEach(bullet => {
        const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bullet.height);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.5, '#ff4757');
        gradient.addColorStop(1, '#c44569');
        ctx.fillStyle = gradient;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // تأثير مضيء
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 3;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
    });
    
    // رسم الانفجارات
    explosions.forEach(explosion => {
        ctx.fillStyle = `rgba(255, 100, 0, ${explosion.alpha})`;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // رسم الجسيمات
    drawParticles();
    
    // رسم الزعماء
    bosses.forEach(boss => drawBoss(boss));
    
    // رسم الصواريخ
    missiles.forEach(missile => drawMissile(missile));
    
    // رسم محطات الوقود
    fuelStations.forEach(station => {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(station.x, station.y, station.width, station.height);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⛽', station.x + station.width/2, station.y + station.height/2 + 4);
        ctx.textAlign = 'start';
    });
    
    // رسم انتقال المرحلة
    drawStageTransition();
    
    // عرض اسم المرحلة
    drawStageNameDisplay();
    
    // رسم التأثيرات الخاصة
    drawSpecialEffects();
    
    // رسم العواصف والأفخاخ
    drawSpaceStorms();
    drawSpaceTraps();
    
    // رسم مؤشرات الأسلحة
    drawWeaponIndicators();
    
    // تأثير إبطاء الزمن
    if (timeSlowEffect) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('إبطاء الزمن مفعل', canvas.width/2, 50);
        ctx.textAlign = 'start';
    }
}

function createAsteroid() {
    const radius = Math.random() * 20 + 10;
    const settings = getDifficultySettings(level);
    const asteroid = {
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: -radius,
        radius: radius,
        speed: Math.random() * 2 + settings.asteroidSpeed
    };
    asteroids.push(asteroid);
}

function createStar() {
    const radius = Math.random() * 5 + 5;
    const star = {
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: -radius,
        radius: radius,
        speed: Math.random() * 2 + 1
    };
    stars.push(star);
}

function createExplosion(x, y) {
    explosions.push({
        x: x,
        y: y,
        radius: 5,
        alpha: 1
    });
    
    // إضافة جسيمات الانفجار
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30,
            maxLife: 30,
            color: ['#ff6b35', '#f7931e', '#ffd23f', '#ff4757'][Math.floor(Math.random() * 4)]
        });
    }
}

function checkCollision(obj1, obj2) {
    // إذا كان الكائن الأول مستطيل (طائرة أو طلقة) والثاني دائري
    if (obj1.width && obj1.height && obj2.radius) {
        return (
            obj1.x < obj2.x + obj2.radius &&
            obj1.x + obj1.width > obj2.x - obj2.radius &&
            obj1.y < obj2.y + obj2.radius &&
            obj1.y + obj1.height > obj2.y - obj2.radius
        );
    }
    // إذا كان الكائنان مستطيلين (طائرة وقوة خاصة)
    else if (obj1.width && obj1.height && obj2.width && obj2.height) {
        return (
            obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y
        );
    }
    // للكائنات الدائرية
    else if (obj1.radius && obj2.radius) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < obj1.radius + obj2.radius;
    }
    return false;
}

function createBackgroundStars() {
    backgroundStars = [];
    for (let i = 0; i < 100; i++) {
        backgroundStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            speed: Math.random() * 0.5 + 0.1
        });
    }
}

function drawStarsBackground() {
    const stage = getStage(currentStage);
    
    // استخدام لون النجوم الخاص بالمرحلة
    ctx.fillStyle = stage.starColor;
    backgroundStars.forEach(star => {
        ctx.globalAlpha = 0.6;
        ctx.fillRect(star.x, star.y, star.size, star.size);
        ctx.globalAlpha = 1.0;
        
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = -star.size;
            star.x = Math.random() * canvas.width;
        }
    });
}

function createPowerUp() {
    const types = ['shield', 'fuel', 'life', 'rapidfire', 'multishot', 'damage', 'megashot', 'supermode', 'timeslow', 'wormhole'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = { 
        shield: '#0ff', fuel: '#0f0', life: '#f0f', 
        rapidfire: '#ff0', multishot: '#f80', damage: '#f00', megashot: '#80f', 
        supermode: '#ff00ff', timeslow: '#00ffff', wormhole: '#8000ff'
    };
    
    const powerUp = {
        x: Math.random() * (canvas.width - 20),
        y: -20,
        width: 20,
        height: 20,
        speed: 2,
        type: type,
        color: colors[type],
        pulse: 0
    };
    powerUps.push(powerUp);
}

function applyPowerUp(type) {
    switch(type) {
        case 'shield':
            shield = Math.min(100, shield + 50);
            break;
        case 'fuel':
            fuel = Math.min(100, fuel + 30);
            break;
        case 'life':
            lives = Math.min(5, lives + 1);
            break;
        case 'rapidfire':
            rapidFire = true;
            rapidFireTimer = 300; // 5 ثواني
            createSpecialEffect('إطلاق سريع!', '#ff0');
            break;
        case 'multishot':
            multiShot = Math.min(5, multiShot + 1);
            createSpecialEffect(`طلقات متعددة x${multiShot}!`, '#f80');
            break;
        case 'damage':
            bulletDamage += 0.5;
            createSpecialEffect('قوة نار مضاعفة!', '#f00');
            break;
        case 'megashot':
            createMegaShot();
            createSpecialEffect('طلقة عملاقة!', '#80f');
            break;
        case 'supermode':
            superMode = true;
            superModeTimer = 600;
            createSpecialEffect('وضع القوة الفائقة!', '#ff00ff');
            break;
        case 'timeslow':
            timeSlowEffect = true;
            timeSlowTimer = 300;
            createSpecialEffect('إبطاء الزمن!', '#00ffff');
            break;
        case 'wormhole':
            createWormhole();
            createSpecialEffect('ثقب دودي!', '#8000ff');
            break;
    }
}

function loseLife() {
    lives--;
    if (lives <= 0) {
        defeat();
    } else {
        fuel = 100;
        shield = 0;
    }
}

function drawSpaceship() {
    const x = spaceship.x;
    const y = spaceship.y;
    const w = spaceship.width;
    const h = spaceship.height;
    
    // تأثيرات الدفع عند الحركة
    if (spaceship.movingLeft || spaceship.movingRight || spaceship.movingUp || spaceship.movingDown) {
        createThrustParticles();
    }
    
    // تأثير الوضع المحسن
    if (superMode) {
        // هالة مضيئة حول الطائرة
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 5, y - 5, w + 10, h + 10);
        ctx.shadowBlur = 0;
    }
    
    // رسم جسم الطائرة بتدرج لوني
    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    if (superMode) {
        gradient.addColorStop(0, '#ff00ff');
        gradient.addColorStop(0.5, '#8000ff');
        gradient.addColorStop(1, '#4000ff');
    } else {
        gradient.addColorStop(0, '#5dade2');
        gradient.addColorStop(0.5, '#3498db');
        gradient.addColorStop(1, '#2980b9');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(x + w/4, y + h/2, w/2, h/2);
    
    // مقدمة الطائرة مع تأثير معدني
    const noseGradient = ctx.createLinearGradient(x + w/2, y, x + w/2, y + h/2);
    if (superMode) {
        noseGradient.addColorStop(0, '#ff80ff');
        noseGradient.addColorStop(1, '#ff00ff');
    } else {
        noseGradient.addColorStop(0, '#85c1e9');
        noseGradient.addColorStop(1, '#3498db');
    }
    ctx.fillStyle = noseGradient;
    ctx.beginPath();
    ctx.moveTo(x + w/2, y);
    ctx.lineTo(x + w/4, y + h/2);
    ctx.lineTo(x + 3*w/4, y + h/2);
    ctx.closePath();
    ctx.fill();
    
    // الأجنحة مع تأثير معدني
    ctx.fillStyle = '#2471a3';
    ctx.fillRect(x, y + 2*h/3, w/3, h/4);
    ctx.fillRect(x + 2*w/3, y + 2*h/3, w/3, h/4);
    
    // حدود مضيئة للأجنحة
    ctx.strokeStyle = '#85c1e9';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y + 2*h/3, w/3, h/4);
    ctx.strokeRect(x + 2*w/3, y + 2*h/3, w/3, h/4);
    
    // محركات الطائرة مع تأثير نار
    const engineGradient = ctx.createRadialGradient(x + w/2, y + h, 0, x + w/2, y + h, 10);
    engineGradient.addColorStop(0, '#ff6b6b');
    engineGradient.addColorStop(0.5, '#ee5a24');
    engineGradient.addColorStop(1, '#e74c3c');
    ctx.fillStyle = engineGradient;
    ctx.fillRect(x + w/3, y + h - 5, w/6, 8);
    ctx.fillRect(x + w/2, y + h - 5, w/6, 8);
    
    // نوافذ الطائرة
    ctx.fillStyle = '#f8c471';
    ctx.fillRect(x + w/2 - 2, y + h/4, 4, h/8);
    ctx.fillRect(x + w/4, y + 3*h/4, w/8, 3);
    ctx.fillRect(x + 5*w/8, y + 3*h/4, w/8, 3);
}

function shootBullet() {
    const centerX = spaceship.x + spaceship.width/2;
    const finalDamage = superMode ? bulletDamage * 3 : bulletDamage;
    const finalSpeed = superMode ? 12 : 8;
    
    if (multiShot === 1) {
        // طلقة واحدة
        bullets.push({
            x: centerX - 2,
            y: spaceship.y,
            width: superMode ? 6 : 4,
            height: superMode ? 15 : 10,
            speed: finalSpeed,
            damage: finalDamage,
            super: superMode
        });
    } else {
        // طلقات متعددة
        for (let i = 0; i < multiShot; i++) {
            const angle = (i - (multiShot-1)/2) * 0.3;
            bullets.push({
                x: centerX - 2 + i * 8 - (multiShot-1) * 4,
                y: spaceship.y,
                width: superMode ? 6 : 4,
                height: superMode ? 15 : 10,
                speed: finalSpeed,
                damage: finalDamage,
                angle: angle,
                super: superMode
            });
        }
    }
    
    // تشغيل صوت إطلاق النار
    if (!muted) {
        sounds.shoot.currentTime = 0;
        sounds.shoot.volume = sfxVolume;
        sounds.shoot.play().catch(() => {});
    }
}

function createPlanet() {
    const radius = Math.random() * 40 + 30;
    const planet = {
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: -radius,
        radius: radius,
        speed: Math.random() * 1 + 0.5,
        rotation: 0
    };
    planets.push(planet);
}

function drawPlanet(planet) {
    const stage = getStage(currentStage);
    
    ctx.save();
    ctx.translate(planet.x, planet.y);
    
    // الجسم الرئيسي للكوكب
    const gradient = ctx.createRadialGradient(-planet.radius/3, -planet.radius/3, 0, 0, 0, planet.radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, stage.planetColor);
    gradient.addColorStop(0.7, '#444444');
    gradient.addColorStop(1, '#000000');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // خطوط الكوكب (مثل المشتري)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const y = (i - 1) * planet.radius * 0.4;
        ctx.beginPath();
        ctx.ellipse(0, y, planet.radius * 0.8, planet.radius * 0.1, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // بقع على الكوكب
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(planet.radius * 0.3, planet.radius * 0.2, planet.radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(-planet.radius * 0.4, -planet.radius * 0.1, planet.radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // حلقات الكوكب (مثل زحل)
    if (planet.radius > 35) {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, planet.radius * 1.5, planet.radius * 0.3, planet.rotation, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, planet.radius * 1.3, planet.radius * 0.25, planet.rotation, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
    planet.rotation += 0.02;
}

function createEnemyShip() {
    const enemy = {
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 30,
        speed: Math.random() * 2 + 1,
        shootTimer: 0
    };
    enemyShips.push(enemy);
}

function drawEnemyShip(enemy) {
    const stage = getStage(currentStage);
    
    // تدرج لوني لجسم الطائرة
    const gradient = ctx.createLinearGradient(enemy.x, enemy.y, enemy.x, enemy.y + enemy.height);
    gradient.addColorStop(0, stage.enemyColor);
    gradient.addColorStop(0.5, '#8b0000');
    gradient.addColorStop(1, '#4a0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(enemy.x + enemy.width/4, enemy.y, enemy.width/2, enemy.height/2);
    
    // مقدمة الطائرة (مقلوبة)
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.width/2, enemy.y + enemy.height);
    ctx.lineTo(enemy.x + enemy.width/4, enemy.y + enemy.height/2);
    ctx.lineTo(enemy.x + 3*enemy.width/4, enemy.y + enemy.height/2);
    ctx.closePath();
    ctx.fill();
    
    // الأجنحة مع تأثير معدني
    const wingGradient = ctx.createLinearGradient(enemy.x, enemy.y, enemy.x + enemy.width, enemy.y);
    wingGradient.addColorStop(0, '#ff4757');
    wingGradient.addColorStop(1, '#c44569');
    ctx.fillStyle = wingGradient;
    ctx.fillRect(enemy.x, enemy.y + enemy.height/4, enemy.width/3, enemy.height/3);
    ctx.fillRect(enemy.x + 2*enemy.width/3, enemy.y + enemy.height/4, enemy.width/3, enemy.height/3);
    
    // محركات مضيئة
    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(enemy.x + enemy.width/3, enemy.y - 3, enemy.width/6, 6);
    ctx.fillRect(enemy.x + enemy.width/2, enemy.y - 3, enemy.width/6, 6);
    
    // عيون حمراء مضيئة
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width/3, enemy.y + enemy.height/3, 2, 0, Math.PI * 2);
    ctx.arc(enemy.x + 2*enemy.width/3, enemy.y + enemy.height/3, 2, 0, Math.PI * 2);
    ctx.fill();
}

function createEnemyBullet(enemy) {
    if (!enemy || typeof enemy.x === 'undefined') return; // حماية من القيم الفارغة
    
    const bullet = {
        x: enemy.x + enemy.width/2 - 2,
        y: enemy.y + enemy.height,
        width: 4,
        height: 8,
        speed: 4
    };
    enemyBullets.push(bullet);
}

function createThrustParticles() {
    for (let i = 0; i < 3; i++) {
        thrustParticles.push({
            x: spaceship.x + spaceship.width/2 + (Math.random() - 0.5) * 20,
            y: spaceship.y + spaceship.height,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 3 + 2,
            life: 20,
            maxLife: 20,
            color: Math.random() > 0.5 ? '#ff6b35' : '#ffa726'
        });
    }
}

function updateParticles() {
    // تحديث جسيمات الدفع
    for (let i = thrustParticles.length - 1; i >= 0; i--) {
        const p = thrustParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        if (p.life <= 0) {
            thrustParticles.splice(i, 1);
        }
    }
    
    // تحديث جسيمات الانفجار
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.vy += 0.1; // جاذبية
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    // رسم جسيمات الدفع
    thrustParticles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
    });
    
    // رسم جسيمات الانفجار
    particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2);
    });
    
    ctx.globalAlpha = 1.0;
}

function startStageTransition() {
    stageTransition = true;
    transitionTimer = 120; // 2 ثانية تقريباً
    stageNameDisplay = true;
    stageNameTimer = 180; // 3 ثواني
}

function updateStageTransition() {
    if (stageTransition) {
        transitionTimer--;
        if (transitionTimer <= 0) {
            stageTransition = false;
        }
    }
    
    if (stageNameDisplay) {
        stageNameTimer--;
        if (stageNameTimer <= 0) {
            stageNameDisplay = false;
        }
    }
}

function drawStageTransition() {
    if (stageTransition) {
        const stage = getStage(currentStage);
        
        // خلفية شفافة
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // نص المرحلة الجديدة
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('مرحلة ' + currentStage, canvas.width/2, canvas.height/2 - 40);
        
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = stage.starColor;
        ctx.fillText(stage.name, canvas.width/2, canvas.height/2 + 20);
        
        ctx.textAlign = 'start';
    }
}

function drawStageNameDisplay() {
    if (stageNameDisplay) {
        const stage = getStage(currentStage);
        const alpha = Math.min(1, stageNameTimer / 60); // تأثير الاختفاء
        
        // خلفية شفافة في وسط الشاشة
        const boxWidth = 500;
        const boxHeight = 120;
        const boxX = canvas.width/2 - boxWidth/2;
        const boxY = canvas.height/2 - boxHeight/2;
        
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // إطار مضيء مع تأثير بريق
        ctx.strokeStyle = stage.starColor;
        ctx.lineWidth = 3;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = stage.starColor;
        ctx.shadowBlur = 15;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // رقم المرحلة
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillText('مرحلة ' + currentStage, canvas.width/2, canvas.height/2 - 20);
        
        // اسم المرحلة
        ctx.fillStyle = stage.starColor;
        ctx.font = 'bold 32px Arial';
        ctx.shadowColor = stage.starColor;
        ctx.shadowBlur = 12;
        ctx.fillText(stage.name, canvas.width/2, canvas.height/2 + 20);
        
        // تأثير بريق إضافي
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        ctx.font = 'bold 32px Arial';
        ctx.fillText(stage.name, canvas.width/2, canvas.height/2 + 20);
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
        ctx.textAlign = 'start';
    }
}

function createSpecialEffect(text, color) {
    specialEffects.push({
        text: text,
        x: canvas.width/2,
        y: canvas.height/2,
        color: color,
        life: 120,
        maxLife: 120,
        size: 24
    });
}

function createMegaShot() {
    bullets.push({
        x: spaceship.x + spaceship.width/2 - 10,
        y: spaceship.y,
        width: 20,
        height: 40,
        speed: 12,
        damage: 10,
        mega: true
    });
}

function updateWeaponEffects() {
    // تحديث الإطلاق السريع
    if (rapidFire) {
        rapidFireTimer--;
        if (rapidFireTimer <= 0) {
            rapidFire = false;
        }
    }
    
    // تحديث الوضع المحسن
    if (superMode) {
        superModeTimer--;
        if (superModeTimer <= 0) {
            superMode = false;
        }
    }
    
    // تحديث إبطاء الزمن
    if (timeSlowEffect) {
        timeSlowTimer--;
        if (timeSlowTimer <= 0) {
            timeSlowEffect = false;
        }
    }
    
    // تحديث التأثيرات الخاصة
    for (let i = specialEffects.length - 1; i >= 0; i--) {
        specialEffects[i].life--;
        specialEffects[i].y -= 1;
        if (specialEffects[i].life <= 0) {
            specialEffects.splice(i, 1);
        }
    }
    
    // تحديث نبض القوى الخاصة
    powerUps.forEach(powerUp => {
        powerUp.pulse += 0.2;
    });
}

function updateUI() {
    scoreElement.textContent = score;
    fuelElement.textContent = Math.floor(fuel);
    livesElement.textContent = lives;
    shieldElement.textContent = Math.floor(shield);
    levelElement.textContent = level;
    highScoreElement.textContent = highScore;
}

function hideAllScreens() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    pauseScreen.style.display = 'none';
    victoryScreen.style.display = 'none';
    defeatScreen.style.display = 'none';
    statsScreen.style.display = 'none';
    achievementsScreen.style.display = 'none';
}

function stopGame() {
    gameRunning = false;
    gamePaused = false;
    
    // إيقاف الموسيقى الخلفية
    sounds.background.pause();
    sounds.background.currentTime = 0;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

function victory() {
    stopGame();
    victoryScoreElement.textContent = score;
    victoryLevelElement.textContent = level;
    hideAllScreens();
    victoryScreen.style.display = 'flex';
}

function defeat() {
    stopGame();
    
    // حفظ الإحصائيات
    saveStats();
    
    defeatScoreElement.textContent = score;
    defeatLevelElement.textContent = level;
    defeatCombo.textContent = maxCombo;
    hideAllScreens();
    defeatScreen.style.display = 'flex';
}

function gameOver() {
    stopGame();
    finalScoreElement.textContent = score;
    finalLevelElement.textContent = level;
    hideAllScreens();
    gameOverScreen.style.display = 'flex';
}

function quitGame() {
    if (gameRunning) {
        stopGame();
        backToMenu();
    }
}

function backToMenu() {
    hideAllScreens();
    startScreen.style.display = 'flex';
    
    // إخفاء شاشات الإحصائيات والإنجازات
    statsScreen.style.display = 'none';
    achievementsScreen.style.display = 'none';
    
    // إخفاء واجهة الموبايل
    if (touchOverlay) touchOverlay.style.display = 'none';
    if (mobileUI) mobileUI.style.display = 'none';
}

// نظام الكومبو
function updateCombo() {
    combo++;
    comboTimer = 180; // 3 ثواني
    maxCombo = Math.max(maxCombo, combo);
    
    if (combo >= 5) {
        comboDisplay.style.display = 'block';
        comboCount.textContent = combo;
    }
    
    // فحص إنجازات الكومبو
    if (combo >= 10 && !achievements.combo10.unlocked) {
        unlockAchievement('combo10');
    }
}

function resetCombo() {
    combo = 0;
    comboDisplay.style.display = 'none';
}

// نظام الإنجازات
function unlockAchievement(id) {
    if (!achievements[id] || achievements[id].unlocked) return;
    
    achievements[id].unlocked = true;
    saveAchievements();
    
    // عرض إشعار
    achievementNotification.textContent = `🏆 ${achievements[id].name}: ${achievements[id].desc}`;
    achievementNotification.style.display = 'block';
    
    setTimeout(() => {
        achievementNotification.style.display = 'none';
    }, 3000);
}

// حفظ وتحميل البيانات
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

// عرض الشاشات
function showStats() {
    hideAllScreens();
    updateStatsDisplay();
    statsScreen.style.display = 'flex';
}

function showAchievements() {
    hideAllScreens();
    updateAchievementsDisplay();
    achievementsScreen.style.display = 'flex';
}

function updateStatsDisplay() {
    document.getElementById('total-time').textContent = Math.floor(gameStats.totalPlayTime / 60);
    document.getElementById('enemies-killed').textContent = gameStats.enemiesKilled;
    document.getElementById('longest-survival').textContent = gameStats.longestSurvival;
    document.getElementById('best-combo').textContent = gameStats.bestCombo;
    document.getElementById('games-played').textContent = gameStats.gamesPlayed;
    document.getElementById('stars-collected').textContent = gameStats.starsCollected;
}

function updateAchievementsDisplay() {
    const grid = document.getElementById('achievements-grid');
    grid.innerHTML = '';
    
    Object.keys(achievements).forEach(key => {
        const achievement = achievements[key];
        const div = document.createElement('div');
        div.className = `achievement-item ${achievement.unlocked ? '' : 'locked'}`;
        div.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">${achievement.unlocked ? '🏆' : '🔒'}</div>
            <div style="font-weight: bold; margin-bottom: 5px;">${achievement.name}</div>
            <div style="font-size: 12px; opacity: 0.8;">${achievement.desc}</div>
        `;
        grid.appendChild(div);
    });
}

// مشاركة النتيجة
function shareScore() {
    const text = `🚀 حققت ${score} نقطة في لعبة المستكشف الفضائي! ووصلت للمستوى ${level} 🎆`;
    
    if (navigator.share) {
        navigator.share({
            title: 'المستكشف الفضائي',
            text: text
        });
    } else {
        // نسخ للحافظة
        navigator.clipboard.writeText(text).then(() => {
            alert('تم نسخ النتيجة للحافظة!');
        });
    }
}



// نظام الزعماء
function createBoss() {
    const boss = {
        x: canvas.width/2 - 50,
        y: -100,
        width: 100,
        height: 80,
        health: 20,
        maxHealth: 20,
        speed: 1,
        shootTimer: 0,
        type: 'boss'
    };
    bosses.push(boss);
    createSpecialEffect('زعيم المرحلة ظهر!', '#ff0000');
}

function drawBoss(boss) {
    const stage = getStage(currentStage);
    
    // جسم الزعيم
    const gradient = ctx.createLinearGradient(boss.x, boss.y, boss.x, boss.y + boss.height);
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(0.5, '#8b0000');
    gradient.addColorStop(1, '#4a0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
    
    // شريط الصحة
    const healthPercent = boss.health / boss.maxHealth;
    ctx.fillStyle = '#333';
    ctx.fillRect(boss.x, boss.y - 15, boss.width, 8);
    ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
    ctx.fillRect(boss.x, boss.y - 15, boss.width * healthPercent, 8);
    
    // عيون حمراء
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(boss.x + 25, boss.y + 20, 5, 0, Math.PI * 2);
    ctx.arc(boss.x + 75, boss.y + 20, 5, 0, Math.PI * 2);
    ctx.fill();
}

// صواريخ موجهة
function createMissile(x, y) {
    missiles.push({
        x: x,
        y: y,
        targetX: spaceship.x + spaceship.width/2,
        targetY: spaceship.y + spaceship.height/2,
        speed: 3,
        width: 8,
        height: 20
    });
}

function drawMissile(missile) {
    // حساب الاتجاه
    const dx = missile.targetX - missile.x;
    const dy = missile.targetY - missile.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
        missile.x += (dx / distance) * missile.speed;
        missile.y += (dy / distance) * missile.speed;
    }
    
    // رسم الصاروخ
    ctx.fillStyle = '#ff4500';
    ctx.fillRect(missile.x, missile.y, missile.width, missile.height);
    
    // لهب الصاروخ
    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(missile.x + 2, missile.y + missile.height, 4, 8);
}

function createFuelStation() {
    fuelStations.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 30,
        speed: 1
    });
}

function updateBosses() {
    for (let i = bosses.length - 1; i >= 0; i--) {
        const boss = bosses[i];
        boss.y += boss.speed;
        
        // إطلاق صواريخ
        boss.shootTimer++;
        if (boss.shootTimer > 60) {
            createMissile(boss.x + boss.width/2, boss.y + boss.height);
            boss.shootTimer = 0;
        }
        
        // فحص التصادم مع الطلقات
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (bullets[j] && checkCollision(bullets[j], boss)) {
                boss.health -= bullets[j].damage || 1;
                bullets.splice(j, 1);
                cameraShake = 10;
                
                if (boss.health <= 0) {
                    createExplosion(boss.x + boss.width/2, boss.y + boss.height/2);
                    score += 500 * level;
                    gameStats.enemiesKilled++;
                    updateCombo();
                    bosses.splice(i, 1);
                    
                    if (!achievements.bossKiller.unlocked) {
                        unlockAchievement('bossKiller');
                    }
                }
                break;
            }
        }
    }
}

function updateMissiles() {
    for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        
        // فحص التصادم مع الطائرة
        if (checkCollision(spaceship, missile)) {
            createExplosion(missile.x, missile.y);
            missiles.splice(i, 1);
            
            if (shield > 0) {
                shield -= 30;
            } else {
                fuel -= 25;
                if (fuel <= 0) {
                    loseLife();
                    return;
                }
            }
        }
        
        // إزالة الصواريخ الخارجة
        if (missile.y > canvas.height || missile.x < 0 || missile.x > canvas.width) {
            missiles.splice(i, 1);
        }
    }
}

function updateFuelStations() {
    for (let i = fuelStations.length - 1; i >= 0; i--) {
        const station = fuelStations[i];
        station.y += station.speed;
        
        // فحص التصادم مع الطائرة
        if (checkCollision(spaceship, station)) {
            fuel = Math.min(100, fuel + 50);
            createSpecialEffect('تعبئة وقود!', '#00ff00');
            fuelStations.splice(i, 1);
        }
        
        if (station.y > canvas.height) {
            fuelStations.splice(i, 1);
        }
    }
}

function updateGameStats() {
    if (gameStats.startTime > 0) {
        const currentTime = (Date.now() - gameStats.startTime) / 1000;
        gameStats.longestSurvival = Math.max(gameStats.longestSurvival, currentTime);
        gameStats.totalPlayTime = gameStats.totalPlayTime + (1/60); // 60 FPS
        gameStats.bestCombo = Math.max(gameStats.bestCombo, maxCombo);
        
        // فحص إنجازات
        if (currentTime >= 300 && !achievements.survivor.unlocked) {
            unlockAchievement('survivor');
        }
        
        if (level >= 10 && !achievements.level10.unlocked) {
            unlockAchievement('level10');
        }
        
        if (gameStats.starsCollected >= 100 && !achievements.starCollector.unlocked) {
            unlockAchievement('starCollector');
        }
    }
}

// ميزات جديدة للإثارة
function createSpaceStorm() {
    spaceStorms.push({
        x: Math.random() * canvas.width,
        y: -50,
        width: 100 + Math.random() * 100,
        height: 150,
        speed: 2,
        intensity: Math.random() * 0.5 + 0.3
    });
}

function createSpaceTrap() {
    spaceTraps.push({
        x: Math.random() * (canvas.width - 80),
        y: -80,
        radius: 40,
        speed: 1,
        pullForce: 0.5,
        active: true
    });
}

function createWormhole() {
    const exitX = Math.random() * (canvas.width - 100) + 50;
    const exitY = Math.random() * (canvas.height - 200) + 100;
    
    wormholes.push({
        x: spaceship.x,
        y: spaceship.y,
        exitX: exitX,
        exitY: exitY,
        radius: 30,
        life: 180
    });
    
    // نقل الطائرة فوراً
    spaceship.x = exitX;
    spaceship.y = exitY;
}

function updateSpaceStorms() {
    for (let i = spaceStorms.length - 1; i >= 0; i--) {
        const storm = spaceStorms[i];
        storm.y += storm.speed;
        
        // تأثير على الطائرة
        if (spaceship.x > storm.x && spaceship.x < storm.x + storm.width &&
            spaceship.y > storm.y && spaceship.y < storm.y + storm.height) {
            spaceship.x += (Math.random() - 0.5) * 4;
            spaceship.y += (Math.random() - 0.5) * 4;
            fuel -= 0.2;
        }
        
        if (storm.y > canvas.height) {
            spaceStorms.splice(i, 1);
        }
    }
}

function updateSpaceTraps() {
    for (let i = spaceTraps.length - 1; i >= 0; i--) {
        const trap = spaceTraps[i];
        trap.y += trap.speed;
        
        // جذب الطائرة
        const dx = trap.x - spaceship.x;
        const dy = trap.y - spaceship.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < trap.radius * 2) {
            spaceship.x += dx * trap.pullForce * 0.01;
            spaceship.y += dy * trap.pullForce * 0.01;
        }
        
        if (trap.y > canvas.height) {
            spaceTraps.splice(i, 1);
        }
    }
}

function updateTimeSlowEffect() {
    if (timeSlowEffect) {
        timeSlowTimer--;
        if (timeSlowTimer <= 0) {
            timeSlowEffect = false;
        }
    }
}

function drawSpaceStorms() {
    spaceStorms.forEach(storm => {
        ctx.fillStyle = `rgba(255, 255, 0, ${storm.intensity})`;
        ctx.fillRect(storm.x, storm.y, storm.width, storm.height);
        
        // تأثير برق
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(storm.x + Math.random() * storm.width, storm.y);
            ctx.lineTo(storm.x + Math.random() * storm.width, storm.y + storm.height);
            ctx.stroke();
        }
    });
}

function drawSpaceTraps() {
    spaceTraps.forEach(trap => {
        // دائرة الجذب
        ctx.strokeStyle = '#ff0080';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(trap.x, trap.y, trap.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // تأثير دوامي
        ctx.strokeStyle = '#ff0080';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (Date.now() * 0.01 + i * Math.PI / 4) % (Math.PI * 2);
            const x1 = trap.x + Math.cos(angle) * trap.radius * 0.5;
            const y1 = trap.y + Math.sin(angle) * trap.radius * 0.5;
            const x2 = trap.x + Math.cos(angle) * trap.radius;
            const y2 = trap.y + Math.sin(angle) * trap.radius;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    });
}

// تحديث الشاشة عند تغيير الحجم
window.addEventListener('resize', () => {
    adjustCanvasSize();
});

// منع النقر بالزر الأيمن والسحب
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());

// تحديث النقاط العالية في الواجهة
highScoreElement.textContent = highScore;

// بدء اللعبة عند الضغط على Enter
window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !gameRunning) {
        startGame();
    }
});

// تحسين الأداء - تنظيف المصفوفات الكبيرة
setInterval(() => {
    if (!gameRunning) return;
    
    // تنظيف الجسيمات الزائدة
    if (particles.length > 100) {
        particles.splice(0, particles.length - 100);
    }
    if (thrustParticles.length > 50) {
        thrustParticles.splice(0, thrustParticles.length - 50);
    }
}, 5000);

// إعداد التحكم في الصوت - مبسط
let muted = false;
let musicVolume = 0.3;
let sfxVolume = 0.5;

// إعداد أحداث الصوت عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const muteBtn = document.getElementById('mute-btn');
    const musicVolumeSlider = document.getElementById('music-volume');
    const sfxVolumeSlider = document.getElementById('sfx-volume');
    
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
    
    if (musicVolumeSlider) {
        musicVolumeSlider.addEventListener('input', function() {
            musicVolume = this.value / 100;
            sounds.background.volume = musicVolume;
        });
    }
    
    if (sfxVolumeSlider) {
        sfxVolumeSlider.addEventListener('input', function() {
            sfxVolume = this.value / 100;
            Object.keys(sounds).forEach(key => {
                if (key !== 'background') {
                    sounds[key].volume = sfxVolume;
                }
            });
        });
    }
});

console.log('🚀 المستكشف الفضائي - تم تحميل اللعبة بنجاح!');