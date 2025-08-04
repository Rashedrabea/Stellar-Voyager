// تحسينات آمنة للعبة - لا تؤثر على الأداء الأساسي

// 1. اهتزاز للموبايل (آمن)
function safeVibrate(duration = 100) {
    try {
        if (navigator.vibrate && window.innerWidth <= 768) {
            navigator.vibrate(duration);
        }
    } catch (e) {
        // تجاهل الأخطاء
    }
}

// 2. شاشة تحميل بسيطة
function showLoadingScreen() {
    const loading = document.createElement('div');
    loading.id = 'loading-screen';
    loading.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: linear-gradient(45deg, #000033, #000066); 
                    display: flex; flex-direction: column; justify-content: center; 
                    align-items: center; z-index: 9999; color: white;">
            <div style="font-size: 48px; margin-bottom: 20px;">🚀</div>
            <div style="font-size: 24px; margin-bottom: 30px;">المستكشف الفضائي</div>
            <div style="width: 200px; height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
                <div id="loading-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #00ff00, #0080ff); 
                                           transition: width 0.3s ease; border-radius: 2px;"></div>
            </div>
            <div style="margin-top: 15px; font-size: 14px; opacity: 0.8;">جاري التحميل...</div>
        </div>
    `;
    document.body.appendChild(loading);
    
    // محاكاة التحميل
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loading.remove();
            }, 500);
        }
        document.getElementById('loading-bar').style.width = progress + '%';
    }, 100);
}

// 3. تلميحات اللعب
const gameTips = [
    "💡 اجمع النجوم الذهبية لزيادة الوقود والنقاط",
    "💡 استخدم القوى الخاصة بحكمة في المواقف الصعبة", 
    "💡 تجنب الكويكبات والكواكب للبقاء على قيد الحياة",
    "💡 دمر الأعداء لزيادة نقاط الكومبو",
    "💡 وصل للمستوى 100 للفوز النهائي!"
];

function showRandomTip() {
    const tip = gameTips[Math.floor(Math.random() * gameTips.length)];
    const tipElement = document.createElement('div');
    tipElement.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.8); color: white; padding: 10px 20px;
        border-radius: 20px; font-size: 14px; z-index: 1000;
        animation: fadeInOut 4s ease-in-out;
    `;
    tipElement.textContent = tip;
    document.body.appendChild(tipElement);
    
    setTimeout(() => tipElement.remove(), 4000);
}

// 4. تحسين الأداء - تنظيف الذاكرة
function optimizePerformance() {
    setInterval(() => {
        if (!gameRunning) {
            // تنظيف المتغيرات غير المستخدمة
            if (typeof particles !== 'undefined' && particles.length > 200) {
                particles.splice(0, 100);
            }
            if (typeof thrustParticles !== 'undefined' && thrustParticles.length > 100) {
                thrustParticles.splice(0, 50);
            }
        }
    }, 10000);
}

// 5. حفظ إعدادات الصوت
function saveAudioSettings() {
    try {
        localStorage.setItem('audioSettings', JSON.stringify({
            muted: muted || false,
            musicVolume: musicVolume || 0.3,
            sfxVolume: sfxVolume || 0.5
        }));
    } catch (e) {
        // تجاهل أخطاء التخزين
    }
}

function loadAudioSettings() {
    try {
        const saved = localStorage.getItem('audioSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            if (typeof muted !== 'undefined') muted = settings.muted;
            if (typeof musicVolume !== 'undefined') musicVolume = settings.musicVolume;
            if (typeof sfxVolume !== 'undefined') sfxVolume = settings.sfxVolume;
        }
    } catch (e) {
        // تجاهل أخطاء التحميل
    }
}

// 6. إضافة CSS للتحسينات
const enhancementCSS = `
@keyframes fadeInOut {
    0%, 100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
    20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.game-tip {
    animation: fadeInOut 4s ease-in-out;
}

/* تحسين شكل الأزرار */
button:hover {
    transform: scale(1.05);
    transition: transform 0.2s ease;
}

button:active {
    transform: scale(0.95);
}
`;

// إضافة CSS للصفحة
const style = document.createElement('style');
style.textContent = enhancementCSS;
document.head.appendChild(style);

// تشغيل التحسينات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // عرض شاشة التحميل
    showLoadingScreen();
    
    // تحميل إعدادات الصوت
    loadAudioSettings();
    
    // تشغيل تحسين الأداء
    optimizePerformance();
    
    // عرض تلميح كل 30 ثانية
    setInterval(() => {
        if (!gameRunning) {
            showRandomTip();
        }
    }, 30000);
});

// حفظ الإعدادات عند إغلاق الصفحة
window.addEventListener('beforeunload', function() {
    saveAudioSettings();
});

// إضافة الاهتزاز للأحداث المهمة (سيتم ربطها لاحقاً)
window.safeVibrate = safeVibrate;

console.log('✨ تم تحميل التحسينات بنجاح!');