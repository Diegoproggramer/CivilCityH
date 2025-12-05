// CivilCity Airdrop Logic - Full Integrated Version
// Developed by Tabriz University Civil Engineering Students

document.addEventListener('DOMContentLoaded', () => {
    
    // --- متغیرهای اصلی ---
    let balance = localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : 0;
    let energy = localStorage.getItem('energy') ? parseInt(localStorage.getItem('energy')) : 1000;
    const maxEnergy = 1000;
    let level = 1;
    let pph = localStorage.getItem('pph') ? parseInt(localStorage.getItem('pph')) : 0; // Profit Per Hour
    let lastSaveTime = localStorage.getItem('lastSaveTime') ? parseInt(localStorage.getItem('lastSaveTime')) : Date.now();

    // --- دیتابیس آیتم‌های بازار ---
    const marketItems = [
        { id: 'intern', name: 'کارآموز ساده', profit: 100, basePrice: 500, icon: 'fa-user-graduate', level: 0 },
        { id: 'wheelbarrow', name: 'فرغون حرفه‌ای', profit: 250, basePrice: 1000, icon: 'fa-shopping-cart', level: 0 },
        { id: 'drill', name: 'دریل هیلتی', profit: 600, basePrice: 2500, icon: 'fa-hammer', level: 0 },
        { id: 'theodolite', name: 'دوربین نقشه‌برداری', profit: 1500, basePrice: 8000, icon: 'fa-camera', level: 0 },
        { id: 'mixer', name: 'تراک میکسر', profit: 4000, basePrice: 20000, icon: 'fa-truck-monster', level: 0 },
        { id: 'crane', name: 'تاور کرین', profit: 10000, basePrice: 50000, icon: 'fa-building', level: 0 }
    ];

    // --- المان‌های DOM ---
    const balanceEl = document.getElementById('balance');
    const energyEl = document.getElementById('energy-text');
    const energyFill = document.getElementById('energy-fill');
    const pphEl = document.getElementById('pph-value');
    const toastEl = document.getElementById('toast');
    
    // --- راه‌اندازی اولیه ---
    init();

    function init() {
        // 1. حذف لودینگ
        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            document.getElementById('app-container').style.display = 'flex';
            checkOfflineEarnings(); // بررسی درآمد زمان غیبت
        }, 2500);

        // 2. لود کردن لول آیتم‌های بازار
        marketItems.forEach(item => {
            const savedLvl = localStorage.getItem(`item_lvl_${item.id}`);
            if(savedLvl) item.level = parseInt(savedLvl);
        });

        // 3. بروزرسانی UI اولیه
        updateUI();
        renderMarket();

        // 4. شروع لوپ‌ها
        startEnergyRegen();
        startPassiveIncome();
        
        // 5. لیسنر کلیک اصلی
        document.getElementById('coin-btn').addEventListener('touchstart', handleTap);
        document.getElementById('coin-btn').addEventListener('click', handleTap); // Fallback for desktop
    }

    // --- توابع UI و ذخیره‌سازی ---
    function updateUI() {
        balanceEl.innerText = balance.toLocaleString();
        energyEl.innerText = `${Math.floor(energy)} / ${maxEnergy}`;
        energyFill.style.width = `${(energy / maxEnergy) * 100}%`;
        pphEl.innerText = pph.toLocaleString();
    }

    function saveData() {
        localStorage.setItem('balance', balance);
        localStorage.setItem('energy', energy);
        localStorage.setItem('pph', pph);
        localStorage.setItem('lastSaveTime', Date.now());
    }

    function showToast(msg) {
        toastEl.innerText = msg;
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 2000);
    }

    // --- لاجیک کلیک (Mining) ---
    function handleTap(e) {
        e.preventDefault(); // جلوگیری از زوم دبل کلیک
        if (energy >= 1) {
            const tapPower = 1 + Math.floor(pph / 10000); // قدرت کلیک کمی با pph زیاد میشه
            balance += tapPower;
            energy -= 1;
            updateUI();
            
            // ویبره کوچک
            if(navigator.vibrate) navigator.vibrate(10); 
            
            // انیمیشن شناور (Floating Text) - ساده شده
            const rect = e.target.getBoundingClientRect();
            showFloatingText(rect.left + rect.width/2, rect.top, `+${tapPower}`);
        }
    }
    
    function showFloatingText(x, y, text) {
        const el = document.createElement('div');
        el.innerText = text;
        el.style.position = 'fixed';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.color = '#fff';
        el.style.fontWeight = 'bold';
        el.style.pointerEvents = 'none';
        el.style.transition = 'all 0.5s ease-out';
        document.body.appendChild(el);
        
        setTimeout(() => {
            el.style.transform = 'translateY(-50px)';
            el.style.opacity = '0';
        }, 10);
        
        setTimeout(() => el.remove(), 500);
    }

    // --- سیستم انرژی و سود خودکار ---
    function startEnergyRegen() {
        setInterval(() => {
            if (energy < maxEnergy) {
                energy += 1;
                updateUI();
            }
        }, 1000);
    }

    function startPassiveIncome() {
        // پرداخت سود هر 3 ثانیه
        setInterval(() => {
            if (pph > 0) {
                const profitPerSec = pph / 3600;
                balance += (profitPerSec * 3); // چون 3 ثانیه صبر کردیم
                updateUI();
                saveData(); // سیو مداوم برای جلوگیری از پریدن دیتا
            }
        }, 3000);
    }

    // --- سیستم بازار (Market System) ---
    function renderMarket() {
        const grid = document.getElementById('market-grid');
        grid.innerHTML = '';

        marketItems.forEach(item => {
            // فرمول قیمت: BasePrice * (1.6 ^ Level)
            let price = Math.floor(item.basePrice * Math.pow(1.6, item.level));
            let canBuy = balance >= price;
            
            const card = document.createElement('div');
            card.className = 'market-card';
            card.innerHTML = `
                <div class="m-icon"><i class="fas ${item.icon}"></i></div>
                <div class="m-info">
                    <h4>${item.name}</h4>
                    <p>سود: +${item.profit}/ساعت</p>
                    <span class="m-lvl">لول: ${item.level}</span>
                </div>
                <button class="m-buy-btn ${canBuy ? 'active' : ''}" onclick="window.buyItem('${item.id}')">
                    <span class="price-tag">${formatNum(price)}</span>
                    <span class="coin-label">سکه</span>
                </button>
            `;
            grid.appendChild(card);
        });
    }

    // تابع گلوبال برای دکمه خرید
    window.buyItem = function(id) {
        const item = marketItems.find(i => i.id === id);
        if(!item) return;

        let price = Math.floor(item.basePrice * Math.pow(1.6, item.level));

        if (balance >= price) {
            balance -= price;
            item.level++;
            pph += item.profit;
            
            // ذخیره تکی آیتم
            localStorage.setItem(`item_lvl_${item.id}`, item.level);
            
            updateUI();
            saveData();
            renderMarket(); // رندر دوباره برای آپدیت قیمت‌ها
            showToast(`${item.name} ارتقا یافت!`);
            if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
        } else {
            showToast('سکه کافی نیست!');
        }
    };

    function formatNum(num) {
        if(num >= 1000000) return (num/1000000).toFixed(1) + 'M';
        if(num >= 1000) return (num/1000).toFixed(1) + 'K';
        return num;
    }

    // --- سیستم آفلاین (Offline Earnings) ---
    function checkOfflineEarnings() {
        const now = Date.now();
        const diffSeconds = (now - lastSaveTime) / 1000;
        
        // اگر بیشتر از 60 ثانیه نبودن و pph دارند
        if (diffSeconds > 60 && pph > 0) {
            // حداکثر سود برای 3 ساعت (10800 ثانیه)
            const effectiveTime = Math.min(diffSeconds, 10800); 
            const earned = Math.floor((pph / 3600) * effectiveTime);
            
            if (earned > 0) {
                document.getElementById('offline-amount').innerText = `+${earned.toLocaleString()}`;
                document.getElementById('offline-modal').style.display = 'flex';
                
                // تابع دریافت (داخل مودال)
                window.claimOffline = function() {
                    balance += earned;
                    updateUI();
                    saveData();
                    document.getElementById('offline-modal').style.display = 'none';
                };
            }
        }
    }

    // --- ناوبری (Navigation) ---
    window.switchTab = function(tabId) {
        // مخفی کردن همه ویوها
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        // نمایش ویوی انتخاب شده
        document.getElementById(`${tabId}-view`).classList.add('active');
        
        // آپدیت اکتیو بودن دکمه‌ها
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        // پیدا کردن دکمه مربوطه (ساده‌سازی شده با ایندکس)
        const navMap = { 'home': 0, 'market': 1, 'tools': 2, 'earn': 3 };
        document.querySelectorAll('.nav-item')[navMap[tabId]].classList.add('active');
    };

    // --- ابزارها و تسک‌ها (Placeholder Logic) ---
    window.openTool = function(type) {
        const modal = document.getElementById('tool-modal');
        modal.style.display = 'flex';
        document.getElementById('modal-title').innerText = 'محاسبه حجم بتن';
    };

    window.closeModal = function() {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    };

    window.calculateConcrete = function() {
        const l = parseFloat(document.getElementById('inp-l').value);
        const w = parseFloat(document.getElementById('inp-w').value);
        const h = parseFloat(document.getElementById('inp-h').value);
        if(l && w && h) {
            document.getElementById('calc-result').innerHTML = 
                `<div style="margin-top:10px; color:#f1c40f;">حجم: ${(l*w*h).toFixed(2)} متر مکعب</div>`;
        }
    };
    
    window.completeTask = function(btn, reward) {
        if(btn.disabled) return;
        btn.innerText = 'در حال بررسی...';
        setTimeout(() => {
            balance += reward;
            updateUI();
            saveData();
            btn.innerText = 'انجام شد';
            btn.disabled = true;
            btn.style.background = '#2ecc71';
            showToast(`+${reward} سکه دریافت شد`);
        }, 2000);
    };
});
