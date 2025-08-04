// Particle System for the game
// Copyright © 2024 - جميع الحقوق محفوظة

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }

    createExplosion(x, y, color = '#ff6b35', count = 15) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30 + Math.random() * 20,
                maxLife: 30 + Math.random() * 20,
                color: color,
                size: 2 + Math.random() * 3,
                type: 'explosion'
            });
        }
    }

    createStarTrail(x, y) {
        if (this.particles.length >= this.maxParticles) return;
        
        this.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 2 + 1,
            life: 20,
            maxLife: 20,
            color: '#ffd700',
            size: 1 + Math.random() * 2,
            type: 'trail'
        });
    }

    createThrustParticles(x, y, count = 3) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 3 + 2,
                life: 15,
                maxLife: 15,
                color: Math.random() > 0.5 ? '#ff6b35' : '#ffa726',
                size: 2,
                type: 'thrust'
            });
        }
    }

    createPowerUpEffect(x, y, color) {
        for (let i = 0; i < 10; i++) {
            if (this.particles.length >= this.maxParticles) break;
            
            const angle = (i / 10) * Math.PI * 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                life: 25,
                maxLife: 25,
                color: color,
                size: 3,
                type: 'powerup'
            });
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // تحديث الموقع
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            // تطبيق الجاذبية على بعض الجسيمات
            if (p.type === 'explosion' || p.type === 'thrust') {
                p.vy += 0.1;
            }
            
            // إزالة الجسيمات المنتهية الصلاحية
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            
            if (p.type === 'powerup') {
                // تأثير بريق للقوى الخاصة
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
                ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
                ctx.shadowBlur = 0;
            } else {
                ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
            }
        });
        ctx.globalAlpha = 1.0;
    }

    clear() {
        this.particles = [];
    }

    getCount() {
        return this.particles.length;
    }
}

// إنشاء نظام الجسيمات العام
const particleSystem = new ParticleSystem();