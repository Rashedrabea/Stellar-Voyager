// Audio Manager for the game
// Copyright © 2024 - جميع الحقوق محفوظة

class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.muted = false;
        this.loadSounds();
    }

    loadSounds() {
        const soundFiles = {
            explosion: 'sounds/explosion-42132.mp3',
            collect: 'sounds/aylex-i-can-fly.mp3',
            background: 'sounds/escp-neon-metaphor.mp3',
            shoot: 'sounds/large-explosion-100420.mp3',
            explosion2: 'sounds/11L-cinematic_explosion-85308154.mp3',
            impact: 'sounds/11L-cinematic_explosion_impact-46056105.mp3'
        };

        for (const [name, file] of Object.entries(soundFiles)) {
            this.sounds[name] = new Audio(file);
            this.sounds[name].volume = name === 'background' ? this.musicVolume : this.sfxVolume;
            
            // تحميل مسبق للأصوات
            this.sounds[name].preload = 'auto';
            
            // معالجة الأخطاء
            this.sounds[name].onerror = () => {
                console.warn(`فشل تحميل الصوت: ${file}`);
            };
        }

        // تكرار الموسيقى الخلفية
        this.sounds.background.loop = true;
    }

    play(soundName, volume = 1) {
        if (this.muted || !this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName];
            sound.currentTime = 0;
            sound.volume = (soundName === 'background' ? this.musicVolume : this.sfxVolume) * volume;
            sound.play().catch(e => console.warn('خطأ في تشغيل الصوت:', e));
        } catch (e) {
            console.warn('خطأ في تشغيل الصوت:', e);
        }
    }

    stop(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].pause();
            this.sounds[soundName].currentTime = 0;
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.sounds.background) {
            this.sounds.background.volume = this.musicVolume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        Object.keys(this.sounds).forEach(key => {
            if (key !== 'background') {
                this.sounds[key].volume = this.sfxVolume;
            }
        });
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stop('background');
        }
        return this.muted;
    }

    playRandomExplosion() {
        const explosions = ['explosion', 'explosion2', 'impact'];
        const randomExplosion = explosions[Math.floor(Math.random() * explosions.length)];
        this.play(randomExplosion);
    }
}

// إنشاء مدير الصوت العام
const audioManager = new AudioManager();