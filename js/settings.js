// Game Settings Manager
// Copyright © 2024 - جميع الحقوق محفوظة

class GameSettings {
    constructor() {
        this.settings = {
            musicVolume: 0.3,
            sfxVolume: 0.5,
            muted: false,
            difficulty: 'medium',
            showFPS: false,
            particleEffects: true,
            screenShake: true,
            language: 'ar'
        };
        
        this.loadSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('gameSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('فشل تحميل الإعدادات:', e);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('gameSettings', JSON.stringify(this.settings));
            return true;
        } catch (e) {
            console.warn('فشل حفظ الإعدادات:', e);
            return false;
        }
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
    }

    applySettings() {
        // تطبيق إعدادات الصوت
        if (typeof audioManager !== 'undefined') {
            audioManager.setMusicVolume(this.settings.musicVolume);
            audioManager.setSFXVolume(this.settings.sfxVolume);
            if (this.settings.muted) {
                audioManager.toggleMute();
            }
        }

        // تطبيق إعدادات أخرى
        document.documentElement.lang = this.settings.language;
    }

    reset() {
        this.settings = {
            musicVolume: 0.3,
            sfxVolume: 0.5,
            muted: false,
            difficulty: 'medium',
            showFPS: false,
            particleEffects: true,
            screenShake: true,
            language: 'ar'
        };
        this.saveSettings();
        this.applySettings();
    }
}

// إنشاء مدير الإعدادات العام
const gameSettings = new GameSettings();