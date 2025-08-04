// Utility functions for the game
// Copyright © 2024 - جميع الحقوق محفوظة

// تحويل الدرجات إلى راديان
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// حساب المسافة بين نقطتين
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// توليد رقم عشوائي بين min و max
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// تحديد لون عشوائي
function randomColor() {
    const colors = ['#ff6b35', '#f7931e', '#ffd23f', '#ff4757', '#3742fa', '#2ed573', '#ff3838'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// تنسيق الوقت
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// حفظ البيانات في localStorage
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('خطأ في حفظ البيانات:', e);
        return false;
    }
}

// تحميل البيانات من localStorage
function loadData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('خطأ في تحميل البيانات:', e);
        return defaultValue;
    }
}

// تشفير بسيط للنقاط (منع الغش)
function encryptScore(score) {
    return btoa((score * 7 + 123).toString());
}

function decryptScore(encrypted) {
    try {
        return (parseInt(atob(encrypted)) - 123) / 7;
    } catch (e) {
        return 0;
    }
}