// Performance Monitor and Optimizer
// Copyright © 2024 - جميع الحقوق محفوظة

class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fpsHistory = [];
        this.showFPS = false;
        
        this.startMonitoring();
    }

    startMonitoring() {
        setInterval(() => {
            this.calculateFPS();
            this.optimizePerformance();
        }, 1000);
    }

    calculateFPS() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.fps = Math.round(1000 / (deltaTime / this.frameCount));
        this.fpsHistory.push(this.fps);
        
        if (this.fpsHistory.length > 60) {
            this.fpsHistory.shift();
        }
        
        this.frameCount = 0;
        this.lastTime = currentTime;
    }

    frame() {
        this.frameCount++;
    }

    getAverageFPS() {
        if (this.fpsHistory.length === 0) return 60;
        return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    }

    optimizePerformance() {
        const avgFPS = this.getAverageFPS();
        
        // تقليل الجسيمات إذا كان الأداء ضعيف
        if (avgFPS < 30 && typeof particleSystem !== 'undefined') {
            particleSystem.maxParticles = Math.max(100, particleSystem.maxParticles - 50);
        } else if (avgFPS > 50 && typeof particleSystem !== 'undefined') {
            particleSystem.maxParticles = Math.min(500, particleSystem.maxParticles + 25);
        }
        
        // تحسين عدد الكويكبات
        if (typeof asteroids !== 'undefined' && avgFPS < 25) {
            if (asteroids.length > 20) {
                asteroids.splice(20);
            }
        }
    }

    renderFPS(ctx) {
        if (!this.showFPS) return;
        
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(`FPS: ${this.fps}`, 10, 30);
        ctx.fillText(`Avg: ${Math.round(this.getAverageFPS())}`, 10, 50);
    }

    toggleFPSDisplay() {
        this.showFPS = !this.showFPS;
        return this.showFPS;
    }
}

// Memory Management
class MemoryManager {
    static cleanup() {
        // تنظيف المصفوفات الكبيرة
        if (typeof particles !== 'undefined' && particles.length > 200) {
            particles.splice(0, particles.length - 200);
        }
        
        if (typeof thrustParticles !== 'undefined' && thrustParticles.length > 100) {
            thrustParticles.splice(0, thrustParticles.length - 100);
        }
        
        if (typeof explosions !== 'undefined' && explosions.length > 50) {
            explosions.splice(0, explosions.length - 50);
        }
        
        // تنظيف الذاكرة
        if (window.gc) {
            window.gc();
        }
    }

    static getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            };
        }
        return null;
    }
}

// إنشاء مراقب الأداء العام
const performanceMonitor = new PerformanceMonitor();

// تنظيف دوري للذاكرة
setInterval(() => {
    MemoryManager.cleanup();
}, 10000);