// Simple 2D Space Game - Working Version
// Copyright © 2024 - جميع الحقوق محفوظة

// DOM Elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.querySelector('.start-screen');
const gameScreen = document.querySelector('.game-screen');
const gameOverScreen = document.querySelector('.game-over');

// Canvas setup
canvas.width = 800;
canvas.height = 600;

// Game variables
let gameRunning = false;
let score = 0;
let fuel = 100;
let lives = 3;
let level = 1;
let highScore = localStorage.getItem('highScore') || 0;

// Game objects
let spaceship = { x: 375, y: 500, width: 50, height: 50, speed: 5 };
let bullets = [];
let asteroids = [];
let stars = [];
let keys = {};

// Audio setup with error handling
let sounds = {};
try {
    sounds = {
        shoot: new Audio('sounds/large-explosion-100420.mp3'),
        explosion: new Audio('sounds/explosion-42132.mp3'),
        collect: new Audio('sounds/aylex-i-can-fly.mp3'),
        background: new Audio('sounds/escp-neon-metaphor.mp3')
    };
    
    // Set volumes
    Object.values(sounds).forEach(sound => {
        sound.volume = 0.3;
        sound.onerror = () => console.log('Audio file not found');
    });
    
    sounds.background.loop = true;
    sounds.background.volume = 0.1;
} catch (e) {
    console.log('Audio not available');
    sounds = {
        shoot: { play: () => {}, currentTime: 0 },
        explosion: { play: () => {}, currentTime: 0 },
        collect: { play: () => {}, currentTime: 0 },
        background: { play: () => {}, pause: () => {}, currentTime: 0 }
    };
}

// Audio controls
let musicVolume = 0.3;
let sfxVolume = 0.5;
let muted = false;

function setupAudioControls() {
    const muteBtn = document.getElementById('mute-btn');
    const musicSlider = document.getElementById('music-volume');
    const sfxSlider = document.getElementById('sfx-volume');
    
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            muted = !muted;
            muteBtn.textContent = muted ? '🔇 الصوت' : '🔊 الصوت';
            muteBtn.classList.toggle('muted', muted);
            
            if (muted) {
                sounds.background.pause();
            } else {
                if (gameRunning) sounds.background.play().catch(() => {});
            }
        });
    }
    
    if (musicSlider) {
        musicSlider.addEventListener('input', (e) => {
            musicVolume = e.target.value / 100;
            sounds.background.volume = musicVolume;
        });
    }
    
    if (sfxSlider) {
        sfxSlider.addEventListener('input', (e) => {
            sfxVolume = e.target.value / 100;
            sounds.shoot.volume = sfxVolume;
            sounds.explosion.volume = sfxVolume;
            sounds.collect.volume = sfxVolume;
        });
    }
}

// Keyboard controls
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && gameRunning) {
        e.preventDefault();
        shootBullet();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Touch controls
let touchStartX = 0, touchStartY = 0;
let isTouching = false;

function setupTouchControls() {
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameRunning) return;
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        touchStartX = touch.clientX - rect.left;
        touchStartY = touch.clientY - rect.top;
        isTouching = true;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isTouching || !gameRunning) return;
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;
        
        const deltaX = (currentX - touchStartX) / rect.width;
        const deltaY = (currentY - touchStartY) / rect.height;
        
        spaceship.x = Math.max(0, Math.min(canvas.width - spaceship.width, spaceship.x + deltaX * 300));
        spaceship.y = Math.max(0, Math.min(canvas.height - spaceship.height, spaceship.y + deltaY * 300));
        
        touchStartX = currentX;
        touchStartY = currentY;
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (isTouching && gameRunning) {
            shootBullet();
        }
        isTouching = false;
    });
}

// Game functions
function shootBullet() {
    bullets.push({
        x: spaceship.x + spaceship.width / 2 - 2,
        y: spaceship.y,
        width: 4,
        height: 10,
        speed: 8
    });
    
    if (!muted) {
        sounds.shoot.currentTime = 0;
        sounds.shoot.play().catch(() => {});
    }
}

function createAsteroid() {
    asteroids.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: Math.random() * 3 + 2
    });
}

function createStar() {
    stars.push({
        x: Math.random() * (canvas.width - 20),
        y: -20,
        width: 20,
        height: 20,
        speed: Math.random() * 2 + 1
    });
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function update() {
    if (!gameRunning) return;
    
    // Move spaceship
    if (keys['ArrowLeft'] && spaceship.x > 0) spaceship.x -= spaceship.speed;
    if (keys['ArrowRight'] && spaceship.x < canvas.width - spaceship.width) spaceship.x += spaceship.speed;
    if (keys['ArrowUp'] && spaceship.y > 0) spaceship.y -= spaceship.speed;
    if (keys['ArrowDown'] && spaceship.y < canvas.height - spaceship.height) spaceship.y += spaceship.speed;
    
    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Check bullet-asteroid collision
        for (let j = asteroids.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], asteroids[j])) {
                bullets.splice(i, 1);
                asteroids.splice(j, 1);
                score += 100;
                if (!muted) {
                    sounds.explosion.currentTime = 0;
                    sounds.explosion.play().catch(() => {});
                }
                break;
            }
        }
    }
    
    // Update asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        asteroids[i].y += asteroids[i].speed;
        
        if (checkCollision(spaceship, asteroids[i])) {
            asteroids.splice(i, 1);
            lives--;
            if (!muted) {
                sounds.explosion.currentTime = 0;
                sounds.explosion.play().catch(() => {});
            }
            if (lives <= 0) {
                gameOver();
                return;
            }
            continue;
        }
        
        if (asteroids[i].y > canvas.height) {
            asteroids.splice(i, 1);
            score += 10;
        }
    }
    
    // Update stars
    for (let i = stars.length - 1; i >= 0; i--) {
        stars[i].y += stars[i].speed;
        
        if (checkCollision(spaceship, stars[i])) {
            stars.splice(i, 1);
            score += 50;
            fuel = Math.min(100, fuel + 10);
            if (!muted) {
                sounds.collect.currentTime = 0;
                sounds.collect.play().catch(() => {});
            }
            continue;
        }
        
        if (stars[i].y > canvas.height) {
            stars.splice(i, 1);
        }
    }
    
    // Spawn objects
    if (Math.random() < 0.02) createAsteroid();
    if (Math.random() < 0.01) createStar();
    
    // Consume fuel
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

function render() {
    // Clear canvas
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw spaceship
    ctx.fillStyle = '#3498db';
    ctx.fillRect(spaceship.x, spaceship.y, spaceship.width, spaceship.height);
    
    // Draw spaceship nose
    ctx.fillStyle = '#5dade2';
    ctx.beginPath();
    ctx.moveTo(spaceship.x + spaceship.width/2, spaceship.y);
    ctx.lineTo(spaceship.x + spaceship.width/4, spaceship.y + spaceship.height/2);
    ctx.lineTo(spaceship.x + 3*spaceship.width/4, spaceship.y + spaceship.height/2);
    ctx.closePath();
    ctx.fill();
    
    // Draw bullets
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // Draw asteroids
    ctx.fillStyle = '#8b4513';
    asteroids.forEach(asteroid => {
        ctx.fillRect(asteroid.x, asteroid.y, asteroid.width, asteroid.height);
    });
    
    // Draw stars
    ctx.fillStyle = '#ffd700';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.width, star.height);
    });
}

function gameLoop() {
    update();
    render();
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    gameRunning = true;
    score = 0;
    fuel = 100;
    lives = 3;
    level = 1;
    bullets = [];
    asteroids = [];
    stars = [];
    
    spaceship.x = 375;
    spaceship.y = 500;
    
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    gameOverScreen.style.display = 'none';
    
    if (!muted) {
        sounds.background.play().catch(() => {});
    }
    
    updateUI();
    gameLoop();
}

function gameOver() {
    gameRunning = false;
    sounds.background.pause();
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-level').textContent = level;
    gameOverScreen.style.display = 'flex';
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('fuel').textContent = Math.floor(fuel);
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
    document.getElementById('high-score').textContent = highScore;
}

function backToMenu() {
    gameRunning = false;
    sounds.background.pause();
    startScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    setupAudioControls();
    setupTouchControls();
    
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    document.getElementById('quit-btn').addEventListener('click', backToMenu);
    
    // Initialize high score display
    document.getElementById('high-score').textContent = highScore;
});

console.log('🚀 تم تحميل اللعبة بنجاح!');