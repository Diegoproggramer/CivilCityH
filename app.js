// تنظیمات اولیه
let balance = 0;
let energy = 1000;
let maxEnergy = 1000;
let energyRechargeRate = 1; // مقدار انرژی که هر ثانیه پر می شود

// دریافت المنت‌ها از HTML
const balanceDisplay = document.getElementById('balance');
const energyDisplay = document.getElementById('energy');
const energyMaxDisplay = document.getElementById('max-energy');
const energyFill = document.getElementById('energy-fill');
const splashScreen = document.getElementById('splash-screen');
const coinBtn = document.getElementById('coin-btn');
const toast = document.getElementById('toast');

// تابع شروع برنامه
window.addEventListener('DOMContentLoaded', () => {
    // 1. بازیابی اطلاعات ذخیره شده کاربر
    const savedBalance = localStorage.getItem('civilBalance');
    const savedEnergy = localStorage.getItem('civilEnergy');
    const lastLogin = localStorage.getItem('lastLoginTime');

    if (savedBalance) balance = parseInt(savedBalance);
    if (savedEnergy) energy = parseInt(savedEnergy);

    // محاسبه انرژی پر شده در زمان غیبت کاربر
    if (lastLogin) {
        const now = Date.now();
        const diffSeconds = Math.floor((now - parseInt(lastLogin)) / 1000);
        const gainedEnergy = diffSeconds * energyRechargeRate;
        energy = Math.min(energy + gainedEnergy, maxEnergy);
    }

    updateUI();

    // 2. مخفی کردن صفحه لودینگ بعد از 2.5 ثانیه
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 500);
    }, 2500);

    // 3. شروع بازسازی انرژی
    setInterval(rechargeEnergy, 1000);
});

// تابع کلیک روی سکه
coinBtn.addEventListener('click', (e) => {
    if (energy > 0) {
        // افزایش سکه
        balance += 1;
        energy -= 1;
        
        // ویبره موبایل (Haptic Feedback)
        if (navigator.vibrate) navigator.vibrate(10);

        // نمایش عدد شناور (+1)
        showFloatingText(e.clientX, e.clientY);

        // انیمیشن کج شدن سکه
        const rect = coinBtn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        coinBtn.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg) scale(0.95)`;
        setTimeout(() => {
            coinBtn.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        }, 100);

        updateUI();
        saveData();
    } else {
        showToast("انرژی کافی نیست!");
    }
});

// تابع بازسازی انرژی
function rechargeEnergy() {
    if (energy < maxEnergy) {
        energy += energyRechargeRate;
        if (energy > maxEnergy) energy = maxEnergy;
        updateUI();
        saveData();
    }
}

// نمایش اعداد شناور هنگام کلیک
function showFloatingText(x, y) {
    const floatEl = document.createElement('div');
    floatEl.innerText = '+1';
    floatEl.className = 'floating-number';
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    document.body.appendChild(floatEl);

    setTimeout(() => {
        floatEl.remove();
    }, 1000);
}

// به‌روزرسانی ظاهر برنامه
function updateUI() {
    balanceDisplay.innerText = balance.toLocaleString();
    energyDisplay.innerText = Math.floor(energy);
    energyMaxDisplay.innerText = maxEnergy;
    
    // آپدیت نوار انرژی
    const percentage = (energy / maxEnergy) * 100;
    energyFill.style.width = `${percentage}%`;
}

// ذخیره در حافظه مرورگر
function saveData() {
    localStorage.setItem('civilBalance', balance);
    localStorage.setItem('civilEnergy', energy);
    localStorage.setItem('lastLoginTime', Date.now());
}

// مدیریت تب‌ها (Navigation)
window.switchTab = function(tabName) {
    // مخفی کردن همه ویوها
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

    // نمایش ویو انتخاب شده
    if (tabName === 'main') {
        document.getElementById('main-view').classList.add('active');
        document.querySelectorAll('.nav-item')[0].classList.add('active');
    } else if (tabName === 'boost') {
        document.getElementById('boost-view').classList.add('active');
        document.querySelectorAll('.nav-item')[1].classList.add('active');
    } else if (tabName === 'friends') {
        document.getElementById('friends-view').classList.add('active');
        document.querySelectorAll('.nav-item')[2].classList.add('active');
    }
}

// نمایش پیام کوتاه (Toast)
function showToast(message) {
    toast.innerText = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

// شبیه‌سازی خرید بوست (فعلا نمایشی)
window.buyBoost = function(type) {
    if (type === 'multitap' && balance >= 500) {
        balance -= 500;
        showToast("بوست خریداری شد!");
        updateUI();
    } else if (type === 'energy' && balance >= 1000) {
        balance -= 1000;
        maxEnergy += 500;
        energy = maxEnergy;
        showToast("مخزن انرژی ارتقا یافت!");
        updateUI();
    } else {
        showToast("سکه کافی ندارید!");
    }
}

